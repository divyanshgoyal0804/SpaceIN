import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import { mkdir, writeFile } from 'fs/promises';
import { createHash } from 'crypto';
import path from 'path';
import { getUploadPublicUrl, getUploadStorageDir } from '@/lib/upload-storage';
import { optimizeImage } from '@/lib/image-optimizer';
import { prisma } from '@/lib/prisma';

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder?: string;
};

function getCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
    folder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'sharkspace/uploads',
  };
}

function getCloudinarySignature(timestamp: number, apiSecret: string, folder?: string, resourceType?: string): string {
  const params: Record<string, string> = {};
  if (folder) params.folder = folder;
  if (resourceType) params.resource_type = resourceType;
  params.timestamp = String(timestamp);

  // Sort params alphabetically and build signature string
  const signatureBase = Object.keys(params)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&') + apiSecret;

  return createHash('sha1').update(signatureBase).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // CRIT-3: Enforce file size limit (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 413 }
      );
    }

    // CRIT-4: Validate file type against whitelist
    const ALLOWED_TYPES = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm',
    ];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type '${file.type}' is not allowed. Accepted: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const originalBuffer = Buffer.from(bytes);

    // 1. Generate Hash for Deduplication
    const hash = createHash('sha256').update(originalBuffer).digest('hex');

    // 2. Check if file already exists in DB
    const existingMedia = await prisma.media.findUnique({
      where: { hash }
    });

    if (existingMedia) {
      return NextResponse.json({
        url: existingMedia.url,
        filename: existingMedia.filename,
        size: existingMedia.sizeBytes,
        mimeType: existingMedia.mimeType,
        width: existingMedia.width,
        height: existingMedia.height,
        message: 'Duplicate prevented',
      });
    }

    let finalBuffer = originalBuffer;
    let finalExtension = path.extname(file.name) || '';
    let finalMimeType = file.type || 'application/octet-stream';
    let finalSize = file.size;
    let finalWidth: number | null = null;
    let finalHeight: number | null = null;

    const isImage = file.type.startsWith('image/') && !file.type.includes('svg');

    // 3. Optimize if it's an image
    if (isImage) {
      try {
        const optimized = await optimizeImage(originalBuffer);
        finalBuffer = Buffer.from(optimized.buffer);
        finalExtension = `.${optimized.format}`; // usually .webp
        finalMimeType = `image/${optimized.format}`;
        finalSize = optimized.size;
        finalWidth = optimized.width;
        finalHeight = optimized.height;
      } catch (optError) {
        console.error('Image optimization failed, falling back to original:', optError);
        // Fallback to original buffer if sharp fails for some reason (e.g. corrupt image)
      }
    }

    const baseName = sanitizeFilename(path.basename(file.name, path.extname(file.name)));
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${baseName}${finalExtension}`;

    let finalUrl = '';
    let storageType = 'local';
    let cloudPublicId = uniqueName;

    const cloudinaryConfig = getCloudinaryConfig();

    if (cloudinaryConfig) {
      try {
        const timestamp = Math.floor(Date.now() / 1000);
        const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
        const signature = getCloudinarySignature(timestamp, cloudinaryConfig.apiSecret, cloudinaryConfig.folder);

        const cloudinaryForm = new FormData();
        cloudinaryForm.append('file', new Blob([finalBuffer], { type: finalMimeType }), uniqueName);
        cloudinaryForm.append('api_key', cloudinaryConfig.apiKey);
        cloudinaryForm.append('timestamp', String(timestamp));
        cloudinaryForm.append('signature', signature);
        if (cloudinaryConfig.folder) {
          cloudinaryForm.append('folder', cloudinaryConfig.folder);
        }

        const uploadEndpoint = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/upload`;
        const cloudinaryResponse = await fetch(uploadEndpoint, { method: 'POST', body: cloudinaryForm });
        const cloudinaryPayload = await cloudinaryResponse.json();

        if (!cloudinaryResponse.ok) {
          throw new Error(`Cloudinary upload failed: ${JSON.stringify(cloudinaryPayload)}`);
        }

        finalUrl = cloudinaryPayload?.secure_url || cloudinaryPayload?.url;
        cloudPublicId = cloudinaryPayload?.public_id || uniqueName;
        
        if (!finalUrl) throw new Error('Cloudinary did not return a public URL');
        
        storageType = 'cloudinary';
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed, falling back to local storage:', cloudinaryError);
      }
    }

    // Fallback to Local Storage if Cloudinary fails or is not configured
    if (!finalUrl) {
      const uploadDir = getUploadStorageDir();
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, uniqueName);
      await writeFile(filePath, finalBuffer);
      finalUrl = getUploadPublicUrl(uniqueName);
    }

    // 4. Save Media record to DB
    await prisma.media.create({
      data: {
        filename: cloudPublicId,
        originalName: file.name,
        mimeType: finalMimeType,
        sizeBytes: finalSize,
        hash,
        url: finalUrl,
        width: finalWidth,
        height: finalHeight,
      }
    });

    return NextResponse.json({
      url: finalUrl,
      filename: cloudPublicId,
      size: finalSize,
      mimeType: finalMimeType,
      storage: storageType,
      width: finalWidth,
      height: finalHeight,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

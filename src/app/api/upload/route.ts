import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import { mkdir, writeFile } from 'fs/promises';
import { createHash } from 'crypto';
import path from 'path';
import { getUploadPublicUrl, getUploadStorageDir } from '@/lib/upload-storage';

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

    const uploadDir = getUploadStorageDir();
    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extension = path.extname(file.name) || '';
    const baseName = sanitizeFilename(path.basename(file.name, extension));
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${baseName}${extension}`;

    const cloudinaryConfig = getCloudinaryConfig();

    if (cloudinaryConfig) {
      try {
        const timestamp = Math.floor(Date.now() / 1000);

        // Determine resource type from MIME for proper Cloudinary handling
        const isVideo = file.type.startsWith('video/');
        const resourceType = isVideo ? 'video' : 'image';

        const signature = getCloudinarySignature(
          timestamp,
          cloudinaryConfig.apiSecret,
          cloudinaryConfig.folder
        );

        const cloudinaryForm = new FormData();
        cloudinaryForm.append(
          'file',
          new Blob([buffer], {
            type: file.type || 'application/octet-stream',
          }),
          uniqueName
        );
        cloudinaryForm.append('api_key', cloudinaryConfig.apiKey);
        cloudinaryForm.append('timestamp', String(timestamp));
        cloudinaryForm.append('signature', signature);
        if (cloudinaryConfig.folder) {
          cloudinaryForm.append('folder', cloudinaryConfig.folder);
        }

        // Use the specific resource type endpoint for reliable uploads
        const uploadEndpoint = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/upload`;

        const cloudinaryResponse = await fetch(
          uploadEndpoint,
          {
            method: 'POST',
            body: cloudinaryForm,
          }
        );

        const cloudinaryPayload = await cloudinaryResponse.json();

        if (!cloudinaryResponse.ok) {
          throw new Error(`Cloudinary upload failed: ${JSON.stringify(cloudinaryPayload)}`);
        }

        const cloudUrl = cloudinaryPayload?.secure_url || cloudinaryPayload?.url;

        if (!cloudUrl) {
          throw new Error('Cloudinary did not return a public URL');
        }

        return NextResponse.json({
          url: cloudUrl,
          filename: cloudinaryPayload?.public_id || uniqueName,
          size: file.size,
          mimeType: file.type,
          storage: 'cloudinary',
        });
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed, falling back to local storage:', cloudinaryError);
      }
    }

    const filePath = path.join(uploadDir, uniqueName);

    await writeFile(filePath, buffer);

    const publicUrl = getUploadPublicUrl(uniqueName);

    return NextResponse.json({
      url: publicUrl,
      filename: uniqueName,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

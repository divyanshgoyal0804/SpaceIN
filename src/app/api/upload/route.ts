import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { getUploadPublicUrl, getUploadStorageDir } from '@/lib/upload-storage';

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
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

import { NextRequest } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';
import { getUploadStorageDir } from '@/lib/upload-storage';

function getContentType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    case '.mp4':
      return 'video/mp4';
    case '.webm':
      return 'video/webm';
    case '.mov':
      return 'video/quicktime';
    case '.pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  if (!segments?.length) {
    return new Response('Not found', { status: 404 });
  }

  const baseDir = path.resolve(getUploadStorageDir());
  const requestedPath = path.resolve(baseDir, ...segments);

  if (requestedPath !== baseDir && !requestedPath.startsWith(`${baseDir}${path.sep}`)) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const file = await readFile(requestedPath);
    const fileStats = await stat(requestedPath);

    return new Response(file, {
      headers: {
        'Content-Type': getContentType(requestedPath),
        'Content-Length': String(fileStats.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
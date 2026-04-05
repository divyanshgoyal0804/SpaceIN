import path from 'path';
import { readFile, stat } from 'fs/promises';
import { getUploadStorageDir } from '@/lib/upload-storage';

const FALLBACK_IMAGE_CANDIDATES = [
  path.join(process.cwd(), 'public', 'images', 'property-fallback.svg'),
  path.join(process.cwd(), 'public', 'file.svg'),
];

function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.RAILWAY_ENVIRONMENT) ||
    Boolean(process.env.RAILWAY_PROJECT_ID)
  );
}

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

async function getFallbackImageResponse(): Promise<Response | null> {
  for (const fallbackPath of FALLBACK_IMAGE_CANDIDATES) {
    try {
      const fileStats = await stat(fallbackPath);
      if (!fileStats.isFile()) {
        continue;
      }

      const file = await readFile(fallbackPath);
      return new Response(file, {
        status: 200,
        headers: {
          'Content-Type': getContentType(fallbackPath),
          'Content-Length': String(fileStats.size),
          'Cache-Control': 'public, max-age=60',
          'X-Upload-Fallback': '1',
        },
      });
    } catch {
      // Try the next fallback candidate.
    }
  }

  return null;
}

export async function serveUploadPath(segments: string[]): Promise<Response> {
  if (!segments?.length) {
    return new Response('Not found', { status: 404 });
  }

  const baseDir = path.resolve(getUploadStorageDir());
  const requestedPath = path.resolve(baseDir, ...segments);

  if (requestedPath !== baseDir && !requestedPath.startsWith(`${baseDir}${path.sep}`)) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const fileStats = await stat(requestedPath);
    if (!fileStats.isFile()) {
      throw new Error('Requested path is not a file');
    }

    const file = await readFile(requestedPath);

    return new Response(file, {
      headers: {
        'Content-Type': getContentType(requestedPath),
        'Content-Length': String(fileStats.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    if (isProductionRuntime()) {
      const fallback = await getFallbackImageResponse();
      if (fallback) {
        return fallback;
      }
    }

    return new Response('Not found', { status: 404 });
  }
}

import path from 'path';

const defaultUploadDir = path.join(process.cwd(), 'public', 'uploads');

export function getUploadStorageDir(): string {
  return path.resolve(process.env.UPLOAD_STORAGE_DIR || defaultUploadDir);
}

export function getUploadPublicUrl(filename: string): string {
  const safeFilename = filename
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  const configuredBaseUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || '').replace(/\/$/, '');
  const relativeUrl = `/api/uploads/${safeFilename}`;

  return configuredBaseUrl ? `${configuredBaseUrl}${relativeUrl}` : relativeUrl;
}

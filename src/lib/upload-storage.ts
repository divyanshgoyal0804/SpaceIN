import path from 'path';

const defaultUploadDir = path.join(process.cwd(), 'public', 'uploads');

export function getUploadStorageDir(): string {
  return path.resolve(process.env.UPLOAD_STORAGE_DIR || defaultUploadDir);
}

export function getUploadPublicUrl(filename: string): string {
  return `/uploads/${filename}`;
}

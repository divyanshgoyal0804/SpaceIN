import { NextRequest } from 'next/server';
import { serveUploadPath } from '@/lib/serve-upload-file';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  return serveUploadPath(segments);
}
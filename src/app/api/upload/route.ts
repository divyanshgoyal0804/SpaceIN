import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';

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

    // For now, convert to base64 data URL as a fallback
    // In production, this should upload to Supabase Storage or Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // TODO: Replace with actual cloud storage upload
    // Example Supabase upload:
    // const { data, error } = await supabase.storage
    //   .from('property-images')
    //   .upload(`${Date.now()}-${file.name}`, buffer, { contentType: mimeType });
    // const url = supabase.storage.from('property-images').getPublicUrl(data.path).data.publicUrl;

    return NextResponse.json({
      url: dataUrl,
      filename: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

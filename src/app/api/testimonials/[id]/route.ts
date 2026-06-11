import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Arch-7: Reusable admin auth check
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();

    // Whitelist allowed fields
    const allowedFields: Record<string, unknown> = {};
    const ALLOWED_KEYS = ['name', 'role', 'company', 'quote', 'avatarUrl', 'isPublished'];
    for (const key of ALLOWED_KEYS) {
      if (body[key] !== undefined) {
        allowedFields[key] = body[key];
      }
    }

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: allowedFields,
    });

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    await prisma.testimonial.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
}

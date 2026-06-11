import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import { createRateLimiter, getClientIp } from '@/lib/rate-limit';
import { z } from 'zod/v4';

// CRIT-6: Rate limit inquiry submissions (5 per 15 minutes per IP)
const limiter = createRateLimiter('inquiries', { maxRequests: 5, windowMs: 15 * 60_000 });

// HIGH-2 + MED-10: Validate inquiry input with Zod including email validation
const InquirySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.email(),
  phone: z.string().min(5).max(20),
  message: z.string().min(1).max(5000),
  propertyId: z.string().max(100).nullable().optional(),
});

export async function POST(request: NextRequest) {
  // CRIT-6: Rate limiting
  const ip = getClientIp(request);
  const rateCheck = limiter.check(ip);
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: 'Too many inquiries. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    // Validate input
    const parseResult = InquirySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid inquiry data. Please check your input.' },
        { status: 400 }
      );
    }

    const validated = parseResult.data;

    const inquiry = await prisma.inquiry.create({
      data: {
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        message: validated.message,
        propertyId: validated.propertyId || null,
      },
    });

    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json({ error: 'Failed to create inquiry' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}

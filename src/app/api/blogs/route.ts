import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';

function toPlainTextContent(value: unknown): string {
  if (typeof value !== 'string') return '';

  return value
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|blockquote)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    const tag = searchParams.get('tag');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (published === 'true') {
      where.isPublished = true;
    }

    if (tag) {
      where.tags = { has: tag };
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blog.count({ where }),
    ]);

    return NextResponse.json({
      blogs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt,
        content: toPlainTextContent(body.content),
        coverImage: body.coverImage || null,
        tags: body.tags || [],
        author: body.author || 'SpaceIn Team',
        isPublished: body.isPublished || false,
        publishedAt: body.isPublished ? new Date() : null,
      },
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}

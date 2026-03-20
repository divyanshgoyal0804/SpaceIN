import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, User } from 'lucide-react';
import { calculateReadTime } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

interface BlogData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  tags: string[];
  author: string;
  publishedAt: string;
}

async function getBlog(slug: string): Promise<BlogData | null> {
  const blog = await prisma.blog.findUnique({
    where: { slug },
  });

  if (!blog) return null;
  return JSON.parse(JSON.stringify(blog));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) return { title: 'Post Not Found' };
  return {
    title: blog.title,
    description: blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      images: blog.coverImage ? [{ url: blog.coverImage }] : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) notFound();

  const readTime = calculateReadTime(blog.content);
  const shareText = encodeURIComponent(blog.title);
  const shareUrl = encodeURIComponent(`${process.env.NEXTAUTH_URL || 'https://spacein.in'}/blog/${blog.slug}`);

  return (
    <div className="blog-post-page">
      {blog.coverImage && (
        <div className="post-cover">
          <Image
            src={blog.coverImage}
            alt={blog.title}
            width={1200}
            height={500}
            priority
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </div>
      )}

      <article className="post-article page-container">
        <div className="post-tags">
          {blog.tags.map((tag) => (
            <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`} className="post-tag">
              {tag}
            </Link>
          ))}
        </div>

        <h1 className="post-title">{blog.title}</h1>

        <div className="post-meta">
          <span><User size={14} /> {blog.author}</span>
          <span><Calendar size={14} /> {new Date(blog.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span><Clock size={14} /> {readTime} min read</span>
        </div>

        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Share buttons */}
        <div className="post-share">
          <span>Share:</span>
          <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer">Twitter</a>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href={`https://wa.me/?text=${shareText}%20${shareUrl}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </div>
      </article>

      <style>{`
        .blog-post-page { padding-top: 64px; min-height: 100vh; }
        .post-cover { width: 100%; max-height: 400px; overflow: hidden; }
        .post-article { max-width: 720px; padding-top: 2rem; padding-bottom: 5rem; }
        .post-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 1rem; }
        .post-tag {
          font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
          padding: 0.25rem 0.6rem; border-radius: 4px; text-decoration: none;
          background: rgba(1,114,150,0.1); color: var(--accent);
          transition: background 0.2s ease;
        }
        .post-tag:hover { background: rgba(1,114,150,0.2); }
        .post-title { font-size: 2.5rem; margin-bottom: 1rem; line-height: 1.2; }
        .post-meta {
          display: flex; gap: 1.5rem; flex-wrap: wrap;
          font-size: 0.85rem; color: var(--text-muted); margin-bottom: 2.5rem;
          padding-bottom: 1.5rem; border-bottom: 1px solid var(--border);
        }
        .post-meta span { display: flex; align-items: center; gap: 0.35rem; }

        .post-content { line-height: 1.9; }
        .post-content :global(h2) { font-size: 1.5rem; margin: 2rem 0 1rem; }
        .post-content :global(h3) { font-size: 1.25rem; margin: 1.5rem 0 0.75rem; }
        .post-content :global(p) { margin-bottom: 1rem; }
        .post-content :global(ul), .post-content :global(ol) { padding-left: 1.5rem; margin-bottom: 1rem; }
        .post-content :global(li) { margin-bottom: 0.4rem; }
        .post-content :global(blockquote) {
          border-left: 3px solid var(--accent); padding-left: 1rem; margin: 1.5rem 0;
          color: var(--text-secondary); font-style: italic;
        }
        .post-content :global(strong) { color: var(--text-primary); }

        .post-share {
          display: flex; align-items: center; gap: 1rem;
          margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--border);
          font-size: 0.85rem; color: var(--text-muted);
        }
        .post-share a {
          color: var(--accent); text-decoration: none; font-weight: 500;
        }
        .post-share a:hover { text-decoration: underline; }

        @media (max-width: 768px) {
          .post-title { font-size: 1.75rem; }
        }
      `}</style>
    </div>
  );
}

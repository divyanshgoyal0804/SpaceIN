import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Insights, guides, and news about commercial real estate in Noida.',
};

interface BlogData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  tags: string[];
  author: string;
  publishedAt: string;
}

async function getBlogs(tag?: string) {
  const where: any = { isPublished: true };
  if (tag) {
    where.tags = { has: tag };
  }

  const blogs = await prisma.blog.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
  });

  return { blogs };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const resolved = await searchParams;
  const data = await getBlogs(resolved.tag);
  const blogs: BlogData[] = data.blogs || [];

  return (
    <div className="blog-page">
      <section className="blog-hero">
        <h1>Blog</h1>
        <p>Insights and guides for commercial real estate in Noida</p>
      </section>

      <div className="blog-grid page-container">
        {blogs.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
            <h3>No blog posts yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>Check back soon for updates!</p>
          </div>
        ) : (
          blogs.map((blog) => (
            <Link key={blog.id} href={`/blog/${blog.slug}`} className="blog-card card">
              {blog.coverImage && (
                <div className="blog-card__image">
                  <Image
                    src={blog.coverImage}
                    alt={blog.title}
                    width={400}
                    height={250}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                </div>
              )}
              <div className="blog-card__body">
                <div className="blog-card__tags">
                  {blog.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="blog-card__tag">{tag}</span>
                  ))}
                </div>
                <h3 className="blog-card__title">{blog.title}</h3>
                <p className="blog-card__excerpt">{blog.excerpt}</p>
                <div className="blog-card__meta">
                  <span>{blog.author}</span>
                  <span>{new Date(blog.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <style>{`
        .blog-page { padding-top: 64px; min-height: 100vh; }
        .blog-hero { text-align: center; padding: 5rem 2rem 3rem; }
        .blog-hero h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }

        .blog-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          padding-bottom: 5rem;
        }

        .blog-card { display: block; text-decoration: none; }
        .blog-card__image { aspect-ratio: 16/10; overflow: hidden; }
        .blog-card__body { padding: 1.25rem; }
        .blog-card__tags { display: flex; gap: 0.4rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
        .blog-card__tag {
          font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
          padding: 0.2rem 0.5rem; border-radius: 4px;
          background: rgba(1,114,150,0.1); color: var(--accent);
        }
        .blog-card__title { font-size: 1.1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem; }
        .blog-card__excerpt { font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 0.75rem;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .blog-card__meta { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); }

        @media (max-width: 768px) { .blog-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

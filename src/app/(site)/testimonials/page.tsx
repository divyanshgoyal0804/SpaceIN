import Image from 'next/image';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Client Testimonials',
  description: 'What clients say about Sharkspace.',
};

export default async function TestimonialsPage() {
  let testimonials: Array<{
    id: string;
    name: string;
    role: string | null;
    company: string | null;
    quote: string;
    avatarUrl: string | null;
  }> = [];

  try {
    const tableCheck = await prisma.$queryRaw<{ exists: string | null }[]>`
      SELECT to_regclass('public."Testimonial"')::text AS exists;
    `;
    const tableExists = tableCheck[0]?.exists;

    if (tableExists) {
      testimonials = await prisma.testimonial.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
      });
    }
  } catch (error) {
    console.error('Error fetching testimonials:', error);
  }

  function isValidAvatarSrc(value: string | null | undefined): value is string {
    if (!value) return false;

    const trimmed = value.trim();
    if (!trimmed) return false;

    if (trimmed.startsWith('/')) return true;

    try {
      const url = new URL(trimmed);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  return (
    <div className="testimonials-page">
      <section className="testimonials-hero">
        <h1>Client Testimonials</h1>
        <p>Real experiences from teams who found their workspace with Sharkspace.</p>
      </section>

      <div className="testimonials-grid page-container">
        {testimonials.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
            <h3>No testimonials yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>Check back soon for updates.</p>
          </div>
        ) : (
          testimonials.map((t) => {
            const safeAvatarUrl = t.avatarUrl?.trim();

            return (
            <div key={t.id} className="testimonial-card glass-card">
              <div className="testimonial-header">
                {isValidAvatarSrc(safeAvatarUrl) ? (
                  <div className="testimonial-avatar">
                    <Image
                      src={safeAvatarUrl}
                      alt={t.name}
                      width={64}
                      height={64}
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  </div>
                ) : (
                  <div className="testimonial-avatar fallback">
                    {t.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="testimonial-meta">
                  <div className="testimonial-name">{t.name}</div>
                  {(t.role || t.company) && (
                    <div className="testimonial-role">
                      {[t.role, t.company].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
              </div>
              <p className="testimonial-quote">“{t.quote}”</p>
            </div>
            );
          })
        )}
      </div>

      <style>{`
        .testimonials-page { padding-top: 64px; min-height: 100vh; }
        .testimonials-hero { text-align: center; padding: 5rem 2rem 3rem; }
        .testimonials-hero h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .testimonials-hero p { color: var(--text-secondary); }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          padding-bottom: 5rem;
        }

        .testimonial-card { display: flex; flex-direction: column; gap: 1rem; }
        .testimonial-header { display: flex; align-items: center; gap: 1rem; }
        .testimonial-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid var(--border);
        }
        .testimonial-avatar.fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(var(--accent-rgb), 0.15);
          color: var(--accent);
          font-weight: 700;
        }
        .testimonial-name { font-weight: 600; color: var(--text-primary); }
        .testimonial-role { font-size: 0.85rem; color: var(--text-muted); }
        .testimonial-quote { color: var(--text-secondary); line-height: 1.7; }

        @media (max-width: 900px) {
          .testimonials-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .testimonials-grid { grid-template-columns: 1fr; }
          .testimonials-hero h1 { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
}

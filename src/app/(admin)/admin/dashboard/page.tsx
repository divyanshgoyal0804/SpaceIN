import Link from 'next/link';
import { Building2, FileText, MessageSquare, Star } from 'lucide-react';
import { prisma } from '@/lib/prisma';

async function getDashboardStats() {
  try {
    const [totalProperties, totalBlogs, totalInquiries, featuredProperties] = await Promise.all([
      prisma.property.count({ where: { isActive: true } }),
      prisma.blog.count(),
      prisma.inquiry.count(),
      prisma.property.count({ where: { isActive: true, isFeatured: true } }),
    ]);

    return { totalProperties, totalBlogs, totalInquiries, featuredProperties };
  } catch {
    return { totalProperties: 0, totalBlogs: 0, totalInquiries: 0, featuredProperties: 0 };
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const cards = [
    { label: 'Active Properties', value: stats.totalProperties, icon: Building2, color: '#60a5fa', href: '/admin/properties' },
    { label: 'Published Blogs', value: stats.totalBlogs, icon: FileText, color: '#c084fc', href: '/admin/blogs' },
    { label: 'Total Inquiries', value: stats.totalInquiries, icon: MessageSquare, color: '#4ade80', href: '/admin/inquiries' },
    { label: 'Featured Properties', value: stats.featuredProperties, icon: Star, color: '#fbbf24', href: '/admin/properties' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>Dashboard</h1>

      <div className="stats-row">
        {cards.map((card, i) => (
          <Link key={i} href={card.href} className="stat-card glass-card" style={{ textDecoration: 'none' }}>
            <div className="stat-icon" style={{ background: `${card.color}15`, color: card.color }}>
              <card.icon size={24} />
            </div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </Link>
        ))}
      </div>

      <div className="dash-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <Link href="/admin/properties/new" className="btn-primary">+ Add Property</Link>
        <Link href="/admin/blogs/new" className="btn-secondary">+ New Blog Post</Link>
      </div>

      <style>{`
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }
        .stat-card { text-align: center; padding: 1.5rem; }
        .stat-icon {
          width: 48px; height: 48px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1rem;
        }
        .stat-value { font-size: 2rem; font-weight: 800; color: var(--text-primary); }
        .stat-label { font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem; }

        @media (max-width: 768px) {
          .stats-row { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}

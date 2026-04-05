'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  quote: string;
  isPublished: boolean;
  createdAt: string;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function fetchTestimonials() {
    const res = await fetch('/api/testimonials?limit=100');
    if (res.ok) {
      const data = await res.json();
      setTestimonials(data.testimonials || []);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this testimonial?')) return;
    const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Testimonial deleted');
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    } else {
      toast.error('Failed to delete');
    }
  }

  async function togglePublish(testimonial: Testimonial) {
    const res = await fetch(`/api/testimonials/${testimonial.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !testimonial.isPublished }),
    });
    if (res.ok) {
      toast.success(testimonial.isPublished ? 'Unpublished' : 'Published');
      setTestimonials((prev) =>
        prev.map((t) =>
          t.id === testimonial.id ? { ...t, isPublished: !t.isPublished } : t
        )
      );
    } else {
      toast.error('Failed to update');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem' }}>Testimonials</h1>
        <Link href="/admin/testimonials/new" className="btn-primary"><Plus size={18} /> New Testimonial</Link>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
      ) : testimonials.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>No testimonials yet</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {[t.role, t.company].filter(Boolean).join(' · ') || '—'}
                  </td>
                  <td>
                    <span style={{ color: t.isPublished ? 'var(--success)' : 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {t.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="action-btn" onClick={() => togglePublish(t)} title={t.isPublished ? 'Unpublish' : 'Publish'}>
                        {t.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button className="action-btn action-btn--danger" onClick={() => handleDelete(t.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .admin-table-wrap { overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        .admin-table th {
          text-align: left; padding: 0.75rem; font-size: 0.75rem;
          text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted);
          border-bottom: 1px solid var(--border);
        }
        .admin-table td { padding: 0.75rem; border-bottom: 1px solid var(--border); color: var(--text-secondary); }
        .admin-table tr:hover td { background: var(--glass-bg); }
        .action-btn {
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 8px;
          border: 1px solid var(--border); background: transparent;
          color: var(--text-secondary); cursor: pointer; transition: all 0.2s; text-decoration: none;
        }
        .action-btn:hover { background: var(--glass-bg); color: var(--text-primary); }
        .action-btn--danger:hover { background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.2); }
      `}</style>
    </div>
  );
}

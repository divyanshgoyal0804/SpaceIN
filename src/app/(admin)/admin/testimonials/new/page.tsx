'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function NewTestimonialPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    role: '',
    company: '',
    quote: '',
    avatarUrl: '',
    isPublished: false,
  });
  const [loading, setLoading] = useState(false);

  function handleChange(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          avatarUrl: form.avatarUrl || null,
        }),
      });

      if (res.ok) {
        toast.success('Testimonial created!');
        router.push('/admin/testimonials');
      } else {
        toast.error('Failed to create testimonial');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>New Testimonial</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="form-group">
          <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>Client Name *</label>
          <input className="input-field" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>Role</label>
            <input className="input-field" value={form.role} onChange={(e) => handleChange('role', e.target.value)} placeholder="Founder, Operations Lead" />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>Company</label>
            <input className="input-field" value={form.company} onChange={(e) => handleChange('company', e.target.value)} placeholder="Company name" />
          </div>
        </div>
        <div className="form-group">
          <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>Quote *</label>
          <textarea className="input-field" rows={4} value={form.quote} onChange={(e) => handleChange('quote', e.target.value)} required style={{ resize: 'vertical' }} />
        </div>
        <div className="form-group">
          <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>Avatar URL</label>
          <input className="input-field" value={form.avatarUrl} onChange={(e) => handleChange('avatarUrl', e.target.value)} placeholder="https://..." />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={form.isPublished} onChange={(e) => handleChange('isPublished', e.target.checked)} />
          Publish immediately
        </label>
        <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0.9rem 2rem', fontSize: '1rem', width: 'fit-content' }}>
          {loading ? 'Creating...' : 'Create Testimonial'}
        </button>
      </form>
    </div>
  );
}

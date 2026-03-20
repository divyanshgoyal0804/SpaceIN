'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { generateSlug } from '@/lib/utils';

export default function NewBlogPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    tags: '',
    author: 'SpaceIn Team',
    isPublished: false,
  });
  const [loading, setLoading] = useState(false);

  function handleChange(key: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          slug: form.slug || generateSlug(form.title),
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
          coverImage: form.coverImage || null,
        }),
      });

      if (res.ok) {
        toast.success('Blog post created!');
        router.push('/admin/blogs');
      } else {
        toast.error('Failed to create post');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>New Blog Post</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="form-group">
          <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>Title *</label>
          <input className="input-field" value={form.title} onChange={e => handleChange('title', e.target.value)} onBlur={() => { if (!form.slug) handleChange('slug', generateSlug(form.title)); }} required />
        </div>
        <div className="form-group">
          <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>Slug</label>
          <input className="input-field" value={form.slug} onChange={e => handleChange('slug', e.target.value)} />
        </div>
        <div className="form-group">
          <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>Excerpt *</label>
          <textarea className="input-field" rows={2} value={form.excerpt} onChange={e => handleChange('excerpt', e.target.value)} required style={{ resize: 'vertical' }} />
        </div>
        <div className="form-group">
          <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>Content (HTML) *</label>
          <textarea className="input-field" rows={12} value={form.content} onChange={e => handleChange('content', e.target.value)} required style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem' }} placeholder="<h2>Section Title</h2><p>Your content here...</p>" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>Cover Image URL</label>
            <input className="input-field" value={form.coverImage} onChange={e => handleChange('coverImage', e.target.value)} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>Tags (comma separated)</label>
            <input className="input-field" value={form.tags} onChange={e => handleChange('tags', e.target.value)} placeholder="market, trends, noida" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={form.isPublished} onChange={e => handleChange('isPublished', e.target.checked)} />
            Publish immediately
          </label>
        </div>
        <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0.9rem 2rem', fontSize: '1rem', width: 'fit-content' }}>
          {loading ? 'Creating...' : 'Create Blog Post'}
        </button>
      </form>
    </div>
  );
}

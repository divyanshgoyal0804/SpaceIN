'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface Blog {
  id: string;
  title: string;
  slug: string;
  author: string;
  isPublished: boolean;
  publishedAt: string | null;
  tags: string[];
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  async function fetchBlogs() {
    const res = await fetch('/api/blogs?limit=100');
    if (res.ok) {
      const data = await res.json();
      setBlogs(data.blogs || []);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this blog post?')) return;
    const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Blog deleted');
      setBlogs(prev => prev.filter(b => b.id !== id));
    } else {
      toast.error('Failed to delete');
    }
  }

  async function togglePublish(blog: Blog) {
    const res = await fetch(`/api/blogs/${blog.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !blog.isPublished }),
    });
    if (res.ok) {
      toast.success(blog.isPublished ? 'Unpublished' : 'Published');
      setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, isPublished: !b.isPublished } : b));
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem' }}>Blog Posts</h1>
        <Link href="/admin/blogs/new" className="btn-primary"><Plus size={18} /> New Post</Link>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
      ) : blogs.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>No blog posts yet</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Tags</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map(blog => (
                <tr key={blog.id}>
                  <td style={{ fontWeight: 600 }}>{blog.title}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{blog.author}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {blog.tags.slice(0, 3).map(tag => (
                        <span key={tag} style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(1,114,150,0.1)', color: 'var(--accent)' }}>{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span style={{ color: blog.isPublished ? 'var(--success)' : 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {blog.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="action-btn" onClick={() => togglePublish(blog)} title={blog.isPublished ? 'Unpublish' : 'Publish'}>
                        {blog.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <Link href={`/admin/blogs/${blog.id}/edit`} className="action-btn"><Pencil size={16} /></Link>
                      <button className="action-btn action-btn--danger" onClick={() => handleDelete(blog.id)}><Trash2 size={16} /></button>
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
        .admin-table th { text-align: left; padding: 0.75rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); border-bottom: 1px solid var(--border); }
        .admin-table td { padding: 0.75rem; border-bottom: 1px solid var(--border); color: var(--text-secondary); }
        .admin-table tr:hover td { background: var(--glass-bg); }
        .action-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; text-decoration: none; }
        .action-btn:hover { background: var(--glass-bg); color: var(--text-primary); }
        .action-btn--danger:hover { background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.2); }
      `}</style>
    </div>
  );
}

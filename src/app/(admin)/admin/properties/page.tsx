'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { propertyTypeLabels } from '@/lib/utils';

interface Property {
  id: string;
  title: string;
  type: string;
  listingType: string;
  price: number | null;
  rentPerMonth: number | null;
  location: string;
  mainImageUrl: string;
  isActive: boolean;
  isFeatured: boolean;
}

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    const res = await fetch('/api/properties?limit=100');
    if (res.ok) {
      const data = await res.json();
      setProperties(data.properties || []);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this property?')) return;
    const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Property deleted');
      setProperties(prev => prev.filter(p => p.id !== id));
    } else {
      toast.error('Failed to delete');
    }
  }

  const filtered = properties.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem' }}>Properties</h1>
        <Link href="/admin/properties/new" className="btn-primary">
          <Plus size={18} /> Add Property
        </Link>
      </div>

      <div style={{ marginBottom: '1rem', position: 'relative', maxWidth: '320px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search properties..."
          className="input-field"
          style={{ paddingLeft: '36px' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Type</th>
                <th>Listing</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Image src={p.mainImageUrl} alt={p.title} width={60} height={45} style={{ objectFit: 'cover', borderRadius: '6px' }} />
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.title}</td>
                  <td>
                    <span className={`badge badge-${p.type.toLowerCase()}`}>
                      {propertyTypeLabels[p.type]}
                    </span>
                  </td>
                  <td>{p.listingType}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{p.location}</td>
                  <td>
                    <span style={{ color: p.isActive ? 'var(--success)' : 'var(--error)', fontSize: '0.85rem' }}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link href={`/admin/properties/${p.id}/edit`} className="action-btn">
                        <Pencil size={16} />
                      </Link>
                      <button className="action-btn action-btn--danger" onClick={() => handleDelete(p.id)}>
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
        .admin-table tbody tr:nth-child(even) td { background: var(--bg-secondary); }
        .admin-table tbody tr:nth-child(odd) td { background: var(--bg-primary); }
        .admin-table tr:hover td { background: var(--glass-bg); }

        .action-btn {
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 8px;
          border: 1px solid var(--border); background: transparent;
          color: var(--text-secondary); cursor: pointer; transition: all 0.2s ease; text-decoration: none;
        }
        .action-btn:hover { background: var(--glass-bg); color: var(--text-primary); }
        .action-btn--danger:hover { background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.2); }
      `}</style>
    </div>
  );
}

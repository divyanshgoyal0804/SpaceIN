'use client';

import { useEffect, useState } from 'react';
import { Mail, Phone, Calendar, Building2 } from 'lucide-react';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId: string | null;
  createdAt: string;
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInquiries() {
      const res = await fetch('/api/inquiries');
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
      }
      setLoading(false);
    }
    fetchInquiries();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>Inquiries</h1>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
      ) : inquiries.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <MessageSquareIcon />
          <p style={{ marginTop: '1rem' }}>No inquiries yet</p>
        </div>
      ) : (
        <div className="inquiries-grid">
          {inquiries.map(inq => (
            <div key={inq.id} className="inquiry-card glass-card">
              <div className="inquiry-header">
                <h3>{inq.name}</h3>
                <span className="inquiry-date">
                  <Calendar size={14} />
                  {new Date(inq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="inquiry-contacts">
                <a href={`mailto:${inq.email}`}><Mail size={14} /> {inq.email}</a>
                <a href={`tel:${inq.phone}`}><Phone size={14} /> {inq.phone}</a>
              </div>
              {inq.propertyId && (
                <div className="inquiry-property">
                  <Building2 size={14} /> Property Inquiry
                </div>
              )}
              {inq.message && (
                <p className="inquiry-message">{inq.message}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .inquiries-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1rem;
        }
        .inquiry-card { display: flex; flex-direction: column; gap: 0.75rem; }
        .inquiry-header { display: flex; justify-content: space-between; align-items: center; }
        .inquiry-header h3 { font-size: 1rem; }
        .inquiry-date { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.35rem; }
        .inquiry-contacts { display: flex; flex-direction: column; gap: 0.35rem; }
        .inquiry-contacts a { font-size: 0.85rem; color: var(--text-secondary); text-decoration: none; display: flex; align-items: center; gap: 0.4rem; }
        .inquiry-contacts a:hover { color: var(--accent); }
        .inquiry-property { font-size: 0.8rem; color: var(--accent); display: flex; align-items: center; gap: 0.35rem; }
        .inquiry-message { font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; border-top: 1px solid var(--border); padding-top: 0.75rem; }
      `}</style>
    </div>
  );
}

function MessageSquareIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-muted)', margin: '0 auto' }}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

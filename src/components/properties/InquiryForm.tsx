'use client';

import { useState } from 'react';

export default function InquiryForm({
  propertyId,
  propertyTitle,
}: {
  propertyId: string;
  propertyTitle: string;
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value.trim(),
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value.trim(),
      propertyId,
    };

    if (!data.name || !data.email || !data.phone) {
      setStatus('error');
      return;
    }

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus('success');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="inquiry-sidebar">
      <div className="inquiry-card glass-card">
        <h3 style={{ marginBottom: '0.25rem' }}>Interested in this property?</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          {propertyTitle}
        </p>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
            <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Inquiry Sent!</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              We&apos;ll get back to you shortly.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="btn-secondary"
              style={{ marginTop: '1rem', fontSize: '0.85rem' }}
            >
              Send Another
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <input type="text" name="name" placeholder="Your Name" className="input-field" required />
            <input type="email" name="email" placeholder="Email Address" className="input-field" required />
            <input type="tel" name="phone" placeholder="Phone Number" className="input-field" required />
            <textarea
              name="message"
              placeholder="Your message..."
              className="input-field"
              rows={3}
              style={{ resize: 'vertical' }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%' }}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Sending...' : 'Send Inquiry'}
            </button>
            {status === 'error' && (
              <p style={{ fontSize: '0.8rem', color: 'var(--error-text)', textAlign: 'center' }}>
                Failed to send. Please check your details and try again.
              </p>
            )}
          </form>
        )}
      </div>

      <style>{`
        .inquiry-sidebar {
          width: 360px;
          flex-shrink: 0;
          position: sticky;
          top: 80px;
          height: fit-content;
        }

        @media (max-width: 768px) {
          .inquiry-sidebar {
            width: 100%;
            position: static;
          }
        }
      `}</style>
    </div>
  );
}

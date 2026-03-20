'use client';

import { useState, FormEvent } from 'react';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Metadata } from 'next';

const contactInfo = [
  { icon: Phone, label: '+91 9XXXXXXXXX', href: 'tel:+919XXXXXXXXX' },
  { icon: Mail, label: 'hello@spacein.in', href: 'mailto:hello@spacein.in' },
  { icon: MessageCircle, label: 'WhatsApp', href: 'https://wa.me/919XXXXXXXXX' },
  { icon: MapPin, label: 'Noida, Uttar Pradesh, India', href: '#' },
];

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      message: formData.get('message') as string,
    };

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <h1>Contact Us</h1>
        <p>Have a question? We&apos;d love to hear from you.</p>
      </section>

      <div className="contact-grid page-container">
        {/* Form */}
        <div className="contact-form-wrap">
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" className="input-field" placeholder="Your name" required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" className="input-field" placeholder="you@example.com" required />
              </div>
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" name="phone" className="input-field" placeholder="+91 XXXXX XXXXX" required />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea name="message" className="input-field" rows={5} placeholder="Tell us what you're looking for..." required style={{ resize: 'vertical' }} />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="contact-info">
          <h3 style={{ marginBottom: '1.5rem' }}>Get in Touch</h3>
          <div className="info-list">
            {contactInfo.map((item, i) => (
              <a key={i} href={item.href} className="info-item glass-card" target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                <div className="info-icon">
                  <item.icon size={20} />
                </div>
                <span>{item.label}</span>
              </a>
            ))}
          </div>

          {/* Map placeholder */}
          <div className="map-embed">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56062.89749191!2d77.3!3d28.57!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5a43173357b%3A0x37ffce30c87cc03f!2sNoida%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="250"
              style={{ border: 'none', borderRadius: '12px', opacity: 0.8 }}
              allowFullScreen
              loading="lazy"
              title="SpaceIn Location"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .contact-page {
          padding-top: 64px;
          min-height: 100vh;
        }

        .contact-hero {
          text-align: center;
          padding: 5rem 2rem 3rem;
        }

        .contact-hero h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 3rem;
          padding-bottom: 5rem;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .form-group label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .info-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          text-decoration: none;
          color: var(--text-secondary);
          transition: color 0.2s ease;
        }

        .info-item:hover {
          color: var(--accent);
        }

        .info-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(var(--accent-rgb), 0.1);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

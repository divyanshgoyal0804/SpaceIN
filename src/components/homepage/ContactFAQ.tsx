'use client';

import { useState } from 'react';
import styles from './ContactFAQ.module.css';

const faqs = [
  {
    q: 'What types of commercial spaces can I find on your platform?',
    a: 'We offer coworking spaces, managed offices, leased offices, bare shell properties, and warehouses — all in one place to suit businesses of every size.',
  },
  {
    q: 'How is your platform different from traditional brokers?',
    a: 'We provide a centralized, transparent experience with multiple verified options, saving you time and eliminating the hassle of dealing with multiple brokers.',
  },
  {
    q: 'Is there any brokerage or hidden cost involved?',
    a: 'No hidden charges. All costs are clearly communicated upfront, and many listings come with zero brokerage.',
  },
  {
    q: 'Can I customize my office space based on my requirements?',
    a: 'Yes. Options like managed and bare shell offices allow full customization — from layout and interiors to branding and infrastructure.',
  },
  {
    q: 'What lease flexibility do you offer across different spaces?',
    a: 'Coworking spaces offer flexible monthly plans, while leased and bare shell offices typically require longer-term commitments.',
  },
  {
    q: 'Do you assist with site visits and finalizing the property?',
    a: 'Absolutely. We help you shortlist, schedule site visits, and support you through the final decision-making process.',
  },
];

export default function ContactFAQ() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value.trim(),
      message: `GENERAL HOMEPAGE INQUIRY: ${(form.elements.namedItem('message') as HTMLTextAreaElement).value.trim()}`,
      propertyId: '', // General inquiry
    };

    if (!data.name || !data.phone) {
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
    <section className={styles.section} id="contact">
      <div className={styles.container}>
        {/* Left Column - Contact Form */}
        <div className={styles.leftColumn}>
          <div className={styles.eyebrow}>LET'S TALK</div>
          <h2 className={styles.title}>Have a specific requirement?</h2>
          <p className={styles.description}>
            Drop your details below and our team will get back to you with custom options within 2 hours.
          </p>

          {status === 'success' ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--accent)' }}>✓</div>
              <p style={{ fontWeight: 600, fontSize: '1.2rem', marginBottom: '0.5rem' }}>Message Received!</p>
              <p style={{ color: 'var(--text-muted)' }}>
                We'll be in touch shortly.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="btn-secondary"
                style={{ marginTop: '1.5rem' }}
              >
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="name" className={styles.label}>Name</label>
                <input type="text" id="name" name="name" className={styles.input} required placeholder="John Doe" />
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>Email Address</label>
                <input type="email" id="email" name="email" className={styles.input} required placeholder="john@company.com" />
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="phone" className={styles.label}>Phone Number</label>
                <input type="tel" id="phone" name="phone" className={styles.input} required placeholder="+91 98765 43210" />
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="message" className={styles.label}>Your Requirement</label>
                <textarea 
                  id="message" 
                  name="message" 
                  className={styles.textarea} 
                  required 
                  placeholder="E.g., Looking for a 50-seater managed office in Sector 62..."
                ></textarea>
              </div>

              <button
                type="submit"
                className={`btn-primary ${styles.submitBtn}`}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Sending...' : 'Request Options'}
              </button>
              
              {status === 'error' && (
                <p style={{ color: 'var(--error-text)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
          )}
        </div>

        {/* Right Column - FAQs */}
        <div className={styles.rightColumn}>
          <div className={styles.faqContainer}>
            <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
            
            {faqs.map((faq, idx) => (
              <details key={idx} className={styles.details}>
                <summary className={styles.summary}>
                  {faq.q}
                  <div className={styles.icon}></div>
                </summary>
                <div className={styles.answer}>
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Bot, CheckCircle, Eye } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about SpaceIn — India\'s premium platform for commercial real estate in Noida.',
};

const features = [
  { icon: CheckCircle, title: 'Verified Listings', desc: 'Every property is personally inspected and verified by our team before listing.' },
  { icon: Bot, title: 'AI-Powered Search', desc: 'Our AI assistant understands your requirements and matches you with the perfect space.' },
  { icon: Shield, title: 'Expert Guidance', desc: 'Our commercial real estate experts guide you through every step of the process.' },
  { icon: Eye, title: 'Transparent Pricing', desc: 'No hidden charges. Clear pricing with complete cost breakdowns for every property.' },
];

const team = [
  { name: 'Rajesh Kumar', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face' },
  { name: 'Priya Sharma', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face' },
  { name: 'Amit Patel', role: 'Lead Developer', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face' },
];

export default function AboutPage() {
  return (
    <div className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <h1>About <span className="text-gradient">SpaceIn</span></h1>
        <p>We&apos;re building India&apos;s most trusted platform for commercial real estate.</p>
      </section>

      {/* Mission */}
      <section className="about-mission page-container">
        <div className="mission-content">
          <h2>Our Mission</h2>
          <p>
            SpaceIn was born from a simple idea: finding commercial space in India shouldn&apos;t be complicated.
            We aggregate the best commercial properties in Noida — from modern office spaces to large warehouses —
            and make them discoverable through cutting-edge technology, including AI-powered search.
          </p>
          <p>
            Our platform serves businesses of all sizes, from solo entrepreneurs looking for coworking desks
            to enterprises seeking entire office floors. Every listing is handpicked and verified by our team.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="about-features page-container section-padding">
        <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Why SpaceIn</h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card glass-card">
              <div className="feature-icon">
                <f.icon size={24} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="about-team page-container section-padding">
        <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Our Team</h2>
        <div className="team-grid">
          {team.map((t, i) => (
            <div key={i} className="team-card">
              <div className="team-image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.image} alt={t.name} />
              </div>
              <h4>{t.name}</h4>
              <p>{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta section-padding">
        <div className="page-container" style={{ textAlign: 'center' }}>
          <h2>Ready to find your space?</h2>
          <p style={{ marginBottom: '2rem' }}>Browse our curated selection of commercial properties in Noida.</p>
          <Link href="/properties" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
            Explore Properties
          </Link>
        </div>
      </section>

      <style>{`
        .about-page {
          padding-top: 64px;
        }

        .about-hero {
          text-align: center;
          padding: 5rem 2rem 3rem;
        }

        .about-hero h1 {
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          margin-bottom: 1rem;
        }

        .about-hero p {
          font-size: 1.2rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .mission-content {
          max-width: 700px;
          margin: 0 auto;
          text-align: center;
        }

        .mission-content h2 {
          margin-bottom: 1.5rem;
        }

        .mission-content p {
          margin-bottom: 1rem;
          line-height: 1.8;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .feature-card {
          text-align: center;
        }

        .feature-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: rgba(var(--accent-rgb), 0.1);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .feature-card h3 {
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }

        .feature-card p {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .team-card {
          text-align: center;
        }

        .team-image {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          margin: 0 auto 1rem;
          border: 3px solid var(--border);
        }

        .team-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .team-card h4 {
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }

        .team-card p {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .about-cta {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
        }

        @media (max-width: 768px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .team-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

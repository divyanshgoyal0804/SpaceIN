'use client';

import Link from 'next/link';
import { Building2, ShieldCheck, MapPin } from 'lucide-react';
import HeroSearch from '@/components/homepage/HeroSearch';

const features = [
  {
    icon: ShieldCheck,
    title: 'Verified Listings',
    description:
      'Every property is personally inspected and verified. No fake listings, no wasted time.',
  },
  {
    icon: Building2,
    title: 'Premium Spaces',
    description:
      'Handpicked commercial properties — offices, coworking, retail, warehouses, and showrooms.',
  },
  {
    icon: MapPin,
    title: 'Prime Locations',
    description:
      'Strategic locations across Noida with excellent connectivity and infrastructure.',
  },
];

export default function HomePage() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__container">
          <p className="hero__eyebrow">Premium Commercial Real Estate</p>
          <h1 className="hero__headline">
            Your City. Your <span className="hero__accent">Space.</span> Your
            Business.
          </h1>
          <p className="hero__sub">
            Discover handpicked commercial spaces in Noida — verified, ready, and
            perfect for your business.
          </p>
          <HeroSearch />
          <div className="hero__cta" style={{ marginTop: '32px' }}>
            <Link href="/properties" className="btn-primary hero__btn">
              Explore Spaces
            </Link>
            <Link href="/contact" className="btn-secondary hero__btn">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features__container">
          <h2 className="features__title">Why SpaceIn?</h2>
          <p className="features__subtitle">
            We take the complexity out of finding your next commercial space.
          </p>
          <div className="features__grid">
            {features.map((feature) => (
              <div key={feature.title} className="feature-card glass-card">
                <div className="feature-card__icon">
                  <feature.icon size={28} strokeWidth={1.5} />
                </div>
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__desc">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="cta-banner__container">
          <h2 className="cta-banner__title">
            Ready to find your perfect space?
          </h2>
          <p className="cta-banner__sub">
            Browse our curated listings or chat with our AI assistant for
            personalized recommendations.
          </p>
          <div className="cta-banner__actions">
            <Link href="/properties" className="btn-primary">
              Browse Properties
            </Link>
            <Link href="/chat" className="btn-secondary">
              Chat with AI
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .home {
          padding-top: 72px;
        }

        /* ---- Hero ---- */
        .hero {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            170deg,
            var(--bg-primary) 0%,
            var(--bg-secondary) 100%
          );
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: -40%;
          right: -20%;
          width: 600px;
          height: 600px;
          background: radial-gradient(
            circle,
            rgba(163, 145, 113, 0.08) 0%,
            transparent 70%
          );
          pointer-events: none;
        }

        .hero__container {
          max-width: 800px;
          margin: 0 auto;
          padding: 4rem 1.5rem;
          text-align: center;
          position: relative;
          z-index: 1;
          animation: heroFadeIn 0.8s ease forwards;
        }

        .hero__eyebrow {
          display: inline-block;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--accent);
          margin-bottom: 1.5rem;
          padding: 0.4rem 1rem;
          border: 1px solid rgba(163, 145, 113, 0.25);
          border-radius: 9999px;
          background: rgba(163, 145, 113, 0.06);
        }

        .hero__headline {
          font-size: clamp(2.5rem, 5.5vw, 4rem);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        .hero__accent {
          color: var(--accent);
        }

        .hero__sub {
          font-size: clamp(1rem, 2vw, 1.2rem);
          color: var(--text-secondary);
          max-width: 560px;
          margin: 0 auto 2.5rem;
          line-height: 1.7;
        }

        .hero__cta {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .hero__btn {
          padding: 0.85rem 2rem;
          font-size: 1rem;
        }

        /* ---- Features ---- */
        .features {
          padding: 6rem 1.5rem;
          background: var(--bg-primary);
        }

        .features__container {
          max-width: 1080px;
          margin: 0 auto;
          text-align: center;
        }

        .features__title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }

        .features__subtitle {
          color: var(--text-secondary);
          font-size: 1.05rem;
          margin-bottom: 3.5rem;
        }

        .features__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .feature-card {
          text-align: left;
          padding: 2rem;
        }

        .feature-card__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: rgba(163, 145, 113, 0.1);
          color: var(--accent);
          margin-bottom: 1.25rem;
        }

        .feature-card__title {
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .feature-card__desc {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* ---- CTA Banner ---- */
        .cta-banner {
          padding: 5rem 1.5rem;
          background: var(--bg-secondary);
        }

        .cta-banner__container {
          max-width: 700px;
          margin: 0 auto;
          text-align: center;
        }

        .cta-banner__title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .cta-banner__sub {
          color: var(--text-secondary);
          font-size: 1.05rem;
          margin-bottom: 2rem;
          line-height: 1.7;
        }

        .cta-banner__actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* ---- Animation ---- */
        @keyframes heroFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ---- Responsive ---- */
        @media (max-width: 768px) {
          .hero {
            min-height: 70vh;
          }

          .hero__container {
            padding: 3rem 1rem;
          }

          .features {
            padding: 4rem 1rem;
          }

          .features__grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }

          .cta-banner {
            padding: 3.5rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}

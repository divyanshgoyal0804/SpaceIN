'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const filterPills = ['Budget', 'Area', 'Type', 'Furnished'];

const mockCards = [
  { title: 'Premium Office · Sector 62', area: '2,400 sq ft', price: '₹85,000/mo', type: 'Office' },
  { title: 'Coworking Hub · Sector 63', area: '150 sq ft', price: '₹12,000/mo', type: 'Coworking' },
  { title: 'Retail Showroom · Sector 18', area: '1,800 sq ft', price: '₹1,50,000/mo', type: 'Retail' },
  { title: 'Auto Showroom · Sec 135', area: '5,000 sq ft', price: '₹4.5 Cr', type: 'Showroom' },
  { title: 'Warehouse · Sector 80', area: '8,000 sq ft', price: '₹2,00,000/mo', type: 'Warehouse' },
  { title: 'Commercial Plot · Sec 142', area: '12,000 sq ft', price: '₹8 Cr', type: 'Plot' },
];

export default function Scene7Platform() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=150%',
        pin: true,
        pinSpacing: true,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=150%',
          scrub: 1,
        },
      });

      // 1. Frame fades in
      tl.fromTo('.mock-frame', { opacity: 0 }, { opacity: 1, duration: 0.5 });

      // 2. Top nav slides down
      tl.fromTo('.mock-nav', { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 });

      // 3. Search bar expands
      tl.fromTo(
        '.mock-search',
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.4, transformOrigin: 'center' }
      );

      // 4. Filter pills slide in
      tl.fromTo(
        '.mock-pill',
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.08, duration: 0.2 }
      );

      // 5. Cards cascade
      tl.fromTo(
        '.mock-card',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.3 }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="platform-scene" data-scene="platform">
      <div className="platform-content">
        <h2 className="platform-heading">
          One platform. <span className="text-gradient">Every space.</span>
        </h2>

        <div className="mock-frame" style={{ opacity: 0 }}>
          {/* Nav bar */}
          <div className="mock-nav" style={{ opacity: 0 }}>
            <div className="mock-logo">SpaceIn</div>
            <div className="mock-nav-links">
              <span>Properties</span>
              <span>Blog</span>
              <span>About</span>
              <span className="mock-nav-highlight">Chat with AI</span>
            </div>
          </div>

          {/* Search */}
          <div className="mock-search" style={{ opacity: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <span>Search properties in Noida...</span>
          </div>

          {/* Filter pills */}
          <div className="mock-filters">
            {filterPills.map((pill, i) => (
              <div key={i} className="mock-pill" style={{ opacity: 0 }}>
                {pill}
              </div>
            ))}
          </div>

          {/* Property grid */}
          <div className="mock-grid">
            {mockCards.map((card, i) => (
              <div key={i} className="mock-card" style={{ opacity: 0 }}>
                <div className={`mock-card__image badge-${card.type.toLowerCase()}`}>
                  <span className="mock-card__badge">{card.type}</span>
                </div>
                <div className="mock-card__body">
                  <div className="mock-card__title">{card.title}</div>
                  <div className="mock-card__meta">
                    <span>{card.area}</span>
                    <span className="mock-card__price">{card.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .platform-scene {
          position: relative;
          height: 200vh;
          background: #050505;
          overflow: hidden;
        }

        .platform-content {
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          padding: 2rem;
        }

        .platform-heading {
          font-size: clamp(1.5rem, 3.5vw, 2.25rem);
          text-align: center;
          font-weight: 700;
        }

        .mock-frame {
          width: 100%;
          max-width: 900px;
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(8px);
        }

        .mock-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .mock-logo {
          font-weight: 800;
          font-size: 1.1rem;
          color: var(--text-primary);
        }

        .mock-nav-links {
          display: flex;
          gap: 1.25rem;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .mock-nav-highlight {
          color: var(--accent);
          font-weight: 600;
        }

        .mock-search {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 1rem 1.5rem;
          padding: 0.75rem 1rem;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 10px;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .mock-filters {
          display: flex;
          gap: 0.5rem;
          padding: 0 1.5rem;
          margin-bottom: 1rem;
        }

        .mock-pill {
          padding: 0.35rem 0.9rem;
          font-size: 0.8rem;
          border-radius: 20px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
        }

        .mock-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          padding: 0 1.5rem 1.5rem;
        }

        .mock-card {
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          background: var(--bg-card);
        }

        .mock-card__image {
          height: 80px;
          display: flex;
          align-items: flex-start;
          padding: 0.5rem;
          background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.08), rgba(var(--accent-rgb), 0.02));
        }

        .mock-card__badge {
          font-size: 0.6rem;
          font-weight: 600;
          text-transform: uppercase;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          background: rgba(0, 0, 0, 0.3);
          color: var(--accent);
        }

        .mock-card__body {
          padding: 0.75rem;
        }

        .mock-card__title {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.35rem;
        }

        .mock-card__meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .mock-card__price {
          color: var(--accent);
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .mock-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .mock-nav-links {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .mock-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}

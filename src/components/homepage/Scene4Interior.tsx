'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const cards = [
  { icon: '₹', text: '₹45/sq ft · Sector 62 Noida', sub: 'Starting rental price' },
  { icon: '⊞', text: '2,400 sq ft · Fully Furnished', sub: 'Premium workspace' },
  { icon: '✓', text: '24x7 Security · Power Backup · Parking', sub: 'Enterprise amenities' },
];

export default function Scene4Interior() {
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

      // Layer reveals
      ['#interior-desk', '#interior-people', '#interior-lights'].forEach((sel, i) => {
        gsap.fromTo(
          sel,
          { opacity: 0, y: 40 - i * 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: `top+=${i * 20}% top`,
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // Glass cards stagger
      gsap.fromTo(
        '.interior-card',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.7,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: section,
            start: 'top+=40% top',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="interior-scene" data-scene="interior">
      {/* Depth layers */}
      <div id="interior-desk" className="interior-layer interior-layer--desk" style={{ opacity: 0 }}>
        <div className="desk-bg" />
      </div>
      <div id="interior-people" className="interior-layer interior-layer--people" style={{ opacity: 0 }}>
        <div className="people-silhouettes">
          <div className="silhouette" style={{ left: '20%', height: '60%' }} />
          <div className="silhouette" style={{ left: '35%', height: '55%' }} />
          <div className="silhouette" style={{ left: '65%', height: '58%' }} />
          <div className="silhouette" style={{ left: '80%', height: '52%' }} />
        </div>
      </div>
      <div id="interior-lights" className="interior-layer interior-layer--lights" style={{ opacity: 0 }}>
        <div className="bokeh-overlay" />
      </div>

      {/* Floating glass cards */}
      <div className="interior-cards">
        {cards.map((card, i) => (
          <div key={i} className="interior-card glass-card">
            <div className="interior-card__icon">{card.icon}</div>
            <div>
              <div className="interior-card__text">{card.text}</div>
              <div className="interior-card__sub">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .interior-scene {
          position: relative;
          height: 200vh;
          background: #050505;
          overflow: hidden;
        }

        .interior-layer {
          position: absolute;
          inset: 0;
          will-change: transform, opacity;
        }

        .desk-bg {
          width: 100%;
          height: 100%;
          background: radial-gradient(
            ellipse at 50% 70%,
            rgba(var(--accent-rgb), 0.08) 0%,
            transparent 60%
          );
        }

        .people-silhouettes {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .silhouette {
          position: absolute;
          bottom: 20%;
          width: 40px;
          background: linear-gradient(to top, rgba(255,255,255,0.05), transparent);
          border-radius: 20px 20px 0 0;
        }

        .bokeh-overlay {
          width: 100%;
          height: 100%;
          background:
            radial-gradient(circle at 20% 30%, rgba(var(--accent-rgb), 0.06) 0%, transparent 30%),
            radial-gradient(circle at 70% 40%, rgba(96, 165, 250, 0.04) 0%, transparent 25%),
            radial-gradient(circle at 50% 70%, rgba(var(--accent-rgb), 0.05) 0%, transparent 35%),
            radial-gradient(circle at 80% 80%, rgba(192, 132, 252, 0.04) 0%, transparent 20%);
        }

        .interior-cards {
          position: absolute;
          bottom: 15%;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 1.25rem;
          z-index: 10;
          flex-wrap: wrap;
          justify-content: center;
          padding: 0 1rem;
        }

        .interior-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          border-radius: 14px;
          opacity: 0;
          min-width: 240px;
        }

        .interior-card__icon {
          font-size: 1.5rem;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: rgba(var(--accent-rgb), 0.1);
          color: var(--accent);
          flex-shrink: 0;
        }

        .interior-card__text {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .interior-card__sub {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 0.15rem;
        }

        @media (max-width: 768px) {
          .interior-cards {
            flex-direction: column;
            bottom: 10%;
          }

          .interior-card {
            min-width: auto;
          }
        }
      `}</style>
    </section>
  );
}

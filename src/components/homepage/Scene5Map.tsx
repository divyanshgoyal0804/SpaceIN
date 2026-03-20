'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

const pins = [
  { name: 'Sector 62', x: '45%', y: '30%', lat: 28.6272, lng: 77.3648 },
  { name: 'Sector 63', x: '52%', y: '35%', lat: 28.6235, lng: 77.3726 },
  { name: 'Sector 135', x: '60%', y: '55%', lat: 28.5172, lng: 77.3915 },
  { name: 'Sector 18', x: '35%', y: '50%', lat: 28.5707, lng: 77.3219 },
  { name: 'Sector 80', x: '48%', y: '60%', lat: 28.5362, lng: 77.3541 },
];

const propertyCards = [
  {
    title: 'Corporate Office · Sector 62',
    type: 'Office',
    area: '1,800 sq ft',
    price: '₹82,000/month',
    slug: 'premium-office-sector-62',
  },
  {
    title: 'Coworking Hub · Sector 63',
    type: 'Coworking',
    area: '150 sq ft',
    price: '₹12,000/month',
    slug: 'coworking-hub-sector-63',
  },
  {
    title: 'Retail Space · Sector 18',
    type: 'Retail',
    area: '1,800 sq ft',
    price: '₹1,50,000/month',
    slug: 'retail-showroom-sector-18',
  },
];

export default function Scene5Map() {
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

      // Map reveal
      gsap.fromTo(
        '.map-container',
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Pins drop in
      gsap.fromTo(
        '.map-pin-drop',
        { y: -20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.2,
          duration: 0.5,
          ease: 'bounce.out',
          scrollTrigger: {
            trigger: section,
            start: 'top+=20% top',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Heatmap overlay
      gsap.fromTo(
        '.heatmap-overlay',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: section,
            start: 'top+=40% top',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Property cards slide in
      gsap.fromTo(
        '.map-property-card',
        { x: 60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top+=50% top',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="map-scene" data-scene="map">
      <div className="map-layout">
        {/* Map Area */}
        <div className="map-container">
          {/* SVG Map of Noida */}
          <svg viewBox="0 0 600 500" className="noida-map" aria-label="Map of Noida sectors">
            {/* Background */}
            <rect width="600" height="500" fill="#0d0d1a" rx="12" />

            {/* Road network */}
            <path d="M0 250 L600 250" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
            <path d="M300 0 L300 500" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
            <path d="M100 0 L500 500" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
            <path d="M500 0 L100 500" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />

            {/* Noida Expressway */}
            <path
              d="M200 0 C250 100, 350 200, 400 500"
              stroke="rgba(1,114,150,0.2)"
              strokeWidth="3"
              fill="none"
              strokeDasharray="8 4"
            />

            {/* Sector blocks */}
            <rect x="220" y="120" width="80" height="60" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" />
            <rect x="310" y="130" width="70" height="55" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" />
            <rect x="150" y="220" width="90" height="70" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" />
            <rect x="320" y="260" width="85" height="60" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" />
            <rect x="250" y="340" width="75" height="55" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" />

            {/* Labels */}
            <text x="300" y="30" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="14" fontWeight="600">NOIDA</text>
          </svg>

          {/* Heatmap */}
          <div className="heatmap-overlay" style={{ opacity: 0 }}>
            <div className="heatmap-zone" style={{ left: '40%', top: '25%' }} />
            <div className="heatmap-zone heatmap-zone--sm" style={{ left: '50%', top: '30%' }} />
          </div>

          {/* Map Pins */}
          {pins.map((pin, i) => (
            <div
              key={i}
              className="map-pin-drop"
              style={{ left: pin.x, top: pin.y, opacity: 0 }}
            >
              <div className="pin-icon">
                <svg width="24" height="32" viewBox="0 0 24 32" fill="var(--accent)">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20C24 5.373 18.627 0 12 0zm0 16a4 4 0 110-8 4 4 0 010 8z" />
                </svg>
              </div>
              <span className="pin-label">{pin.name}</span>
            </div>
          ))}
        </div>

        {/* Property Cards Panel */}
        <div className="map-cards">
          <h3 className="map-cards__title">Featured in this area</h3>
          {propertyCards.map((card, i) => (
            <Link
              key={i}
              href={`/properties/${card.slug}`}
              className="map-property-card glass-card"
              style={{ opacity: 0 }}
            >
              <div className="map-property-card__badge">{card.type}</div>
              <h4 className="map-property-card__title">{card.title}</h4>
              <div className="map-property-card__details">
                <span>{card.area}</span>
                <span className="map-property-card__price">{card.price}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .map-scene {
          position: relative;
          height: 200vh;
          background: #050505;
          overflow: hidden;
        }

        .map-layout {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          height: 100vh;
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .map-container {
          position: relative;
          flex: 1;
          max-width: 600px;
          opacity: 0;
        }

        .noida-map {
          width: 100%;
          height: auto;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .heatmap-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .heatmap-zone {
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(var(--accent-rgb), 0.2) 0%, transparent 70%);
          transform: translate(-50%, -50%);
        }

        .heatmap-zone--sm {
          width: 80px;
          height: 80px;
        }

        .map-pin-drop {
          position: absolute;
          transform: translate(-50%, -100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          z-index: 5;
        }

        .pin-icon {
          filter: drop-shadow(0 2px 8px rgba(var(--accent-rgb), 0.4));
        }

        .pin-label {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-secondary);
          background: rgba(0, 0, 0, 0.7);
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          white-space: nowrap;
        }

        .map-cards {
          width: 320px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .map-cards__title {
          font-size: 1rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .map-property-card {
          display: block;
          text-decoration: none;
          padding: 1.25rem;
        }

        .map-property-card__badge {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--accent);
          background: rgba(var(--accent-rgb), 0.1);
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
          margin-bottom: 0.5rem;
        }

        .map-property-card__title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .map-property-card__details {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .map-property-card__price {
          color: var(--accent);
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .map-layout {
            flex-direction: column;
            padding: 1rem;
          }

          .map-cards {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const propertyTypes = [
  {
    name: 'Office',
    features: ['Grade A glass facade', 'High-speed connectivity', 'Premium interiors'],
    color: '#60a5fa',
    shape: { width: 120, height: 280, rx: 4 },
  },
  {
    name: 'Coworking',
    features: ['Flexible seating', 'Community events', 'All-inclusive pricing'],
    color: '#c084fc',
    shape: { width: 120, height: 240, rx: 4 },
  },
  {
    name: 'Retail',
    features: ['High-street frontage', 'Heavy foot traffic', 'Brand visibility'],
    color: '#fbbf24',
    shape: { width: 180, height: 140, rx: 4 },
  },
  {
    name: 'Warehouse',
    features: ['High ceiling clearance', 'Loading bays', 'Industrial power'],
    color: '#9ca3af',
    shape: { width: 200, height: 120, rx: 2 },
  },
];

export default function Scene3Transformation() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=200%',
        pin: true,
        pinSpacing: true,
      });

      const totalTypes = propertyTypes.length;

      propertyTypes.forEach((_, i) => {
        const startPct = (i / totalTypes) * 100;
        const endPct = ((i + 1) / totalTypes) * 100;

        // Show building shape
        gsap.fromTo(
          `.building-type-${i}`,
          { opacity: 0, scale: 0.8, rotateY: -15 },
          {
            opacity: 1,
            scale: 1,
            rotateY: 0,
            duration: 0.4,
            ease: 'power2.inOut',
            scrollTrigger: {
              trigger: section,
              start: `top+=${startPct}% top`,
              end: `top+=${endPct}% top`,
              toggleActions: 'play reverse play reverse',
            },
          }
        );

        // Show text from alternating sides
        const fromLeft = i % 2 === 0;
        gsap.fromTo(
          `.type-info-${i}`,
          { opacity: 0, x: fromLeft ? -80 : 80 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: `top+=${startPct + 5}% top`,
              end: `top+=${endPct}% top`,
              toggleActions: 'play reverse play reverse',
            },
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="transform-scene" data-scene="transform">
      <div className="transform-content">
        {/* Central building display */}
        <div className="building-display">
          {propertyTypes.map((type, i) => (
            <div key={i} className={`building-type building-type-${i}`} style={{ opacity: i === 0 ? 1 : 0 }}>
              <svg viewBox="0 0 300 400" className="building-svg">
                <defs>
                  <linearGradient id={`buildGrad${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={type.color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={type.color} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <rect
                  x={(300 - type.shape.width) / 2}
                  y={400 - type.shape.height - 20}
                  width={type.shape.width}
                  height={type.shape.height}
                  rx={type.shape.rx}
                  fill={`url(#buildGrad${i})`}
                  stroke={type.color}
                  strokeWidth="1"
                  strokeOpacity="0.4"
                />
                {/* Windows */}
                {Array.from({ length: Math.floor(type.shape.height / 30) }).map((_, ri) =>
                  Array.from({ length: Math.floor(type.shape.width / 25) }).map((_, ci) => (
                    <rect
                      key={`${ri}-${ci}`}
                      x={(300 - type.shape.width) / 2 + 10 + ci * 25}
                      y={400 - type.shape.height - 10 + ri * 30}
                      width={8}
                      height={12}
                      rx={1}
                      fill={type.color}
                      fillOpacity={Math.random() > 0.4 ? 0.4 : 0.1}
                    />
                  ))
                )}
              </svg>
            </div>
          ))}
        </div>

        {/* Text info panels */}
        {propertyTypes.map((type, i) => (
          <div
            key={i}
            className={`type-info type-info-${i}`}
            style={{
              opacity: 0,
              [i % 2 === 0 ? 'left' : 'right']: '5%',
              [i % 2 === 0 ? 'right' : 'left']: 'auto',
            }}
          >
            <h2 className="type-name" style={{ color: type.color }}>
              {type.name}
            </h2>
            <div className="type-features glass-card">
              {type.features.map((f, fi) => (
                <div key={fi} className="feature-item">
                  <div className="feature-dot" style={{ background: type.color }} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .transform-scene {
          position: relative;
          height: 300vh;
          background: #050505;
          overflow: hidden;
        }

        .transform-content {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .building-display {
          position: relative;
          width: 300px;
          height: 400px;
        }

        .building-type {
          position: absolute;
          inset: 0;
          will-change: transform, opacity;
        }

        .building-svg {
          width: 100%;
          height: 100%;
        }

        .type-info {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          max-width: 320px;
          will-change: transform, opacity;
        }

        .type-name {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }

        .type-features {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .feature-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .type-info {
            position: relative;
            top: auto;
            transform: none;
            left: auto !important;
            right: auto !important;
            text-align: center;
            max-width: 100%;
            padding: 0 1rem;
          }

          .transform-content {
            flex-direction: column;
            gap: 2rem;
          }

          .type-name {
            font-size: 2.5rem;
          }

          .building-display {
            width: 200px;
            height: 280px;
          }
        }
      `}</style>
    </section>
  );
}

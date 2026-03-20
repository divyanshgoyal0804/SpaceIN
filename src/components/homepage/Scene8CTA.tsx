'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

export default function Scene8CTA() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Building windows light up
      gsap.fromTo(
        '.window-light',
        { opacity: 0 },
        {
          opacity: 0.8,
          stagger: {
            each: 0.05,
            from: 'random',
          },
          duration: 0.3,
          ease: 'power1.in',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Headline words
      gsap.fromTo(
        '.cta-word',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.06,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 50%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // CTA button
      gsap.fromTo(
        '.cta-buttons',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 40%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  // Generate window positions for buildings
  const windows = [];
  const buildings = [
    { x: 5, w: 8, h: 45, floors: 12, cols: 3 },
    { x: 14, w: 10, h: 55, floors: 15, cols: 4 },
    { x: 25, w: 7, h: 35, floors: 10, cols: 3 },
    { x: 33, w: 12, h: 60, floors: 16, cols: 5 },
    { x: 46, w: 9, h: 50, floors: 14, cols: 4 },
    { x: 56, w: 11, h: 42, floors: 12, cols: 4 },
    { x: 68, w: 8, h: 58, floors: 16, cols: 3 },
    { x: 77, w: 10, h: 38, floors: 10, cols: 4 },
    { x: 88, w: 9, h: 52, floors: 14, cols: 3 },
  ];

  for (const b of buildings) {
    for (let row = 0; row < b.floors; row++) {
      for (let col = 0; col < b.cols; col++) {
        windows.push({
          left: `${b.x + col * (b.w / b.cols) + 0.5}%`,
          bottom: `${(row + 1) * (b.h / b.floors)}%`,
          color:
            Math.random() > 0.7
              ? 'rgba(var(--accent-rgb), 0.7)'
              : Math.random() > 0.5
              ? 'rgba(255, 255, 255, 0.5)'
              : 'rgba(var(--accent-rgb), 0.4)',
        });
      }
    }
  }

  const headline = 'Find the Space Where Your Business Grows';

  return (
    <section ref={sectionRef} className="cta-scene" data-scene="cta">
      {/* City skyline background */}
      <div className="cta-skyline">
        {/* Gradient sky */}
        <div className="cta-sky" />

        {/* Buildings silhouette */}
        <div className="cta-buildings">
          {buildings.map((b, i) => (
            <div
              key={i}
              className="building-silhouette"
              style={{
                left: `${b.x}%`,
                width: `${b.w}%`,
                height: `${b.h}%`,
              }}
            />
          ))}
        </div>

        {/* Window lights */}
        {windows.map((w, i) => (
          <div
            key={i}
            className="window-light"
            style={{
              left: w.left,
              bottom: w.bottom,
              backgroundColor: w.color,
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* Content overlay */}
      <div className="cta-content">
        <h2 className="cta-headline">
          {headline.split(' ').map((word, i) => (
            <span key={i} className="cta-word" style={{ opacity: 0 }}>
              {word}{' '}
            </span>
          ))}
        </h2>

        <div className="cta-buttons" style={{ opacity: 0 }}>
          <Link href="/properties" className="cta-main-btn">
            Explore Spaces in Noida
          </Link>
          <Link href="/chat" className="cta-secondary-link">
            Chat with our AI →
          </Link>
        </div>
      </div>

      <style jsx>{`
        .cta-scene {
          position: relative;
          height: 100vh;
          background: #050505;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cta-skyline {
          position: absolute;
          inset: 0;
        }

        .cta-sky {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            #0a0a1a 0%,
            #1a1020 30%,
            #2d1a0f 60%,
            #1a0f05 80%,
            #050505 100%
          );
        }

        .cta-buildings {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60%;
        }

        .building-silhouette {
          position: absolute;
          bottom: 0;
          background: #0a0a0a;
          border-top-left-radius: 2px;
          border-top-right-radius: 2px;
        }

        .window-light {
          position: absolute;
          width: 4px;
          height: 6px;
          border-radius: 1px;
          z-index: 2;
        }

        .cta-content {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 0 2rem;
          max-width: 700px;
        }

        .cta-headline {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -0.02em;
          color: #f5f5f5;
          margin-bottom: 2rem;
        }

        .cta-word {
          display: inline-block;
        }

        .cta-buttons {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }

        .cta-main-btn {
          display: inline-flex;
          align-items: center;
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
          font-weight: 700;
          color: #000;
          background: var(--accent);
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 0 40px rgba(var(--accent-rgb), 0.3);
          animation: cta-pulse 2s ease-in-out infinite;
        }

        .cta-main-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 60px rgba(var(--accent-rgb), 0.5);
        }

        @keyframes cta-pulse {
          0%, 100% { box-shadow: 0 0 30px rgba(var(--accent-rgb), 0.3); }
          50% { box-shadow: 0 0 50px rgba(var(--accent-rgb), 0.5); }
        }

        .cta-secondary-link {
          font-size: 0.95rem;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .cta-secondary-link:hover {
          color: var(--accent);
        }

        @media (max-width: 768px) {
          .window-light {
            width: 3px;
            height: 4px;
          }
        }
      `}</style>
    </section>
  );
}

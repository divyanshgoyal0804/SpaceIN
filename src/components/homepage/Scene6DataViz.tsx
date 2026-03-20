'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }, [target]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!ref.current) return;

    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 85%',
      onEnter: animate,
    });

    return () => trigger.kill();
  }, [animate]);

  return (
    <span ref={ref}>
      {count.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}

const stats = [
  { target: 500, suffix: '+', label: 'Properties Listed' },
  { target: 1, suffix: '', label: 'City Covered', tagline: 'and growing' },
  { target: 1200, suffix: '+', label: 'Businesses Served' },
];

const industries = ['Tech', 'Finance', 'Retail', 'Logistics', 'Healthcare'];

export default function Scene6DataViz() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=100%',
        pin: true,
        pinSpacing: true,
      });

      // SVG line draw
      gsap.fromTo(
        '.graph-line',
        { strokeDashoffset: 500 },
        {
          strokeDashoffset: 0,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top+=30% top',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Industry icons
      gsap.fromTo(
        '.industry-icon',
        { opacity: 0, y: 20, x: () => gsap.utils.random(-30, 30) },
        {
          opacity: 1,
          y: 0,
          x: 0,
          stagger: 0.1,
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
    <section ref={sectionRef} className="dataviz-scene" data-scene="dataviz">
      <div className="dataviz-content">
        <h2 className="dataviz-heading">
          Trusted by <span className="text-gradient">businesses</span> across Noida
        </h2>

        {/* Counter cards */}
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card glass-card">
              <div className="stat-number">
                <AnimatedCounter target={stat.target} suffix={stat.suffix} />
              </div>
              <div className="stat-label">{stat.label}</div>
              {stat.tagline && <div className="stat-tagline">{stat.tagline}</div>}
            </div>
          ))}
        </div>

        {/* Line graph */}
        <div className="graph-container">
          <svg viewBox="0 0 500 150" className="graph-svg">
            <defs>
              <linearGradient id="graphGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="graphFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid */}
            {[0, 1, 2, 3].map((i) => (
              <line
                key={i}
                x1="0"
                y1={i * 50}
                x2="500"
                y2={i * 50}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="0.5"
              />
            ))}

            {/* Fill area */}
            <path
              d="M0 140 L60 120 L120 110 L180 90 L240 70 L300 50 L360 35 L420 25 L480 15 L500 10 L500 150 L0 150 Z"
              fill="url(#graphFill)"
            />

            {/* Line */}
            <path
              className="graph-line"
              d="M0 140 L60 120 L120 110 L180 90 L240 70 L300 50 L360 35 L420 25 L480 15 L500 10"
              fill="none"
              stroke="url(#graphGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="500"
              strokeDashoffset="500"
            />

            {/* Data points */}
            {[
              [0, 140], [60, 120], [120, 110], [180, 90], [240, 70],
              [300, 50], [360, 35], [420, 25], [480, 15],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="3" fill="var(--accent)" />
            ))}
          </svg>
          <div className="graph-label">Properties Listed Over Time</div>
        </div>

        {/* Industry icons */}
        <div className="industries">
          {industries.map((ind, i) => (
            <div key={i} className="industry-icon glass" style={{ opacity: 0 }}>
              {ind}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .dataviz-scene {
          position: relative;
          height: 150vh;
          background: #050505;
          overflow: hidden;
        }

        .dataviz-content {
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2.5rem;
          padding: 2rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .dataviz-heading {
          font-size: clamp(1.5rem, 3.5vw, 2.25rem);
          text-align: center;
          font-weight: 700;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          width: 100%;
        }

        .stat-card {
          text-align: center;
          padding: 2rem 1.5rem;
        }

        .stat-number {
          font-size: 3rem;
          font-weight: 800;
          color: var(--accent);
          letter-spacing: -0.02em;
        }

        .stat-label {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-top: 0.5rem;
        }

        .stat-tagline {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-style: italic;
          margin-top: 0.25rem;
        }

        .graph-container {
          width: 100%;
          position: relative;
        }

        .graph-svg {
          width: 100%;
          height: auto;
        }

        .graph-label {
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 0.5rem;
        }

        .industries {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .industry-icon {
          padding: 0.5rem 1.25rem;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-number {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </section>
  );
}

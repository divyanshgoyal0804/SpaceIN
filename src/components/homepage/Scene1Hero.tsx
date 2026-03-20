'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

export default function Scene1Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Pin the hero
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=50%',
        pin: true,
      });

      // Parallax layers
      gsap.to('#hero-bg-layer', {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });

      gsap.to('#hero-mid-layer', {
        yPercent: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // Headline word animation
      const words = headlineRef.current?.querySelectorAll('.word');
      if (words) {
        gsap.fromTo(
          words,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: 'power3.out',
            delay: 0.3,
          }
        );
      }

      // Glass sweep animation
      if (sweepRef.current) {
        gsap.fromTo(
          sweepRef.current,
          { x: '-100%' },
          {
            x: '200%',
            duration: 1.2,
            ease: 'none',
            delay: 1.5,
          }
        );
      }

      // Subheadline fade in
      if (subRef.current) {
        gsap.fromTo(
          subRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 1.2 }
        );
      }

      // CTA buttons fade in
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 1.6 }
        );
      }

      // Scroll indicator fade out
      if (scrollIndicatorRef.current) {
        gsap.to(scrollIndicatorRef.current, {
          opacity: 0,
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '5% top',
            scrub: true,
          },
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="hero" data-scene="hero">
      {/* Background Layers */}
      <div id="hero-bg-layer" className="hero__layer hero__layer--bg">
        <div className="hero__city-bg" />
      </div>
      <div id="hero-mid-layer" className="hero__layer hero__layer--mid">
        <div className="hero__buildings" />
      </div>
      <div className="hero__layer hero__layer--fg">
        <div className="hero__gradient-overlay" />
      </div>

      {/* Content */}
      <div className="hero__content">
        <div className="hero__headline-wrapper">
          <h1 ref={headlineRef} className="hero__headline">
            <span className="word">Your</span>{' '}
            <span className="word">City.</span>{' '}
            <span className="word">Your</span>{' '}
            <span className="word" style={{ color: 'var(--accent)' }}>Space.</span>{' '}
            <span className="word">Your</span>{' '}
            <span className="word">Business.</span>
          </h1>
          <div ref={sweepRef} className="hero__sweep" />
        </div>

        <p ref={subRef} className="hero__sub" style={{ opacity: 0 }}>
          Premium commercial spaces in Noida. Handpicked. Verified. Ready.
        </p>

        <div ref={ctaRef} className="hero__cta" style={{ opacity: 0 }}>
          <Link href="/properties" className="btn-primary hero__btn">
            Explore Spaces
          </Link>
          <Link href="/chat" className="btn-secondary hero__btn">
            Talk to AI
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div ref={scrollIndicatorRef} className="hero__scroll-indicator">
        <div className="hero__scroll-line">
          <div className="hero__scroll-dot" />
        </div>
        <span className="hero__scroll-text">Scroll to explore</span>
      </div>

      <style jsx>{`
        .hero {
          position: relative;
          height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #050505;
        }

        .hero__layer {
          position: absolute;
          inset: 0;
          will-change: transform;
        }

        .hero__city-bg {
          width: 100%;
          height: 120%;
          background: linear-gradient(180deg, #0a0a1a 0%, #111122 40%, #1a1a2e 70%, #0a0a0a 100%);
          position: relative;
        }

        .hero__city-bg::after {
          content: '';
          position: absolute;
          bottom: 20%;
          left: 0;
          right: 0;
          height: 40%;
          background: 
            linear-gradient(0deg, transparent 0%, transparent 48%, rgba(var(--accent-rgb), 0.03) 48%, rgba(var(--accent-rgb), 0.03) 48.5%, transparent 48.5%),
            linear-gradient(0deg, transparent 0%, transparent 54%, rgba(var(--accent-rgb), 0.02) 54%, rgba(var(--accent-rgb), 0.02) 54.5%, transparent 54.5%),
            linear-gradient(0deg, transparent 0%, transparent 60%, rgba(var(--accent-rgb), 0.04) 60%, rgba(var(--accent-rgb), 0.04) 60.5%, transparent 60.5%);
        }

        .hero__buildings {
          width: 100%;
          height: 120%;
          position: relative;
        }

        .hero__buildings::before {
          content: '';
          position: absolute;
          bottom: 10%;
          left: 5%;
          right: 5%;
          height: 50%;
          background:
            /* Building cluster */
            linear-gradient(to top, #1a1a2e 0%, transparent 80%) no-repeat 10% 100% / 60px 180px,
            linear-gradient(to top, #1a1a2e 0%, transparent 80%) no-repeat 18% 100% / 45px 240px,
            linear-gradient(to top, #1a1a2e 0%, transparent 80%) no-repeat 25% 100% / 70px 200px,
            linear-gradient(to top, #1a1a2e 0%, transparent 80%) no-repeat 35% 100% / 50px 280px,
            linear-gradient(to top, #1a1a2e 0%, transparent 80%) no-repeat 42% 100% / 40px 160px,
            linear-gradient(to top, #1a1a2e 0%, transparent 80%) no-repeat 50% 100% / 65px 320px,
            linear-gradient(to top, #1a1a2e 0%, transparent 80%) no-repeat 58% 100% / 55px 220px,
            linear-gradient(to top, #1a1a2e 0%, transparent 80%) no-repeat 66% 100% / 48px 260px,
            linear-gradient(to top, #1a1a2e 0%, transparent 80%) no-repeat 74% 100% / 60px 190px,
            linear-gradient(to top, #1a1a2e 0%, transparent 80%) no-repeat 82% 100% / 70px 300px,
            linear-gradient(to top, #1a1a2e 0%, transparent 80%) no-repeat 90% 100% / 45px 170px;
        }

        .hero__gradient-overlay {
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(5, 5, 5, 0.8) 100%),
            linear-gradient(180deg, rgba(5, 5, 5, 0.3) 0%, transparent 30%, transparent 70%, rgba(5, 5, 5, 0.9) 100%);
        }

        .hero__content {
          position: relative;
          z-index: 10;
          text-align: center;
          max-width: 800px;
          padding: 0 2rem;
        }

        .hero__headline-wrapper {
          position: relative;
          overflow: hidden;
          padding: 0.5rem 0;
        }

        .hero__headline {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: #f5f5f5;
        }

        .hero__headline :global(.word) {
          display: inline-block;
          opacity: 0;
        }

        .hero__sweep {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            105deg,
            transparent 40%,
            rgba(255, 255, 255, 0.08) 50%,
            transparent 60%
          );
          pointer-events: none;
        }

        .hero__sub {
          margin-top: 1.5rem;
          font-size: clamp(1rem, 2vw, 1.25rem);
          color: #a1a1aa;
          font-weight: 400;
          letter-spacing: 0.01em;
        }

        .hero__cta {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2.5rem;
          flex-wrap: wrap;
        }

        .hero__btn {
          padding: 0.9rem 2rem;
          font-size: 1rem;
        }

        .hero__scroll-indicator {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          z-index: 10;
        }

        .hero__scroll-line {
          width: 1px;
          height: 48px;
          background: rgba(255, 255, 255, 0.15);
          position: relative;
          border-radius: 1px;
        }

        .hero__scroll-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          animation: scroll-indicator 1.5s ease-in-out infinite;
        }

        .hero__scroll-text {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #52525b;
        }
      `}</style>
    </section>
  );
}

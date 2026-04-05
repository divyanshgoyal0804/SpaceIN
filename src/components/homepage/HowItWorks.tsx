'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './HowItWorks.module.css';

const steps = [
  {
    number: 1,
    title: 'Tell us your requirements',
    description: 'Share your space needs, budget, and preferences.',
  },
  {
    number: 2,
    title: 'Receive instant options',
    description: 'Get curated listings that match your criteria.',
  },
  {
    number: 3,
    title: 'Shortlist and schedule visits',
    description: 'Pick favorites and book site visits at your convenience.',
  },
  {
    number: 4,
    title: 'We negotiate for you',
    description: 'Our experts secure the best deal on your behalf.',
  },
  {
    number: 5,
    title: 'Close and move in',
    description: 'Finalize the paperwork and start working.',
  },
];

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const [lineProgress, setLineProgress] = useState(0);

  useEffect(() => {
    const stepElements = containerRef.current?.querySelectorAll('[data-step]');
    if (!stepElements) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const stepIndex = Number(entry.target.getAttribute('data-step'));
          if (entry.isIntersecting) {
            setVisibleSteps((prev) => {
              const next = new Set(prev);
              next.add(stepIndex);
              return next;
            });
          }
        });
      },
      { threshold: 0.3, rootMargin: '0px 0px -50px 0px' }
    );

    stepElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (visibleSteps.size === 0) return;
    const maxVisible = Math.max(...visibleSteps);
    const progress = ((maxVisible) / (steps.length - 1)) * 100;
    setLineProgress(progress);
  }, [visibleSteps]);

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Connecting line */}
      <div className={styles.lineTrack}>
        <div
          className={styles.lineProgress}
          style={{ height: `${lineProgress}%` }}
        />
      </div>

      {steps.map((step, index) => {
        const isVisible = visibleSteps.has(index);
        return (
          <div
            key={step.number}
            data-step={index}
            className={`${styles.step} ${isVisible ? styles.stepVisible : ''}`}
            style={{ transitionDelay: `${index * 120}ms` }}
          >
            <div className={`${styles.stepCircle} ${isVisible ? styles.stepCirclePulse : ''}`}>
              <span className={styles.stepNumber}>{step.number}</span>
            </div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

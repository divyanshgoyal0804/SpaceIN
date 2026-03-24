import Link from 'next/link';
import styles from './Scene1Hero.module.css';

export default function Scene1Hero() {
  return (
    <section className={styles.hero} data-scene="hero">
      {/* Background Layers */}
      <div id="hero-bg-layer" className={styles.heroLayer}>
        <div className={styles.heroCityBg} />
      </div>
      <div id="hero-mid-layer" className={styles.heroLayer}>
        <div className={styles.heroBuildings} />
      </div>
      <div className={styles.heroLayer}>
        <div className={styles.heroGradientOverlay} />
      </div>

      {/* Content */}
      <div className={styles.heroContent}>
        <div className={styles.heroHeadlineWrapper}>
          <h1 className={styles.heroHeadline}>
            <span className={`${styles.heroWord} word`}>Your</span>{' '}
            <span className={`${styles.heroWord} word`}>City.</span>{' '}
            <span className={`${styles.heroWord} word`}>Your</span>{' '}
            <span className={`${styles.heroWord} word`} style={{ color: 'var(--accent)' }}>Space.</span>{' '}
            <span className={`${styles.heroWord} word`}>Your</span>{' '}
            <span className={`${styles.heroWord} word`}>Business.</span>
          </h1>
          <div className={styles.heroSweep} />
        </div>

        <p className={styles.heroSub}>
          Premium commercial spaces in Noida. Handpicked. Verified. Ready.
        </p>

        <div className={styles.heroCta}>
          <Link href="/properties" className={`btn-primary ${styles.heroBtn}`}>
            Explore Spaces
          </Link>
          <Link href="/chat" className={`btn-secondary ${styles.heroBtn}`}>
            Talk to AI
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className={styles.heroScrollIndicator}>
        <div className={styles.heroScrollLine}>
          <div className={styles.heroScrollDot} />
        </div>
        <span className={styles.heroScrollText}>Scroll to explore</span>
      </div>
    </section>
  );
}

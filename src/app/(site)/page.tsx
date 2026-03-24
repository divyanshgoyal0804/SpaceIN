import Link from 'next/link';
import { Building2, ShieldCheck, MapPin } from 'lucide-react';
import HeroSearch from '@/components/homepage/HeroSearch';
import styles from './HomePage.module.css';

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
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <p className={styles.heroEyebrow}>Premium Commercial Real Estate</p>
          <h1 className={styles.heroHeadline}>
            Your City. Your <span className={styles.heroAccent}>Space.</span> Your
            Business.
          </h1>
          <p className={styles.heroSub}>
            Discover handpicked commercial spaces in Noida — verified, ready, and
            perfect for your business.
          </p>
          <HeroSearch />
          <div className={styles.heroCta}>
            <Link href="/properties" className={`btn-primary ${styles.heroBtn}`}>
              Explore Spaces
            </Link>
            <Link href="/contact" className={`btn-secondary ${styles.heroBtn}`}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featuresContainer}>
          <h2 className={styles.featuresTitle}>Why SpaceIn?</h2>
          <p className={styles.featuresSubtitle}>
            We take the complexity out of finding your next commercial space.
          </p>
          <div className={styles.featuresGrid}>
            {features.map((feature) => (
              <div key={feature.title} className={`${styles.featureCard} glass-card`}>
                <div className={styles.featureCardIcon}>
                  <feature.icon size={28} strokeWidth={1.5} />
                </div>
                <h3 className={styles.featureCardTitle}>{feature.title}</h3>
                <p className={styles.featureCardDesc}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaBannerContainer}>
          <h2 className={styles.ctaBannerTitle}>
            Ready to find your perfect space?
          </h2>
          <p className={styles.ctaBannerSub}>
            Browse our curated listings or chat with our AI assistant for
            personalized recommendations.
          </p>
          <div className={styles.ctaBannerActions}>
            <Link href="/properties" className="btn-primary">
              Browse Properties
            </Link>
            <Link href="/chat" className="btn-secondary">
              Chat with AI
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

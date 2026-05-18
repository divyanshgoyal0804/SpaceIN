import { Building2, ShieldCheck, MapPin, Wallet, Settings, Wrench, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './WhySharkspace.module.css';

const features = [
  {
    icon: ShieldCheck,
    title: 'Verified Listings',
    description: 'Every property is personally inspected. No fake listings, no wasted time.',
    type: 'verified',
  },
  {
    icon: MapPin,
    title: 'Prime Locations',
    description: 'Strategic locations with excellent connectivity and infrastructure.',
    type: 'prime',
  },
  {
    icon: Wrench,
    title: 'Built to Suit',
    description: 'Customizable spaces designed to meet your exact business needs, from layout to infrastructure.',
    type: 'built',
  },
  {
    icon: Settings,
    title: 'Managed Services',
    description: 'End-to-end property management including maintenance, security, and support.',
    type: 'managed',
  },
  {
    icon: Wallet,
    title: 'Budget Friendly',
    description: 'Flexible pricing options to suit every budget without compromising on quality.',
    type: 'budget',
  },
];

export default function WhySharkspace() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <div className={styles.eyebrow}>
              04 WHY SHARKSPACE
            </div>
            <h2 className={styles.title}>
              An editorial approach to<br />
              <span className={styles.titleAccent}>commercial real estate.</span>
            </h2>
          </div>
          <p className={styles.description}>
            Every listing verified, every deal transparent. We handle the complexity so you focus on growth. Experience real estate designed for the modern business.
          </p>
        </div>

        <div className={styles.bentoGrid}>
          {/* Hero Card: Premium Spaces */}
          <div className={`${styles.card} ${styles.cardPremium}`}>
            <Image
              src="/images/hero-bg.jpg"
              alt="Premium Commercial Spaces"
              fill
              className={styles.premiumImage}
            />
            <div className={styles.premiumOverlay}></div>
            <div className={styles.premiumContent}>
              <div className={styles.premiumIconWrapper}>
                <Building2 size={26} strokeWidth={1.5} />
              </div>
              <h3 className={styles.premiumTitle}>Premium Spaces</h3>
              <p className={styles.premiumDesc}>
                Handpicked commercial properties — offices, coworking, retail, warehouses, and showrooms designed for excellence.
              </p>
              <Link href="/chat" className={styles.premiumAction}>
                <span>Explore Spaces</span>
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>

          {/* Other feature cards */}
          {features.map((feature) => (
            <div 
              key={feature.title} 
              className={`${styles.card} ${styles[`card${feature.type.charAt(0).toUpperCase() + feature.type.slice(1)}`]}`}
            >
              <div className={styles.cardHeader}>
                <div className={styles.iconWrapper}>
                  <feature.icon size={22} strokeWidth={1.5} />
                </div>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{feature.title}</h3>
                <p className={styles.cardDesc}>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

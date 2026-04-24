import { Building2, ShieldCheck, MapPin, Wallet, Settings, Wrench } from 'lucide-react';
import styles from '@/app/(site)/HomePage.module.css';

const features = [
  {
    icon: ShieldCheck,
    title: 'Verified Listings',
    description: 'Every property is personally inspected and verified. No fake listings, no wasted time.',
  },
  {
    icon: Building2,
    title: 'Premium Spaces',
    description: 'Handpicked commercial properties — offices, coworking, retail, warehouses, and showrooms.',
  },
  {
    icon: MapPin,
    title: 'Prime Locations',
    description: 'Strategic locations across Noida with excellent connectivity and infrastructure.',
  },
  {
    icon: Wallet,
    title: 'Budget Friendly',
    description: 'Flexible pricing options to suit every budget. Find the right space without compromising on quality or location.',
  },
  {
    icon: Settings,
    title: 'Managed Services',
    description: 'End-to-end property management including maintenance, security, and support — so you can focus on your business.',
  },
  {
    icon: Wrench,
    title: 'Built to Suit',
    description: 'Customizable spaces designed to meet your exact business needs, from layout to infrastructure.',
  },
];

export default function WhySharkspace() {
  return (
    <section className={styles.features}>
      <div className={styles.featuresContainer}>
        <h2 className={styles.featuresTitle}>Why Sharkspace?</h2>
        <p className={styles.featuresSubtitle}>
          Because finding the right office shouldn't feel like a full-time job.
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
  );
}

import { Building2, ShieldCheck, MapPin, Wallet, Settings, Wrench } from 'lucide-react';
import styles from './WhySharkspace.module.css';

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
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <div className={styles.eyebrow}>05 WHY SHARKSPACE</div>
            <h2 className={styles.title}>
              Because finding space<br />
              shouldn&rsquo;t feel like a <span className={styles.titleAccent}>full-time job.</span>
            </h2>
          </div>
          <p className={styles.description}>
            Every listing verified, every deal transparent — we handle the complexity so you focus on growth.
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((feature) => (
            <div key={feature.title} className={styles.card}>
              <div className={styles.iconWrapper}>
                <feature.icon size={26} strokeWidth={1.5} />
              </div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDesc}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

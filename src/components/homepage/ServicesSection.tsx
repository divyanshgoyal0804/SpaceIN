import Link from 'next/link';
import { ArrowUpRight, Building2, LayoutTemplate, Briefcase, Warehouse, Map, Factory } from 'lucide-react';
import styles from './ServicesSection.module.css';

const services = [
  {
    icon: Briefcase,
    meta: '1 - 500 SEATS',
    title: 'Coworking',
    description: 'Flexible seats, private cabins, and dynamic work environments in prime hubs.',
    href: '/chat?q=I%27m+looking+for+coworking+spaces',
  },
  {
    icon: LayoutTemplate,
    meta: '1,000 - 50,000 SQFT',
    title: 'Fully Furnished Lease',
    description: 'Move-in ready Grade-A offices with workstations, cabins, IT, and amenities in place.',
    href: '/chat?q=I%27m+looking+for+fully+furnished+office+spaces',
  },
  {
    icon: Building2,
    meta: '1,000 - 100,000 SQFT',
    title: 'Bare Shell Offices',
    description: 'Unfurnished raw spaces giving you complete freedom to design and build to your branding.',
    href: '/chat?q=I%27m+looking+for+bare+shell+office+spaces',
  },
  {
    icon: Warehouse,
    meta: '10,000 - 5,00,000 SQFT',
    title: 'Warehouse Spaces',
    description: 'Strategic logistics & storage facilities across NCR with high ceilings and dock access.',
    href: '/chat?q=I%27m+looking+for+warehouse+spaces',
  },
  {
    icon: Factory,
    meta: 'BESPOKE · 25,000+ SQFT',
    title: 'Built-to-Suit',
    description: 'Custom-designed corporate campuses — leased to your specifications, delivered turnkey.',
    href: '/chat?q=I%27m+interested+in+built-to-suit+custom+workspaces',
  },
  {
    icon: Map,
    meta: 'FLEXIBLE',
    title: 'Managed Offices',
    description: 'End-to-end workspace solutions where everything from fit-outs to daily operations is handled.',
    href: '/chat?q=I%27m+looking+for+managed+office+spaces',
  },
];

export default function ServicesSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <div className={styles.eyebrow}>01 SERVICES</div>
            <h2 className={styles.title}>
              One channel. <span className={styles.titleAccent}>Every</span><br/>
              kind of space.
            </h2>
          </div>
          <p className={styles.description}>
            From a single coworking seat to a 5-lakh sqft warehouse — we handle search, negotiation, due diligence, and handover. You stay focused on growth.
          </p>
        </div>

        <div className={styles.grid}>
          {services.map((service) => (
            <Link key={service.title} href={service.href} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.iconWrapper}>
                  <service.icon size={28} strokeWidth={1.5} />
                </div>
                <ArrowUpRight className={styles.arrowIcon} size={20} strokeWidth={1.5} />
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardMeta}>{service.meta}</div>
                <h3 className={styles.cardTitle}>{service.title}</h3>
                <p className={styles.cardDesc}>{service.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

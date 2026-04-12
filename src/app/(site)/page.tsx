import Link from 'next/link';
import Image from 'next/image';
import heroBackgroundImage from '../../../pexels-kindelmedia-7688081.jpg';
import { Building2, ShieldCheck, MapPin, Wallet, Settings, Wrench } from 'lucide-react';
import HeroSearch from '@/components/homepage/HeroSearch';
import HowItWorks from '@/components/homepage/HowItWorks';
import PropertyCard from '@/components/properties/PropertyCard';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import { prisma } from '@/lib/prisma';
import styles from './HomePage.module.css';

export const dynamic = 'force-dynamic';

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
  {
    icon: Wallet,
    title: 'Budget Friendly',
    description:
      'Flexible pricing options to suit every budget. Find the right space without compromising on quality or location.',
  },
  {
    icon: Settings,
    title: 'Managed Services',
    description:
      'End-to-end property management including maintenance, security, and support — so you can focus on your business.',
  },
  {
    icon: Wrench,
    title: 'Built to Suit',
    description:
      'Customizable spaces designed to meet your exact business needs, from layout to infrastructure.',
  },
];

const offerings = [
  {
    icon: Building2,
    title: 'Coworking Desks',
    description: 'Flexible desk options for solo founders and growing teams.',
  },
  {
    icon: ShieldCheck,
    title: 'Private Cabins',
    description: 'Dedicated cabins for focused work and team privacy.',
  },
  {
    icon: Settings,
    title: 'Manage Operations',
    description: 'Operational support to keep your workspace running smoothly.',
  },
  {
    icon: Wallet,
    title: 'Lease Spaces',
    description: 'Ready-to-move commercial spaces with transparent terms.',
  },
  {
    icon: MapPin,
    title: 'Virtual Offices',
    description: 'Business-ready addresses with essential office services.',
  },
];



export default async function HomePage() {
  const exclusiveProperties = await prisma.property.findMany({
    where: {
      isActive: true,
      isExclusive: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 6,
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      listingType: true,
      price: true,
      rentPerMonth: true,
      carpetArea: true,
      location: true,
      mainImageUrl: true,
      furnished: true,
    },
  });

  // Fetch published testimonials
  let testimonials: Array<{
    id: string;
    name: string;
    role: string | null;
    company: string | null;
    quote: string;
    avatarUrl: string | null;
  }> = [];

  try {
    testimonials = await prisma.testimonial.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
  }

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground} aria-hidden="true">
          <Image
            src={heroBackgroundImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className={styles.heroBackgroundImage}
          />
        </div>
        <div className={styles.heroContainer}>
          <p className={styles.heroEyebrow}>Premium Commercials for leasing</p>
          <h1 className={styles.heroHeadline}>
            <span className={styles.heroHeadlineLine}>
              Noida's smartest way to find <span className={styles.heroAccent}>Office Space</span>
            </span>
            <span className={styles.heroHeadlineLine}></span>
            <span className={styles.heroHeadlineLine}></span>
          </h1>
          <p className={styles.heroSub}>
            Discover your next commercial spaces in Noida — verified, ready, and perfect for your business.
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

      {exclusiveProperties.length > 0 && (
        <>
          <div className={styles.sectionDivider} />
          <section className={styles.features}>
            <div className={styles.featuresContainer}>
              <h2 className={styles.featuresTitle}>Exclusive Properties</h2>
              <p className={styles.featuresSubtitle}>
                Handpicked listings available exclusively on Sharkspace.
              </p>
              <div className={styles.featuresGrid}>
                {exclusiveProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <div className={styles.sectionDivider} />

      {/* Sharkspace Offerings Section */}
      <section className={styles.features}>
        <div className={styles.featuresContainer}>
          <h2 className={styles.featuresTitle}>Sharkspace Offerings</h2>
          <p className={styles.featuresSubtitle}>
            Workspace solutions tailored for every stage of growth.
          </p>
          <div className={styles.featuresGrid}>
            {offerings.slice(0, 3).map((offering) => (
              <div key={offering.title} className={`${styles.featureCard} glass-card`}>
                <div className={styles.featureCardIcon}>
                  <offering.icon size={28} strokeWidth={1.5} />
                </div>
                <h3 className={styles.featureCardTitle}>{offering.title}</h3>
                <p className={styles.featureCardDesc}>{offering.description}</p>
              </div>
            ))}
          </div>
          <div className={styles.offeringsRow}>
            {offerings.slice(3).map((offering) => (
              <div key={offering.title} className={`${styles.featureCard} glass-card`}>
                <div className={styles.featureCardIcon}>
                  <offering.icon size={28} strokeWidth={1.5} />
                </div>
                <h3 className={styles.featureCardTitle}>{offering.title}</h3>
                <p className={styles.featureCardDesc}>{offering.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider} />

      {/* How It Works Section */}
      <section className={styles.features}>
        <div className={styles.featuresContainer}>
          <h2 className={styles.featuresTitle}>How It Works</h2>
          <p className={styles.featuresSubtitle}>
            A simple, guided flow from requirements to move-in.
          </p>
          <HowItWorks />
        </div>
      </section>



      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <>
          <div className={styles.sectionDivider} />
          <section className={styles.features}>
            <div className={styles.featuresContainer}>
              <h2 className={styles.featuresTitle}>What Our Clients Say</h2>
              <p className={styles.featuresSubtitle}>
                Real experiences from teams who found their workspace with Sharkspace.
              </p>
              <div className={styles.testimonialsGrid}>
                {testimonials.map((t) => {
                  const initials = t.name.slice(0, 1).toUpperCase();
                  const trimmedAvatar = t.avatarUrl?.trim() || '';
                  const isValidAvatar = (() => {
                    if (!trimmedAvatar) return false;
                    if (trimmedAvatar.startsWith('/')) return true;
                    try {
                      const url = new URL(trimmedAvatar);
                      return url.protocol === 'http:' || url.protocol === 'https:';
                    } catch {
                      return false;
                    }
                  })();
                  return (
                    <div key={t.id} className={`${styles.testimonialCard} glass-card`}>
                      <div className={styles.testimonialHeader}>
                        {isValidAvatar ? (
                          <div className={styles.testimonialAvatar}>
                            <Image
                              src={trimmedAvatar}
                              alt={t.name}
                              width={52}
                              height={52}
                              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            />
                          </div>
                        ) : (
                          <div className={styles.testimonialAvatarFallback}>
                            {initials}
                          </div>
                        )}
                        <div>
                          <div className={styles.testimonialName}>{t.name}</div>
                          {(t.role || t.company) && (
                            <div className={styles.testimonialRole}>
                              {[t.role, t.company].filter(Boolean).join(' · ')}
                            </div>
                          )}
                        </div>
                      </div>
                      <p className={styles.testimonialQuote}>&ldquo;{t.quote}&rdquo;</p>
                    </div>
                  );
                })}
              </div>
              <div className={styles.testimonialsViewAll}>
                <Link href="/testimonials" className="btn-secondary">
                  View All Testimonials
                </Link>
              </div>
            </div>
          </section>
        </>
      )}

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

      <WhatsAppButton />
    </div>
  );
}

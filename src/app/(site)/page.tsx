import Link from 'next/link';
import Image from 'next/image';

import HeroSearch from '@/components/homepage/HeroSearch';
import PropertyCard from '@/components/properties/PropertyCard';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import { prisma } from '@/lib/prisma';
import styles from './HomePage.module.css';

// New Modular Components
import ServicesSection from '@/components/homepage/ServicesSection';
import HowItWorksAndWhyUs from '@/components/homepage/HowItWorksAndWhyUs';
import CoverageTestimonials from '@/components/homepage/CoverageTestimonials';
import ContactFAQ from '@/components/homepage/ContactFAQ';
import WhySharkspace from '@/components/homepage/WhySharkspace';

export const dynamic = 'force-dynamic';

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
      {/* 1. Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground} aria-hidden="true">
          <Image
            src="/images/hero-bg.jpg"
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

      {/* 2. Services Section */}
      <ServicesSection />

      {/* 3. Exclusive Properties */}
      {exclusiveProperties.length > 0 && (
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
      )}

      {/* 4 & 5. How It Works + Why Us Split Section */}
      <HowItWorksAndWhyUs />

      {/* Why Sharkspace Grid */}
      <WhySharkspace />

      {/* 6. Locations + Testimonials */}
      <CoverageTestimonials testimonials={testimonials} />

      {/* 7. Contact + FAQs */}
      <ContactFAQ />

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

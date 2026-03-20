import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin
  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@spacein.in' },
    update: {},
    create: {
      email: 'admin@spacein.in',
      password: hashedPassword,
      name: 'SpaceIn Admin',
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Create sample properties
  const properties = await Promise.all([
    prisma.property.upsert({
      where: { slug: 'premium-office-sector-62' },
      update: {},
      create: {
        title: 'Premium Office Space in Sector 62',
        slug: 'premium-office-sector-62',
        description:
          'A spectacular premium office space located in the heart of Sector 62, Noida. This fully furnished office features modern interiors, high-speed internet connectivity, and 24x7 security. Perfect for IT companies and startups looking for a professional workspace with excellent connectivity to Delhi NCR.',
        type: 'OFFICE',
        listingType: 'RENT',
        rentPerMonth: 85000,
        carpetArea: 2400,
        superArea: 2800,
        floor: 5,
        totalFloors: 12,
        location: 'Sector 62, Noida',
        city: 'Noida',
        latitude: 28.6272,
        longitude: 77.3648,
        amenities: [
          '24x7 Security',
          'Power Backup',
          'Parking',
          'High-Speed Internet',
          'CCTV',
          'Conference Room',
          'Lift',
          'Air Conditioning',
        ],
        furnished: 'FURNISHED',
        possession: 'Ready to Move',
        facing: 'East',
        parking: 4,
        washrooms: 2,
        mainImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
        isFeatured: true,
        isActive: true,
      },
    }),
    prisma.property.upsert({
      where: { slug: 'coworking-hub-sector-63' },
      update: {},
      create: {
        title: 'Modern Coworking Hub in Sector 63',
        slug: 'coworking-hub-sector-63',
        description:
          'A vibrant coworking space designed for the modern entrepreneur. Features hot desks, dedicated desks, and private cabins. Amenities include high-speed WiFi, meeting rooms, a cafeteria, and community events. Located near Noida Electronic City metro station.',
        type: 'COWORKING',
        listingType: 'RENT',
        rentPerMonth: 12000,
        carpetArea: 150,
        superArea: 200,
        floor: 3,
        totalFloors: 8,
        location: 'Sector 63, Noida',
        city: 'Noida',
        latitude: 28.6235,
        longitude: 77.3726,
        amenities: [
          '24x7 Security',
          'High-Speed Internet',
          'Cafeteria',
          'Conference Room',
          'Housekeeping',
          'Air Conditioning',
          'Parking',
        ],
        furnished: 'FURNISHED',
        possession: 'Ready to Move',
        facing: 'North',
        parking: 1,
        washrooms: 4,
        mainImageUrl: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&q=80',
        isFeatured: true,
        isActive: true,
      },
    }),
    prisma.property.upsert({
      where: { slug: 'retail-showroom-sector-18' },
      update: {},
      create: {
        title: 'High Street Retail Showroom in Sector 18',
        slug: 'retail-showroom-sector-18',
        description:
          'Prime retail space located on the high street of Sector 18 Noida, one of the most bustling commercial hubs. Ideal for fashion brands, electronics showrooms, or restaurants. Ground floor with large glass frontage and excellent foot traffic.',
        type: 'RETAIL',
        listingType: 'BOTH',
        price: 25000000,
        rentPerMonth: 150000,
        carpetArea: 1800,
        superArea: 2200,
        floor: 0,
        totalFloors: 4,
        location: 'Sector 18, Noida',
        city: 'Noida',
        latitude: 28.5707,
        longitude: 77.3219,
        amenities: [
          '24x7 Security',
          'Power Backup',
          'Parking',
          'CCTV',
          'Fire Safety',
          'Lift',
          'Main Road Facing',
        ],
        furnished: 'BARE_SHELL',
        possession: 'Ready to Move',
        facing: 'South',
        parking: 6,
        washrooms: 2,
        mainImageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
        isFeatured: true,
        isActive: true,
      },
    }),
    prisma.property.upsert({
      where: { slug: 'industrial-warehouse-sector-80' },
      update: {},
      create: {
        title: 'Industrial Warehouse in Sector 80',
        slug: 'industrial-warehouse-sector-80',
        description:
          'Large industrial warehouse suitable for storage, logistics, and light manufacturing. Features high ceiling clearance, loading/unloading bays, and 3-phase power supply. Located with excellent access to Noida-Greater Noida Expressway.',
        type: 'WAREHOUSE',
        listingType: 'RENT',
        rentPerMonth: 200000,
        carpetArea: 8000,
        superArea: 10000,
        floor: 0,
        totalFloors: 1,
        location: 'Sector 80, Noida',
        city: 'Noida',
        latitude: 28.5362,
        longitude: 77.3541,
        amenities: [
          '24x7 Security',
          'Power Backup',
          'CCTV',
          'Fire Safety',
          'Loading/Unloading Bay',
          'Generator Backup',
        ],
        furnished: 'BARE_SHELL',
        possession: 'Ready to Move',
        facing: 'West',
        parking: 10,
        washrooms: 4,
        mainImageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
        isFeatured: false,
        isActive: true,
      },
    }),
    prisma.property.upsert({
      where: { slug: 'luxury-showroom-sector-135' },
      update: {},
      create: {
        title: 'Luxury Auto Showroom in Sector 135',
        slug: 'luxury-showroom-sector-135',
        description:
          'Premium showroom space perfect for luxury automobile brands or high-end furniture showrooms. Double-height entrance with floor-to-ceiling glass panels. Located on the Noida Expressway with high visibility and footfall.',
        type: 'SHOWROOM',
        listingType: 'SALE',
        price: 45000000,
        carpetArea: 5000,
        superArea: 6500,
        floor: 0,
        totalFloors: 2,
        location: 'Sector 135, Noida',
        city: 'Noida',
        latitude: 28.5172,
        longitude: 77.3915,
        amenities: [
          '24x7 Security',
          'Power Backup',
          'Parking',
          'CCTV',
          'Reception',
          'Fire Safety',
          'Lift',
          'Air Conditioning',
          'Main Road Facing',
        ],
        furnished: 'SEMI_FURNISHED',
        possession: 'Dec 2025',
        facing: 'North-East',
        parking: 20,
        washrooms: 6,
        mainImageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80',
        isFeatured: true,
        isActive: true,
      },
    }),
    prisma.property.upsert({
      where: { slug: 'commercial-plot-sector-142' },
      update: {},
      create: {
        title: 'Commercial Plot in Sector 142',
        slug: 'commercial-plot-sector-142',
        description:
          'Prime commercial plot available for sale on the Noida-Greater Noida Expressway. Ideal for constructing an IT park, shopping complex, or corporate headquarters. All approvals in place. Located near upcoming metro station.',
        type: 'PLOT',
        listingType: 'SALE',
        price: 80000000,
        carpetArea: 12000,
        location: 'Sector 142, Noida',
        city: 'Noida',
        latitude: 28.5019,
        longitude: 77.3853,
        amenities: ['Main Road Facing', 'Corner Plot'],
        furnished: 'BARE_SHELL',
        possession: 'Ready to Move',
        facing: 'South-East',
        parking: 0,
        washrooms: 0,
        mainImageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
        isFeatured: false,
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ ${properties.length} properties created`);

  // Create sample blog posts
  const blogs = await Promise.all([
    prisma.blog.upsert({
      where: { slug: 'top-5-sectors-noida-commercial-spaces' },
      update: {},
      create: {
        title: 'Top 5 Sectors in Noida for Commercial Spaces in 2025',
        slug: 'top-5-sectors-noida-commercial-spaces',
        excerpt:
          'Discover the best sectors in Noida for setting up your commercial office or retail space. From IT hubs to high-street retail, we cover it all.',
        content: `<h2>Noida's Commercial Real Estate Boom</h2>
<p>Noida has emerged as one of the fastest-growing commercial real estate markets in India. With excellent connectivity, modern infrastructure, and competitive pricing compared to Delhi and Gurgaon, it's becoming the preferred destination for businesses of all sizes.</p>
<h3>1. Sector 62 — The IT Capital</h3>
<p>Sector 62 remains the undisputed king of commercial real estate in Noida. Home to major IT companies and startups, this sector offers the highest density of Grade A office spaces. Average rent ranges from ₹35-50 per sq ft per month.</p>
<h3>2. Sector 18 — The Retail Paradise</h3>
<p>If you're looking for retail spaces, Sector 18 is your best bet. With Atta Market and the DLF Mall nearby, this sector sees the highest foot traffic in Noida. Retail spaces here command premium prices but offer unmatched visibility.</p>
<h3>3. Sector 63 — The Startup Hub</h3>
<p>Adjacent to Sector 62, this sector has become popular among startups and coworking spaces. The presence of Noida Electronic City metro station makes it easily accessible. Rents are slightly lower than Sector 62.</p>
<h3>4. Sector 135 — The Expressway Corridor</h3>
<p>Located along the Noida Expressway, Sector 135 is attracting large corporate offices and showrooms. Several premium commercial projects are under development here.</p>
<h3>5. Sector 142 — The Future Hub</h3>
<p>With the upcoming Jewar Airport and metro extensions, Sector 142 is positioned for massive growth. Smart investors are already acquiring commercial plots here at pre-appreciation prices.</p>`,
        coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
        tags: ['Noida', 'Commercial Real Estate', 'Investment', 'Office Spaces'],
        author: 'SpaceIn Team',
        isPublished: true,
        publishedAt: new Date('2025-01-15'),
      },
    }),
    prisma.blog.upsert({
      where: { slug: 'coworking-vs-traditional-office-noida' },
      update: {},
      create: {
        title: 'Coworking vs Traditional Office Space: What\'s Right for Your Business?',
        slug: 'coworking-vs-traditional-office-noida',
        excerpt:
          'A comprehensive comparison of coworking spaces and traditional office leases in Noida to help you make the right choice for your business.',
        content: `<h2>The Great Office Debate</h2>
<p>As the commercial real estate landscape evolves, businesses in Noida face an important decision: should they opt for a coworking space or a traditional office lease? Let's break down the pros and cons of each.</p>
<h3>Coworking Spaces</h3>
<p><strong>Pros:</strong></p>
<ul>
<li>Flexible terms — month-to-month contracts</li>
<li>Lower upfront costs — no fit-out expenses</li>
<li>Networking opportunities with other businesses</li>
<li>Amenities included (internet, housekeeping, refreshments)</li>
<li>Easy to scale up or down</li>
</ul>
<p><strong>Cons:</strong></p>
<ul>
<li>Higher per-seat cost in the long run</li>
<li>Less privacy and branding control</li>
<li>Shared resources can mean compromises</li>
</ul>
<h3>Traditional Office Space</h3>
<p><strong>Pros:</strong></p>
<ul>
<li>Complete control over space design and branding</li>
<li>Lower cost per employee at scale (50+ employees)</li>
<li>Privacy and security</li>
<li>Long-term stability</li>
</ul>
<p><strong>Cons:</strong></p>
<ul>
<li>Long lease commitments (3-9 years typically)</li>
<li>High upfront fit-out and deposit costs</li>
<li>Maintenance responsibility</li>
</ul>
<h3>Our Recommendation</h3>
<p>For teams under 20 people, coworking is usually more cost-effective. For established companies with 50+ employees planning to stay in Noida long-term, a traditional lease offers better value.</p>`,
        coverImage: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
        tags: ['Coworking', 'Office', 'Business Tips', 'Noida'],
        author: 'SpaceIn Team',
        isPublished: true,
        publishedAt: new Date('2025-02-10'),
      },
    }),
  ]);
  console.log(`✅ ${blogs.length} blog posts created`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

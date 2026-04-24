import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── Brand prefixes & suffixes for realistic names ──────────────────────
const brandPrefixes = [
  'WorkNest', 'UrbanVault', 'DeskPark', 'HiveSpace', 'NexusHub',
  'CoGrow', 'FlexiDesk', 'PrimeDesk', 'WorkBridge', 'SkyDesk',
  'OpenHive', 'ZenWork', 'CloudDesk', 'OfficeBox', 'ProSpace',
  'EliteWork', 'TheStudio', 'LaunchPad', 'VentureHub', 'PivotDesk',
  'WorkSphere', 'IdeaLoft', 'StartSpace', 'GrowthHub', 'TechNest',
  'InnoDesk', 'CrewSpace', 'BuzzWork', 'AceOffice', 'WorkEdge',
  'PrestigeDesk', 'CityWork', 'MetroHub', 'PulseOffice', 'WorkTree',
  'BluDesk', 'NovaWork', 'SparkHub', 'WorkForge', 'OneDesk',
  'OrbitalWork', 'VelocityHub', 'AltitudeDesk', 'SummitSpace', 'HorizonWork',
  'GridDesk', 'CoreHub', 'MintWork', 'ApexDesk', 'RidgeWork',
  'IvyDesk', 'OakSpace', 'MapleWork', 'PineHub', 'CedarDesk',
  'SilverWork', 'GoldDesk', 'PlatinumHub', 'DiamondSpace', 'EmeraldWork',
  'MotionDesk', 'SwiftHub', 'RapidWork', 'FlashDesk', 'TurboSpace',
];

const brandSuffixes = [
  'Hub', 'Loft', 'Studio', 'Works', 'Tower', 'Plaza', 'Point',
  'Centre', 'Park', 'Square', 'Campus', 'Suite', 'Block', 'Chambers',
];

// ── Noida locations with lat/lng ranges ──────────────────────────────
const locations = [
  { name: 'Sector 62', latBase: 28.6271, lngBase: 77.3649 },
  { name: 'Sector 63', latBase: 28.6253, lngBase: 77.3775 },
  { name: 'Sector 18', latBase: 28.5700, lngBase: 77.3219 },
  { name: 'Sector 16', latBase: 28.5810, lngBase: 77.3110 },
  { name: 'Sector 125', latBase: 28.5440, lngBase: 77.3230 },
  { name: 'Sector 132', latBase: 28.5130, lngBase: 77.3640 },
  { name: 'Sector 135', latBase: 28.5080, lngBase: 77.3820 },
  { name: 'Sector 142', latBase: 28.4940, lngBase: 77.3780 },
  { name: 'Sector 44', latBase: 28.5650, lngBase: 77.3550 },
  { name: 'Sector 15', latBase: 28.5880, lngBase: 77.3180 },
  { name: 'Sector 2', latBase: 28.5960, lngBase: 77.3080 },
  { name: 'Sector 1', latBase: 28.5940, lngBase: 77.3120 },
  { name: 'Noida Expressway', latBase: 28.5200, lngBase: 77.3800 },
  { name: 'Sector 58', latBase: 28.6070, lngBase: 77.3580 },
  { name: 'Sector 59', latBase: 28.6100, lngBase: 77.3620 },
  { name: 'Sector 64', latBase: 28.6140, lngBase: 77.3680 },
  { name: 'Sector 65', latBase: 28.6110, lngBase: 77.3710 },
  { name: 'Sector 126', latBase: 28.5390, lngBase: 77.3290 },
  { name: 'Sector 127', latBase: 28.5360, lngBase: 77.3350 },
  { name: 'Sector 128', latBase: 28.5330, lngBase: 77.3410 },
  { name: 'Sector 137', latBase: 28.5060, lngBase: 77.3920 },
  { name: 'Sector 143', latBase: 28.4900, lngBase: 77.3830 },
  { name: 'Sector 144', latBase: 28.4860, lngBase: 77.3880 },
  { name: 'Sector 34', latBase: 28.5720, lngBase: 77.3420 },
  { name: 'Sector 37', latBase: 28.5680, lngBase: 77.3480 },
  { name: 'Sector 10', latBase: 28.5900, lngBase: 77.3210 },
  { name: 'Sector 11', latBase: 28.5920, lngBase: 77.3150 },
  { name: 'Sector 12', latBase: 28.5930, lngBase: 77.3100 },
  { name: 'Sector 25', latBase: 28.5780, lngBase: 77.3310 },
  { name: 'Sector 26', latBase: 28.5770, lngBase: 77.3340 },
  { name: 'Sector 48', latBase: 28.5630, lngBase: 77.3570 },
  { name: 'Sector 50', latBase: 28.5610, lngBase: 77.3600 },
  { name: 'Sector 51', latBase: 28.5600, lngBase: 77.3610 },
  { name: 'Sector 52', latBase: 28.6010, lngBase: 77.3630 },
  { name: 'Sector 53', latBase: 28.6030, lngBase: 77.3650 },
  { name: 'Sector 73', latBase: 28.6050, lngBase: 77.3900 },
  { name: 'Sector 74', latBase: 28.6070, lngBase: 77.3950 },
  { name: 'Sector 75', latBase: 28.5840, lngBase: 77.3920 },
  { name: 'Sector 76', latBase: 28.5820, lngBase: 77.3960 },
  { name: 'Sector 78', latBase: 28.5790, lngBase: 77.3990 },
  { name: 'Knowledge Park I', latBase: 28.4720, lngBase: 77.4860 },
  { name: 'Knowledge Park II', latBase: 28.4680, lngBase: 77.4900 },
  { name: 'Knowledge Park III', latBase: 28.4640, lngBase: 77.4940 },
  { name: 'Techzone 4', latBase: 28.4600, lngBase: 77.4980 },
  { name: 'Greater Noida Expressway', latBase: 28.4550, lngBase: 77.5020 },
];

// ── Amenity pools ────────────────────────────────────────────────────
const amenitiesBudget = [
  'Wi-Fi', 'Power Backup', 'Security', 'Housekeeping', 'Drinking Water',
  'CCTV', 'Common Washrooms', 'Lift Access',
];

const amenitiesMid = [
  ...amenitiesBudget,
  'Meeting Room', 'Parking', 'Printer Access', 'Reception',
  'Pantry', 'AC', 'Intercom', 'Visitor Lounge',
];

const amenitiesPremium = [
  ...amenitiesMid,
  'Cafeteria', 'Gym Access', 'Rooftop Terrace', 'Concierge Service',
  'Video Conferencing', 'Dedicated IT Support', 'Sound-proof Cabins',
  'Lounge Area', 'Nap Pods', 'Shower Facility', 'EV Charging', 'Valet Parking',
];

// ── Descriptions ─────────────────────────────────────────────────────
const coworkingDescriptions = [
  'Modern coworking space with open desks and private cabins. Perfect for freelancers and small teams.',
  'Vibrant co-working environment with community events and networking opportunities.',
  'Flexible desk solutions with 24/7 access and enterprise-grade connectivity.',
  'Bright, airy coworking hub with dedicated desks and hot desking options.',
  'Community-focused workspace designed for startups and creative professionals.',
  'Plug-and-play coworking space with all amenities included. No lock-in period.',
  'Collaborative workspace with standing desks, phone booths, and brainstorm rooms.',
  'Premium coworking in a Grade A building with panoramic views of the city.',
  'Affordable coworking space ideal for solo founders and bootstrapped startups.',
  'All-inclusive coworking with complimentary coffee, snacks, and printing.',
  'Tech-enabled coworking with high-speed internet, UPS backup, and smart access.',
  'Coworking space with flexible membership plans — daily, weekly, or monthly.',
  'Well-designed workspace with ergonomic furniture and natural lighting.',
  'Inspiring coworking hub located in the heart of Noida\'s IT corridor.',
  'Boutique coworking space with curated interiors and a calm work atmosphere.',
  'Open-plan coworking with breakout zones and a fully stocked pantry.',
  'Coworking space tailored for tech teams with server room access.',
  'Multi-level coworking facility with separate zones for calls and focus work.',
  'Coworking with virtual office services including mail handling and GST registration.',
  'Sleek coworking space in a prime commercial tower. Walk from metro.',
];

const officeDescriptions = [
  'Fully furnished office space ready for immediate occupancy. Ideal for teams of 10–30.',
  'Spacious managed office with dedicated reception and pantry. Zero setup cost.',
  'Turn-key office space with custom branding options and 24/7 building access.',
  'Private office floor with meeting rooms, server room, and visitor parking.',
  'Premium office with glass partitions, modular furniture, and central AC.',
  'Leasable office in a prestigious commercial tower with excellent road connectivity.',
  'Managed office with complete IT infrastructure and admin support included.',
  'Plug-and-play office with flexible lease terms. Scale up or down anytime.',
  'Corner office with abundant natural light, city views, and modern fit-outs.',
  'Corporate-grade office space with concierge, security, and dedicated parking.',
  'Well-maintained office suitable for BPO, KPO, or IT services operations.',
  'Semi-furnished office shell in a commercial hub. Customize to your needs.',
  'Office space with attached pantry, storage room, and 3-phase power supply.',
  'Managed office solution with shared meeting rooms and a business lounge.',
  'Compact office ideal for consultancy firms, law offices, or agency teams.',
  'Large open-plan office with high ceilings and exposed ductwork aesthetic.',
  'Office with private cabins, workstations, and a dedicated conference hall.',
  'Ground-floor office with road-facing entrance. Great for walk-in visibility.',
  'Office in an IT park with 100% power backup and fiber optic internet.',
  'Newly renovated office with contemporary interiors and energy-efficient systems.',
];

const possessionOptions = [
  'Ready to Move', 'Immediate', 'Within 1 Month', 'Within 2 Months',
  'Within 15 Days', 'Ready',
];

const facingOptions = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'];

// ── Utility ──────────────────────────────────────────────────────────
function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function pickN<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

// ── Generator ────────────────────────────────────────────────────────
function generateProperties(count: number) {
  const usedSlugs = new Set<string>();
  const usedTitles = new Set<string>();
  const properties: any[] = [];

  let i = 0;
  let attempts = 0;

  while (i < count && attempts < count * 5) {
    attempts++;

    const loc = pick(locations);
    const type = Math.random() < 0.45 ? 'COWORKING' : 'OFFICE';
    const prefix = pick(brandPrefixes);

    // Generate unique title
    let title: string;
    const titleVariant = rand(1, 6);
    switch (titleVariant) {
      case 1: title = `${prefix} ${loc.name}`; break;
      case 2: title = `${prefix} ${pick(brandSuffixes)} ${loc.name}`; break;
      case 3: title = `${prefix} — ${loc.name}, Noida`; break;
      case 4: title = `${prefix} ${pick(brandSuffixes)} (${loc.name})`; break;
      case 5: title = `The ${prefix} ${loc.name}`; break;
      default: title = `${prefix} ${loc.name} ${pick(brandSuffixes)}`; break;
    }

    if (usedTitles.has(title)) continue;

    let slug = slugify(title);
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${rand(100, 999)}`;
      if (usedSlugs.has(slug)) continue;
    }

    usedTitles.add(title);
    usedSlugs.add(slug);

    // Pricing tier
    const tierRoll = Math.random();
    let tier: 'budget' | 'mid' | 'premium';
    let rentPerMonth: number;
    let carpetArea: number;

    if (tierRoll < 0.3) {
      tier = 'budget';
      rentPerMonth = rand(5000, 8000);
      carpetArea = rand(200, 600);
    } else if (tierRoll < 0.7) {
      tier = 'mid';
      rentPerMonth = rand(10000, 15000);
      carpetArea = rand(500, 1800);
    } else {
      tier = 'premium';
      rentPerMonth = rand(18000, 25000);
      carpetArea = rand(1500, 5000);
    }

    // Round rent to nearest 500
    rentPerMonth = Math.round(rentPerMonth / 500) * 500;

    const superArea = Math.random() < 0.7 ? Math.round(carpetArea * (1.15 + Math.random() * 0.2)) : null;
    const totalFloors = rand(3, 25);
    const floor = rand(0, Math.min(totalFloors, 20));

    const listingType = Math.random() < 0.8 ? 'RENT' : 'BOTH';
    const price = listingType === 'BOTH' ? Math.round(carpetArea * rand(4000, 9000)) : null;

    // Amenities based on tier
    let amenities: string[];
    if (tier === 'budget') {
      amenities = pickN(amenitiesBudget, rand(4, 6));
    } else if (tier === 'mid') {
      amenities = pickN(amenitiesMid, rand(7, 11));
    } else {
      amenities = pickN(amenitiesPremium, rand(10, 16));
    }

    // Furnished status
    let furnished: string;
    if (tier === 'premium') {
      furnished = 'FURNISHED';
    } else if (tier === 'budget') {
      furnished = Math.random() < 0.6 ? 'FURNISHED' : (Math.random() < 0.5 ? 'SEMI_FURNISHED' : 'BARE_SHELL');
    } else {
      furnished = Math.random() < 0.75 ? 'FURNISHED' : 'SEMI_FURNISHED';
    }

    const descriptions = type === 'COWORKING' ? coworkingDescriptions : officeDescriptions;

    const parking = tier === 'budget' ? rand(0, 3) : tier === 'mid' ? rand(2, 8) : rand(5, 20);
    const washrooms = tier === 'budget' ? rand(1, 2) : tier === 'mid' ? rand(2, 4) : rand(3, 6);

    const isFeatured = Math.random() < 0.10;
    const isExclusive = Math.random() < 0.07;

    properties.push({
      title,
      slug,
      description: pick(descriptions),
      type,
      listingType,
      price,
      rentPerMonth,
      carpetArea,
      superArea,
      floor,
      totalFloors,
      location: loc.name,
      city: 'Noida',
      latitude: parseFloat((loc.latBase + (Math.random() - 0.5) * 0.008).toFixed(6)),
      longitude: parseFloat((loc.lngBase + (Math.random() - 0.5) * 0.008).toFixed(6)),
      amenities,
      furnished,
      possession: pick(possessionOptions),
      facing: pick(facingOptions),
      parking,
      washrooms,
      mainImageUrl: `https://picsum.photos/seed/${slug}/400/300`,
      videoUrl: null,
      isFeatured,
      isExclusive,
      isActive: true,
      isSimulated: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    i++;
  }

  return properties;
}

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Generating 550 simulated properties for Noida...');
  const data = generateProperties(550);
  console.log(`✅ Generated ${data.length} unique properties.`);

  // Use createMany in batches of 100 to avoid payload limits
  const batchSize = 100;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await prisma.property.createMany({ data: batch as any });
    console.log(`  📦 Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} records)`);
  }

  console.log(`\n🎉 Done! ${data.length} simulated properties seeded.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

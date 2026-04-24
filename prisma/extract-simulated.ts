import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'fs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('📥 Fetching simulated properties...');
  const properties = await prisma.property.findMany({
    where: { isSimulated: true },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Found ${properties.length} simulated properties.`);

  const output = JSON.stringify(properties, null, 2);
  const path = '/Users/divyanshgoyal/Downloads/simulated_properties.json';
  writeFileSync(path, output, 'utf-8');
  console.log(`✅ Saved to ${path}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

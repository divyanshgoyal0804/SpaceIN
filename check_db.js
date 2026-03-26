const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.property.findFirst({ where: { slug: 'knoihiho' } });
  console.log('knoihiho:', p);
  
  const all = await prisma.property.findMany({ 
    where: { videoUrl: { not: null } },
    select: { slug: true, videoUrl: true } 
  });
  console.log('Properties with video:', all);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

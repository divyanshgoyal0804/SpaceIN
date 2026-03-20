const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@spacein.in';
  const newPassword = 'Admin@123';
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  const admin = await prisma.admin.upsert({
    where: { email },
    update: {
      password: hashedPassword,
    },
    create: {
      email,
      password: hashedPassword,
      name: 'SpaceIn Admin',
    },
  });
  
  console.log('Admin password reset successfully for:', admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

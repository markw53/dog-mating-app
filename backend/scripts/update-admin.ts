import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: npm run make-admin -- <email>');
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { role: 'ADMIN' },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    console.log('✅ Promoted to admin:', user);
  } catch (error) {
    console.error(`❌ Could not promote "${email}" — does that account exist?`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdmin();

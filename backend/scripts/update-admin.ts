import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAdmin() {
  try {
    const user = await prisma.user.update({
      where: { email: 'admin@test.com' },
      data: { role: 'ADMIN' },
    });
    
    console.log('✅ Admin user updated:', user);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdmin();
// scripts/deleteBreeds.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllBreeds() {
  console.log('🗑️  Starting breed deletion...\n');

  try {
    const count = await prisma.breed.count();

    if (count === 0) {
      console.log('✅ No breeds found. Already empty.\n');
      process.exit(0);
    }

    console.log(`📊 Found ${count} breeds to delete`);
    console.log('⚠️  Press Ctrl+C to cancel, waiting 5 seconds...\n');
    await new Promise((r) => setTimeout(r, 5000));

    const deleted = await prisma.breed.deleteMany();

    console.log(`✅ Deleted ${deleted.count} breeds`);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllBreeds();
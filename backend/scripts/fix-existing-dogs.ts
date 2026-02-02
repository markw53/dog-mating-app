import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDogs() {
  try {
    // Update Lando
    await prisma.dog.update({
      where: { id: 'cml3iq07700012yhgn0fhlash' },
      data: {
        latitude: 51.5074,
        longitude: -0.1278,
        city: 'London',
        county: 'Greater London',
        postcode: 'SW1A 1AA' // Example postcode
      }
    });

    // Update Isla
    await prisma.dog.update({
      where: { id: 'cmku2gs3s0001ywjxrlee4wr7' },
      data: {
        latitude: 51.5174, // Slightly different to show both pins
        longitude: -0.1378,
        city: 'London',
        county: 'Greater London',
        postcode: 'SW1A 2AA'
      }
    });

    console.log('✅ Dogs updated with coordinates!');

    // Verify
    const dogs = await prisma.dog.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        latitude: true,
        longitude: true
      }
    });

    console.log('\nUpdated dogs:');
    dogs.forEach(dog => {
      console.log(`${dog.name}: ${dog.city} (${dog.latitude}, ${dog.longitude})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDogs();
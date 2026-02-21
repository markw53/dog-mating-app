// scripts/geocodeDogs.ts
import { PrismaClient } from '@prisma/client';
import { geocodeAddress, getFallbackCoordinates } from '../src/utils/geocoding';

const prisma = new PrismaClient();

async function geocodeAllDogs() {
  console.log('📍 Starting geocoding for dogs without coordinates...\n');

  try {
    const dogs = await prisma.dog.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null },
        ],
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        county: true,
        postcode: true,
        country: true,
      },
    });

    if (dogs.length === 0) {
      console.log('✅ All dogs already have coordinates!\n');
      return;
    }

    console.log(`📊 Found ${dogs.length} dogs without coordinates\n`);

    let success = 0;
    let failed = 0;

    for (const dog of dogs) {
      try {
        console.log(`\nProcessing: ${dog.name} (${dog.city}, ${dog.county}, ${dog.postcode})`);

        let coords = await geocodeAddress(
          dog.address,
          dog.city,
          dog.county,
          dog.postcode,
          dog.country || 'UK'
        );

        // Try fallback if geocoding failed
        if (!coords) {
          coords = getFallbackCoordinates(dog.city);
        }

        if (coords) {
          await prisma.dog.update({
            where: { id: dog.id },
            data: {
              latitude: coords.latitude,
              longitude: coords.longitude,
            },
          });

          success++;
          console.log(`  ✅ ${dog.name} -> ${coords.latitude}, ${coords.longitude}`);
        } else {
          failed++;
          console.log(`  ❌ ${dog.name} - could not geocode`);
        }

        // Rate limit: 1 request per second
        await new Promise((resolve) => setTimeout(resolve, 1100));
      } catch (err) {
        failed++;
        console.error(`  ❌ Error: ${err instanceof Error ? err.message : err}`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📍 Geocoding Complete!');
    console.log(`✅ Success: ${success}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('='.repeat(50));
  } catch (err) {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

geocodeAllDogs();
// scripts/importBreeds.ts
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

interface KennelClubBreed {
  name: string;
  type: string;
  height: string;
  weight: string;
  color: string;
  longevity: string;
  healthProblems: string;
  imageUrl?: string;
  officialLink?: string;
  kennelClubCategory?: string;
  size?: string;
  exerciseNeeds?: string;
  grooming?: string;
  temperament?: string;
  goodWithChildren?: string;
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[\s\W]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'unknown-breed';
}

function sanitize(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace(/\0/g, '').trim();
}

function createSearchKeywords(breed: KennelClubBreed): string[] {
  const keywords = [
    breed.name.toLowerCase(),
    breed.type?.toLowerCase() || '',
    breed.kennelClubCategory?.toLowerCase() || '',
    ...breed.name.toLowerCase().split(/[\s\W]+/),
  ];
  return [...new Set(keywords.filter((k) => k.length > 0))];
}

async function importBreeds() {
  console.log('🐕 Starting breed import from Royal Kennel Club data...\n');

  try {
    const raw = fs.readFileSync('./kennel_club_breeds.json', 'utf8');
    const breeds: KennelClubBreed[] = JSON.parse(raw);

    console.log(`📊 Found ${breeds.length} breeds to import\n`);

    let success = 0;
    let errors = 0;
    const failed: string[] = [];

    for (const breed of breeds) {
      if (!breed.name?.trim()) {
        console.log('⏭️  Skipping empty breed name');
        continue;
      }

      try {
        const slug = createSlug(breed.name);
        const keywords = createSearchKeywords(breed);

        console.log(`Processing: ${breed.name} -> ${slug} [${breed.type}]`);

        await prisma.breed.upsert({
          where: { slug },
          update: {
            name: sanitize(breed.name),
            type: sanitize(breed.type) || 'Non-Sporting',
            height: sanitize(breed.height) || null,
            weight: sanitize(breed.weight) || null,
            color: sanitize(breed.color) || 'Various',
            longevity: sanitize(breed.longevity) || null,
            healthProblems: sanitize(breed.healthProblems) || null,
            imageUrl: sanitize(breed.imageUrl) || null,
            officialLink: sanitize(breed.officialLink) || null,
            kennelClubCategory: sanitize(breed.kennelClubCategory) || null,
            size: sanitize(breed.size) || null,
            exerciseNeeds: sanitize(breed.exerciseNeeds) || null,
            grooming: sanitize(breed.grooming) || null,
            temperament: sanitize(breed.temperament) || null,
            goodWithChildren: sanitize(breed.goodWithChildren) || null,
            searchKeywords: keywords,
          },
          create: {
            name: sanitize(breed.name),
            slug,
            type: sanitize(breed.type) || 'Non-Sporting',
            height: sanitize(breed.height) || null,
            weight: sanitize(breed.weight) || null,
            color: sanitize(breed.color) || 'Various',
            longevity: sanitize(breed.longevity) || null,
            healthProblems: sanitize(breed.healthProblems) || null,
            imageUrl: sanitize(breed.imageUrl) || null,
            officialLink: sanitize(breed.officialLink) || null,
            kennelClubCategory: sanitize(breed.kennelClubCategory) || null,
            size: sanitize(breed.size) || null,
            exerciseNeeds: sanitize(breed.exerciseNeeds) || null,
            grooming: sanitize(breed.grooming) || null,
            temperament: sanitize(breed.temperament) || null,
            goodWithChildren: sanitize(breed.goodWithChildren) || null,
            searchKeywords: keywords,
          },
        });

        success++;
        console.log(`✅ ${success}/${breeds.length}: ${breed.name}`);
      } catch (err) {
        errors++;
        failed.push(breed.name);
        console.error(
          `❌ Error importing ${breed.name}:`,
          err instanceof Error ? err.message : String(err)
        );
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Import Complete!');
    console.log(`✅ Success: ${success}`);
    console.log(`❌ Failed: ${errors}`);

    if (failed.length > 0) {
      console.log('\nFailed breeds:');
      failed.forEach((n) => console.log(`   - ${n}`));
    }

    const typeCounts = await prisma.breed.groupBy({
      by: ['type'],
      _count: { type: true },
      orderBy: { type: 'asc' },
    });

    console.log('\n📈 Breed Type Distribution:');
    typeCounts.forEach((g) => console.log(`   ${g.type}: ${g._count.type}`));
    console.log('='.repeat(50));
  } catch (err) {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importBreeds();
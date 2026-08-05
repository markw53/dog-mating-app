import type { Metadata } from 'next';
import BreedDetailClient from './BreedDetailClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Breed pages are stable reference content — ideal long-tail search targets
// ("labrador lifespan UK"), so give them real titles and descriptions.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`${API_URL}/breeds/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('not found');

    const { data: breed } = await res.json();
    const temperament = (breed.temperament || '').replace(/\s+/g, ' ').slice(0, 120);

    return {
      title: `${breed.name} — Breed Guide`,
      description:
        `${breed.name} breed guide: ${[
          breed.size && `size ${breed.size}`,
          breed.longevity && `lifespan ${breed.longevity}`,
          temperament,
        ]
          .filter(Boolean)
          .join(' · ')}`.slice(0, 160) ||
        `Everything about the ${breed.name} — temperament, health, size and care.`,
      openGraph: {
        title: `${breed.name} — Breed Guide | DogMate`,
        description: temperament || `Everything about the ${breed.name}.`,
        images: breed.imageUrl ? [{ url: breed.imageUrl }] : undefined,
        type: 'article',
      },
    };
  } catch {
    return {
      title: 'Breed Guide',
      description: 'Dog breed information sourced from The Royal Kennel Club.',
    };
  }
}

export default function BreedDetailPage() {
  return <BreedDetailClient />;
}

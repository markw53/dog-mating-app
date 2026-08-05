import type { Metadata } from 'next';
import DogDetailClient from './DogDetailClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Server-side metadata so shared dog links unfurl with a real title, blurb
// and photo. The unauthenticated API only returns ACTIVE dogs, so pending or
// rejected listings fall back to the generic tags.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(`${API_URL}/dogs/${id}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error('not found');

    const { dog } = await res.json();
    const description = (dog.description || '')
      .replace(/\s+/g, ' ')
      .slice(0, 160);

    return {
      title: `${dog.name} – ${dog.breed}`,
      description:
        description ||
        `${dog.name}, a ${dog.breed} in ${dog.city}, available on DogMate.`,
      openGraph: {
        title: `${dog.name} – ${dog.breed} | DogMate`,
        description:
          description || `${dog.name}, a ${dog.breed} in ${dog.city}.`,
        images: dog.mainImage ? [{ url: dog.mainImage }] : undefined,
        type: 'website',
      },
    };
  } catch {
    return {
      title: 'Dog Profile',
      description: 'View this dog on DogMate — responsible breeding, made simple.',
    };
  }
}

export default function DogDetailPage() {
  return <DogDetailClient />;
}

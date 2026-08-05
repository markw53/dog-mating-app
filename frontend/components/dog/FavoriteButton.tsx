'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useFavoritesStore } from '@/lib/store/favoritesStore';
import toast from 'react-hot-toast';

interface FavoriteButtonProps {
  dogId: string;
  // 'overlay' = round white chip for image corners; 'button' = full-width
  // secondary-style action for detail sidebars
  variant?: 'overlay' | 'button';
  className?: string;
}

export default function FavoriteButton({
  dogId,
  variant = 'overlay',
  className = '',
}: FavoriteButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { ids, load, toggle } = useFavoritesStore();
  const saved = ids.has(dogId);

  // Populate heart states once per session for signed-in users
  useEffect(() => {
    if (isAuthenticated) {
      load();
    }
  }, [isAuthenticated, load]);

  const handleClick = async (e: React.MouseEvent) => {
    // Hearts live inside card Links — the click must not navigate
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast('Sign in to save dogs');
      router.push('/login');
      return;
    }

    try {
      const nowSaved = await toggle(dogId);
      toast.success(nowSaved ? 'Saved to your dogs' : 'Removed from saved');
    } catch {
      toast.error('Could not update — please try again');
    }
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        aria-pressed={saved}
        className={`w-full flex items-center justify-center py-3 rounded-lg border transition-colors font-semibold ${
          saved
            ? 'bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        } ${className}`}
      >
        <Heart
          className={`h-5 w-5 mr-2 ${saved ? 'fill-pink-500 text-pink-500' : ''}`}
          aria-hidden="true"
        />
        {saved ? 'Saved' : 'Save'}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved dogs' : 'Save this dog'}
      title={saved ? 'Remove from saved dogs' : 'Save this dog'}
      className={`bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:scale-110 transition-transform ${className}`}
    >
      <Heart
        className={`h-5 w-5 ${saved ? 'fill-pink-500 text-pink-500' : 'text-gray-600'}`}
        aria-hidden="true"
      />
    </button>
  );
}

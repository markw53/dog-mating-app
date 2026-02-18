'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { breedsApi, Breed } from '@/lib/api/breeds';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { Search, Loader2, X } from 'lucide-react';
import Image from 'next/image';

export default function BreedSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    let cancelled = false;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await breedsApi.search(debouncedQuery);
        if (!cancelled) {
          setResults(response.data);
          setIsOpen(true);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (slug: string) => {
      setQuery('');
      setIsOpen(false);
      router.push(`/breeds/${slug}`);
    },
    [router]
  );

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search breeds... e.g. Labrador, Poodle, Terrier"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0 && query.trim()) setIsOpen(true);
          }}
          className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm bg-white"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {loading && (
          <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary-500" />
        )}
      </div>

      {/* Dropdown results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto z-50">
          {results.length === 0 && !loading && (
            <div className="p-4 text-center text-gray-500 text-sm">
              No breeds found for &ldquo;{query}&rdquo;
            </div>
          )}

          {results.map((breed) => (
            <button
              key={breed.id}
              onClick={() => handleSelect(breed.slug)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
            >
              {/* Breed thumbnail */}
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {breed.imageUrl ? (
                  <Image
                    src={breed.imageUrl}
                    alt={breed.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg">
                    🐕
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {breed.name}
                </p>
                <p className="text-xs text-gray-500">
                  {breed.type}
                  {breed.size && ` · ${breed.size}`}
                </p>
              </div>

              {breed.kennelClubCategory && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex-shrink-0">
                  {breed.kennelClubCategory}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
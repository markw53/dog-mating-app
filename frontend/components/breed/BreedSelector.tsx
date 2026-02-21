/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { breedsApi, Breed } from '@/lib/api/breeds';
import { useDebounce } from '@/lib/hooks/useDebounce';
import {
  Search,
  Loader2,
  X,
  ChevronDown,
  Ruler,
  Weight,
  Clock,
  Activity,
  Scissors,
  Baby,
  ExternalLink,
  Info,
} from 'lucide-react';
import Link from 'next/link';

interface BreedSelectorProps {
  value: string;
  onChange: (breedName: string, breedData?: Breed) => void;
  required?: boolean;
  error?: string;
}

export default function BreedSelector({
  value,
  onChange,
  required = false,
  error,
}: BreedSelectorProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Breed[]>([]);
  const [allBreeds, setAllBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBreed, setSelectedBreed] = useState<Breed | null>(null);
  const [showBreedInfo, setShowBreedInfo] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 250);

  // Load all breeds on mount for the initial dropdown
  useEffect(() => {
    const fetchAllBreeds = async () => {
      try {
        const response = await breedsApi.getAll({ limit: 300, sortBy: 'name' });
        setAllBreeds(response.data);
      } catch (err) {
        console.error('Failed to fetch breeds:', err);
      }
    };
    fetchAllBreeds();
  }, []);

  // If a value is set (e.g., editing), try to find the matching breed
  useEffect(() => {
    if (value && allBreeds.length > 0 && !selectedBreed) {
      const match = allBreeds.find(
        (b) => b.name.toLowerCase() === value.toLowerCase()
      );
      if (match) {
        setSelectedBreed(match);
      }
    }
  }, [value, allBreeds, selectedBreed]);

  // Search breeds when query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults(allBreeds.slice(0, 20));
      return;
    }

    const searchBreeds = async () => {
      setLoading(true);
      try {
        const response = await breedsApi.search(debouncedQuery, 20);
        setResults(response.data);
      } catch  {
        // Fallback to local filtering
        const filtered = allBreeds.filter((b) =>
          b.name.toLowerCase().includes(debouncedQuery.toLowerCase())
        );
        setResults(filtered.slice(0, 20));
      } finally {
        setLoading(false);
      }
    };

    searchBreeds();
  }, [debouncedQuery, allBreeds]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (breed: Breed) => {
      setSelectedBreed(breed);
      setQuery('');
      setIsOpen(false);
      setShowBreedInfo(true);
      onChange(breed.name, breed);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    setSelectedBreed(null);
    setQuery('');
    setShowBreedInfo(false);
    onChange('');
    // Focus the input after clearing
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [onChange]);

  const handleInputFocus = () => {
    setIsOpen(true);
    if (!query.trim()) {
      setResults(allBreeds.slice(0, 20));
    }
  };

  // Group breeds by type for the dropdown
  const groupedResults = results.reduce<Record<string, Breed[]>>((acc, breed) => {
    const group = breed.type || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(breed);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="block text-sm font-semibold text-gray-700">
        Breed {required && <span className="text-red-500">*</span>}
      </label>

      {/* Selector */}
      <div ref={wrapperRef} className="relative">
        {/* Selected breed display */}
        {selectedBreed && !isOpen ? (
          <div
            className={`flex items-center justify-between border rounded-xl px-4 py-3 cursor-pointer transition-all ${
              error
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 bg-white hover:border-primary-400'
            }`}
            onClick={() => {
              setIsOpen(true);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
          >
            <div className="flex items-center gap-3">
              {/* Breed thumbnail */}
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {selectedBreed.imageUrl ? (
                  <img
                    src={selectedBreed.imageUrl}
                    alt={selectedBreed.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg">
                    🐕
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedBreed.name}</p>
                <p className="text-xs text-gray-500">
                  {selectedBreed.type}
                  {selectedBreed.kennelClubCategory &&
                    ` · KC: ${selectedBreed.kennelClubCategory}`}
                  {selectedBreed.size && ` · ${selectedBreed.size}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBreedInfo(!showBreedInfo);
                }}
                className="text-gray-400 hover:text-primary-600 p-1 rounded-md hover:bg-primary-50 transition-colors"
                title="Toggle breed info"
              >
                <Info className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="text-gray-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                title="Clear selection"
              >
                <X className="h-4 w-4" />
              </button>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        ) : (
          /* Search input */
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search breeds... e.g. Labrador, Poodle"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleInputFocus}
              className={`w-full pl-10 pr-10 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                error ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary-500" />
            )}
            {query && !loading && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  if (selectedBreed) {
                    setIsOpen(false);
                  }
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 overflow-y-auto z-50">
            {/* Quick note */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <p className="text-xs text-gray-500">
                {query.trim()
                  ? `${results.length} breed${results.length !== 1 ? 's' : ''} matching "${query}"`
                  : `Showing ${results.length} breeds · Type to search`}
              </p>
            </div>

            {results.length === 0 && !loading && (
              <div className="p-4 text-center">
                <p className="text-gray-500 text-sm mb-2">
                  No breeds found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-gray-400">
                  You can still type a custom breed name
                </p>
                {query.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange(query.trim());
                      setQuery('');
                      setIsOpen(false);
                      setSelectedBreed(null);
                      setShowBreedInfo(false);
                    }}
                    className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Use &ldquo;{query.trim()}&rdquo; as breed name
                  </button>
                )}
              </div>
            )}

            {/* Grouped results */}
            {Object.entries(groupedResults).map(([group, breeds]) => (
              <div key={group}>
                {/* Group header - only show if searching or multiple groups */}
                {(query.trim() || Object.keys(groupedResults).length > 1) && (
                  <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {group}
                    </p>
                  </div>
                )}

                {breeds.map((breed) => (
                  <button
                    key={breed.id}
                    type="button"
                    onClick={() => handleSelect(breed)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary-50 transition-colors text-left border-b border-gray-50 last:border-0 ${
                      selectedBreed?.id === breed.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {breed.imageUrl ? (
                        <img
                          src={breed.imageUrl}
                          alt={breed.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-base">
                          🐕
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {breed.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {breed.size && `${breed.size}`}
                        {breed.longevity && ` · ${breed.longevity}`}
                      </p>
                    </div>

                    {/* KC badge */}
                    {breed.kennelClubCategory && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex-shrink-0">
                        {breed.kennelClubCategory}
                      </span>
                    )}

                    {/* Check if selected */}
                    {selectedBreed?.id === breed.id && (
                      <span className="text-primary-600 flex-shrink-0">✓</span>
                    )}
                  </button>
                ))}
              </div>
            ))}

            {/* Custom breed option at bottom */}
            {query.trim() && results.length > 0 && (
              <div className="border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    onChange(query.trim());
                    setQuery('');
                    setIsOpen(false);
                    setSelectedBreed(null);
                    setShowBreedInfo(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-400">Don&apos;t see your breed?</span>{' '}
                  <span className="text-primary-600 font-medium">
                    Use &ldquo;{query.trim()}&rdquo;
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Hidden input for form validation */}
      <input type="hidden" name="breed" value={value} required={required} />

      {/* Breed Info Panel */}
      {selectedBreed && showBreedInfo && (
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-4 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary-600" />
              <h4 className="font-bold text-gray-900 text-sm">
                {selectedBreed.name} — Breed Info
              </h4>
            </div>
            <div className="flex items-center gap-2">
              {selectedBreed.officialLink && (
                <a
                  href={selectedBreed.officialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  KC Page
                </a>
              )}
              <Link
                href={`/breeds/${selectedBreed.slug}`}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Full Details →
              </Link>
              <button
                type="button"
                onClick={() => setShowBreedInfo(false)}
                className="text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {selectedBreed.height && (
              <div className="flex items-center gap-2 text-sm">
                <Ruler className="h-3.5 w-3.5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Height</p>
                  <p className="font-medium text-gray-900 text-xs">
                    {selectedBreed.height}
                  </p>
                </div>
              </div>
            )}
            {selectedBreed.weight && (
              <div className="flex items-center gap-2 text-sm">
                <Weight className="h-3.5 w-3.5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Weight</p>
                  <p className="font-medium text-gray-900 text-xs">
                    {selectedBreed.weight}
                  </p>
                </div>
              </div>
            )}
            {selectedBreed.longevity && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Lifespan</p>
                  <p className="font-medium text-gray-900 text-xs">
                    {selectedBreed.longevity}
                  </p>
                </div>
              </div>
            )}
            {selectedBreed.exerciseNeeds && (
              <div className="flex items-center gap-2 text-sm">
                <Activity className="h-3.5 w-3.5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Exercise</p>
                  <p className="font-medium text-gray-900 text-xs">
                    {selectedBreed.exerciseNeeds}
                  </p>
                </div>
              </div>
            )}
            {selectedBreed.grooming && (
              <div className="flex items-center gap-2 text-sm">
                <Scissors className="h-3.5 w-3.5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Grooming</p>
                  <p className="font-medium text-gray-900 text-xs">
                    {selectedBreed.grooming}
                  </p>
                </div>
              </div>
            )}
            {selectedBreed.goodWithChildren && (
              <div className="flex items-center gap-2 text-sm">
                <Baby className="h-3.5 w-3.5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Children</p>
                  <p className="font-medium text-gray-900 text-xs">
                    {selectedBreed.goodWithChildren}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Temperament */}
          {selectedBreed.temperament && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Temperament</p>
              <p className="text-xs text-gray-700">{selectedBreed.temperament}</p>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-gray-400 italic">
            Source: The Royal Kennel Club ·{' '}
            <a
              href="https://www.royalkennelclub.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              royalkennelclub.com
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
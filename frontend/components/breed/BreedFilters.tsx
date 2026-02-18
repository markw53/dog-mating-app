'use client';

import { useState, useEffect } from 'react';
import { breedsApi } from '@/lib/api/breeds';
import { Card } from '@/components/ui/Card';
import { Filter, X } from 'lucide-react';

export interface BreedFilterValues {
  type: string;
  size: string;
  search: string;
}

interface BreedFiltersProps {
  filters: BreedFilterValues;
  onFilterChange: (filters: BreedFilterValues) => void;
}

const BREED_TYPES = [
  'Sporting',
  'Hound',
  'Herding',
  'Terrier',
  'Toy',
  'Non-Sporting',
  'Working',
];

const BREED_SIZES = ['Small', 'Medium', 'Large'];

export default function BreedFilters({
  filters,
  onFilterChange,
}: BreedFiltersProps) {
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({});
  const [sizeCounts, setSizeCounts] = useState<Record<string, number>>({});

  // Fetch counts for filter badges
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await breedsApi.getTypes();
        if (response.success) {
          const tc: Record<string, number> = {};
          response.data.types.forEach((t) => {
            tc[t.name] = t.count;
          });
          setTypeCounts(tc);

          const sc: Record<string, number> = {};
          response.data.sizes.forEach((s) => {
            if (s.name) sc[s.name] = s.count;
          });
          setSizeCounts(sc);
        }
      } catch (err) {
        console.error('Failed to fetch breed type counts:', err);
      }
    };
    fetchCounts();
  }, []);

  const handleChange = (key: keyof BreedFilterValues, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({ type: '', size: '', search: '' });
  };

  const hasActiveFilters = filters.type || filters.size || filters.search;

  return (
    <Card hover={false} className="p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary-600" />
          <h3 className="font-bold text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Breeds
        </label>
        <input
          type="text"
          placeholder="e.g. Labrador, Poodle..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
        />
      </div>

      {/* Breed Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Breed Group
        </label>
        <div className="space-y-2">
          <button
            onClick={() => handleChange('type', '')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !filters.type
                ? 'bg-primary-50 text-primary-700 font-semibold'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Groups
          </button>
          {BREED_TYPES.map((type) => (
            <button
              key={type}
              onClick={() =>
                handleChange('type', filters.type === type ? '' : type)
              }
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                filters.type === type
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{type}</span>
              {typeCounts[type] !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    filters.type === type
                      ? 'bg-primary-200 text-primary-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {typeCounts[type]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Size
        </label>
        <div className="space-y-2">
          <button
            onClick={() => handleChange('size', '')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !filters.size
                ? 'bg-primary-50 text-primary-700 font-semibold'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Sizes
          </button>
          {BREED_SIZES.map((size) => (
            <button
              key={size}
              onClick={() =>
                handleChange('size', filters.size === size ? '' : size)
              }
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                filters.size === size
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{size}</span>
              {sizeCounts[size] !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    filters.size === size
                      ? 'bg-primary-200 text-primary-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {sizeCounts[size]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Kennel Club disclaimer */}
      <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-800">
          <strong>Disclaimer:</strong> Breed information sourced from The Royal
          Kennel Club. Visit{' '}
          <a
            href="https://www.royalkennelclub.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-amber-900"
          >
            royalkennelclub.com
          </a>{' '}
          for official breed standards.
        </p>
      </div>
    </Card>
  );
}
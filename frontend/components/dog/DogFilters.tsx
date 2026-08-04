'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/lib/hooks/useDebounce';

interface FiltersProps {
  filters: {
    breed: string;
    gender: string;
    minAge: string;
    maxAge: string;
    city: string;
    county: string;
    available: boolean;
  };
  onFilterChange: (filters: {
    breed: string;
    gender: string;
    minAge: string;
    maxAge: string;
    city: string;
    county: string;
    available: boolean;
  }) => void;
}

const POPULAR_BREEDS = [
  'Labrador Retriever',
  'German Shepherd',
  'Golden Retriever',
  'French Bulldog',
  'Bulldog',
  'Poodle',
  'Beagle',
  'Rottweiler',
  'Yorkshire Terrier',
  'German Shorthaired Pointer',
];

export default function DogFilters({ filters, onFilterChange }: FiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  
  // Debounce the entire filters object
  const debouncedFilters = useDebounce(localFilters, 500);

  // Apply filters automatically when debounced value changes
  useEffect(() => {
    onFilterChange(debouncedFilters);
  }, [debouncedFilters, onFilterChange]);

  const handleChange = (
    field: keyof typeof localFilters,
    value: string | boolean
  ) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      breed: '',
      gender: '',
      minAge: '',
      maxAge: '',
      city: '',
      county: '',
      available: true,
    };
    setLocalFilters(resetFilters);
    // Immediately apply reset without waiting for debounce
    onFilterChange(resetFilters);
  };

  return (
    <aside className="card sticky top-4" aria-labelledby="dog-filters-heading">
      <h3 id="dog-filters-heading" className="text-lg font-semibold mb-4">Filters</h3>

      <div className="space-y-4">
        {/* Breed */}
        <div>
          <label htmlFor="filter-breed" className="block text-sm font-medium text-gray-700 mb-1">
            Breed
          </label>
          <select
            id="filter-breed"
            value={localFilters.breed}
            onChange={(e) => handleChange('breed', e.target.value)}
            className="input-field"
          >
            <option value="">All Breeds</option>
            {POPULAR_BREEDS.map((breed) => (
              <option key={breed} value={breed}>
                {breed}
              </option>
            ))}
          </select>
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="filter-gender" className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select
            id="filter-gender"
            value={localFilters.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
            className="input-field"
          >
            <option value="">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        {/* Age Range */}
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-1">
            Age Range (years)
          </legend>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              aria-label="Minimum age in years"
              value={localFilters.minAge}
              onChange={(e) => handleChange('minAge', e.target.value)}
              className="input-field"
              min="0"
            />
            <input
              type="number"
              placeholder="Max"
              aria-label="Maximum age in years"
              value={localFilters.maxAge}
              onChange={(e) => handleChange('maxAge', e.target.value)}
              className="input-field"
              min="0"
            />
          </div>
        </fieldset>

        {/* Location */}
        <div>
          <label htmlFor="filter-city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            id="filter-city"
            type="text"
            placeholder="Enter city"
            value={localFilters.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="filter-county" className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <input
            id="filter-county"
            type="text"
            placeholder="Enter County"
            value={localFilters.county}
            onChange={(e) => handleChange('county', e.target.value)}
            className="input-field"
          />
        </div>

        {/* Availability */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="available"
            checked={localFilters.available}
            onChange={(e) => handleChange('available', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="available" className="ml-2 text-sm text-gray-700">
            Available for breeding only
          </label>
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t">
          <button onClick={handleReset} className="btn-secondary w-full">
            Reset Filters
          </button>
        </div>
      </div>
    </aside>
  );
}
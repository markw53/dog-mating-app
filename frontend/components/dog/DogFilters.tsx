'use client';

import { useState } from 'react';

interface FiltersProps {
  filters: {
    breed: string;
    gender: string;
    minAge: string;
    maxAge: string;
    city: string;
    state: string;
    available: boolean;
  };
  onFilterChange: (filters: {
    breed: string;
    gender: string;
    minAge: string;
    maxAge: string;
    city: string;
    state: string;
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

  const handleChange = (
    field: keyof typeof localFilters,
    value: string | boolean
  ) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
  };

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      breed: '',
      gender: '',
      minAge: '',
      maxAge: '',
      city: '',
      state: '',
      available: true,
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="card sticky top-4">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>

      <div className="space-y-4">
        {/* Breed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Breed
          </label>
          <select
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Age Range (years)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={localFilters.minAge}
              onChange={(e) => handleChange('minAge', e.target.value)}
              className="input-field"
              min="0"
            />
            <input
              type="number"
              placeholder="Max"
              value={localFilters.maxAge}
              onChange={(e) => handleChange('maxAge', e.target.value)}
              className="input-field"
              min="0"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            placeholder="Enter city"
            value={localFilters.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <input
            type="text"
            placeholder="Enter state"
            value={localFilters.state}
            onChange={(e) => handleChange('state', e.target.value)}
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

        {/* Buttons */}
        <div className="space-y-2 pt-4 border-t">
          <button onClick={handleApply} className="btn-primary w-full">
            Apply Filters
          </button>
          <button onClick={handleReset} className="btn-secondary w-full">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
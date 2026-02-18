'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { breedsApi, Breed } from '@/lib/api/breeds';
import { useDebounce } from '@/lib/hooks/useDebounce';
import BreedCard from '@/components/breed/BreedCard';
import BreedFilters, {
  BreedFilterValues,
} from '@/components/breed/BreedFilters';
import BreedSearch from '@/components/breed/BreedSearch';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import {
  Loader2,
  SlidersHorizontal,
  RefreshCw,
  BookOpen,
  Grid3X3,
  List,
} from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_FILTERS: BreedFilterValues = {
  type: '',
  size: '',
  search: '',
};

export default function BreedsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // State
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalBreeds, setTotalBreeds] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters from URL
  const [filters, setFilters] = useState<BreedFilterValues>(() => ({
    type: searchParams.get('type') || '',
    size: searchParams.get('size') || '',
    search: searchParams.get('search') || '',
  }));

  const debouncedFilters = useDebounce(filters, 300);
  const isFiltering = filters !== debouncedFilters;

  // Fetch breeds
  const fetchBreeds = useCallback(async () => {
    try {
        setLoading(true);
        setError(null);

        if (debouncedFilters.search.trim()) {
        const response = await breedsApi.search(debouncedFilters.search, 100);
        let filtered = response.data;

        if (debouncedFilters.type) {
            filtered = filtered.filter((b) => b.type === debouncedFilters.type);
        }
        if (debouncedFilters.size) {
            filtered = filtered.filter(
            (b) =>
                b.size &&
                b.size.toLowerCase().includes(debouncedFilters.size.toLowerCase())
            );
        }

        setBreeds(filtered);
        setTotalBreeds(filtered.length);
        setTotalPages(1);
        setPage(1);
        } else {
        const response = await breedsApi.getAll({
            type: debouncedFilters.type || undefined,
            size: debouncedFilters.size || undefined,
            page,
            limit: 24,
        });

        setBreeds(response.data);
        setTotalBreeds(response.pagination.total);
        setTotalPages(response.pagination.totalPages);
        }
    } catch (err) {
        setError('Failed to fetch breeds');
        toast.error('Failed to load breeds. Please try again.');
        console.error(err);
    } finally {
        setLoading(false);
    }
    }, [debouncedFilters, page]);

    useEffect(() => {
    fetchBreeds();
    }, [fetchBreeds]);

  // Update URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedFilters.type) params.set('type', debouncedFilters.type);
    if (debouncedFilters.size) params.set('size', debouncedFilters.size);
    if (debouncedFilters.search) params.set('search', debouncedFilters.search);
    if (page > 1) params.set('page', page.toString());

    const queryString = params.toString();
    const newPath = queryString ? `/breeds?${queryString}` : '/breeds';
    const currentPath = window.location.pathname + window.location.search;

    if (currentPath !== newPath) {
      router.replace(newPath, { scroll: false });
    }
  }, [debouncedFilters, page, router]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedFilters]);

  const handleFilterChange = (newFilters: BreedFilterValues) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const hasActiveFilters = filters.type || filters.size || filters.search;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <Section variant="primary" className="py-16 md:py-20">
        <div className="text-center">
          <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            📖 Royal Kennel Club Breed Guide
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Dog Breed Directory
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto mb-8">
            Explore breed information sourced from The Royal Kennel Club
          </p>

          {/* Search bar in hero */}
          <BreedSearch />
        </div>
      </Section>

      {/* Main Content */}
      <section className="py-12 -mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar - Desktop */}
            <aside className="hidden lg:block lg:col-span-1">
              <BreedFilters
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </aside>

            {/* Mobile Filter Button */}
            <div className="lg:hidden col-span-1">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full btn-primary flex items-center justify-center mb-4"
              >
                <SlidersHorizontal className="h-5 w-5 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>

              {showFilters && (
                <BreedFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              )}
            </div>

            {/* Breeds Grid */}
            <main className="lg:col-span-3">
              {/* Toolbar */}
              <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-900">
                      {totalBreeds}
                    </span>{' '}
                    breeds found
                  </p>
                  {isFiltering && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                    >
                      Clear all filters
                    </button>
                  )}

                  {/* View toggle */}
                  <div className="flex bg-gray-100 rounded-lg p-0.5">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-white shadow-sm text-primary-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'list'
                          ? 'bg-white shadow-sm text-primary-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={fetchBreeds}
                    disabled={loading}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                    title="Refresh results"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                    />
                  </button>
                </div>
              </div>

              {/* Error State */}
              {error && (
                <Card hover={false} className="text-center py-12 mb-6">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Failed to load breeds
                    </h3>
                    <p className="text-gray-600 mb-6">
                      There was an error fetching breed data. Please try again.
                    </p>
                    <button onClick={fetchBreeds} className="btn-primary">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </button>
                  </div>
                </Card>
              )}

              {/* Loading State */}
              {loading && !error && (
                <div className="flex justify-center items-center py-20">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading breeds...</p>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && breeds.length === 0 && (
                <Card hover={false} className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      No breeds found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your filters or search term
                    </p>
                    <button onClick={clearFilters} className="btn-secondary">
                      Clear All Filters
                    </button>
                  </div>
                </Card>
              )}

              {/* Breeds Grid */}
              {!loading && !error && breeds.length > 0 && (
                <>
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                        : 'space-y-4'
                    }
                  >
                    {breeds.map((breed) => (
                      <BreedCard key={breed.id} breed={breed} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-10 flex justify-center items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(totalPages, 7) },
                          (_, i) => {
                            let pageNum: number;
                            if (totalPages <= 7) {
                              pageNum = i + 1;
                            } else if (page <= 4) {
                              pageNum = i + 1;
                            } else if (page >= totalPages - 3) {
                              pageNum = totalPages - 6 + i;
                            } else {
                              pageNum = page - 3 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => setPage(pageNum)}
                                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                                  page === pageNum
                                    ? 'bg-primary-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}
                      </div>

                      <button
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Disclaimer */}
              <div className="mt-10 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800">
                  <strong>⚠️ Disclaimer:</strong> Breed information displayed on
                  this page is sourced from The Royal Kennel Club website and is
                  provided for informational purposes only. For official breed
                  standards, health testing requirements, and registration
                  details, please visit{' '}
                  <a
                    href="https://www.royalkennelclub.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold hover:text-amber-900"
                  >
                    www.royalkennelclub.com
                  </a>
                  .
                </p>
              </div>
            </main>
          </div>
        </div>
      </section>
    </div>
  );
}
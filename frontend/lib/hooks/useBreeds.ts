'use client';

import { useState, useEffect, useCallback } from 'react';
import { breedsApi, Breed, BreedsResponse } from '@/lib/api/breeds';

export function useBreeds(params?: {
  type?: string;
  size?: string;
  page?: number;
  limit?: number;
}) {
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [pagination, setPagination] = useState<BreedsResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Destructure to get stable primitive values for dependencies
  const type = params?.type;
  const size = params?.size;
  const page = params?.page;
  const limit = params?.limit;

  const fetchBreeds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await breedsApi.getAll({ type, size, page, limit });
      setBreeds(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError('Failed to fetch breeds');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [type, size, page, limit]);

  useEffect(() => {
    fetchBreeds();
  }, [fetchBreeds]);

  return { breeds, pagination, loading, error, refetch: fetchBreeds };
}

export function useBreed(slug: string) {
  const [breed, setBreed] = useState<Breed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchBreed = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await breedsApi.getBySlug(slug);
        setBreed(response.data);
      } catch (err) {
        setError('Breed not found');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBreed();
  }, [slug]);

  return { breed, loading, error };
}

export function useBreedSearch() {
  const [results, setResults] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await breedsApi.search(query);
      setResults(response.data);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, search };
}
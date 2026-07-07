// hooks/useFetch.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { AxiosError } from 'axios';

interface UseFetchOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: AxiosError) => void;
}

export function useFetch<T>(
  fetchFn: () => Promise<T>,
  deps: React.DependencyList = [],
  options?: UseFetchOptions<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AxiosError | null>(null);

  // Keep the latest fetchFn/options in refs so `fetchData` has a stable
  // identity — callers put it in effect deps (e.g. socket setup) and an
  // unstable identity would re-run those effects on every render.
  const fetchFnRef = useRef(fetchFn);
  const optionsRef = useRef(options);
  useEffect(() => {
    fetchFnRef.current = fetchFn;
    optionsRef.current = options;
  });

  // Guards every path (initial load and refetch) against state updates
  // after the component unmounts
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFnRef.current();
      if (!mountedRef.current) return;
      setData(result);
      optionsRef.current?.onSuccess?.(result);
    } catch (err) {
      if (!mountedRef.current) return;
      const axiosError = err as AxiosError;
      setError(axiosError);
      optionsRef.current?.onError?.(axiosError);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: fetchData };
}

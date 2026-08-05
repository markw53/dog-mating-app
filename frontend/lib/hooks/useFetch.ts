// hooks/useFetch.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { AxiosError } from 'axios';

interface UseFetchOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: AxiosError) => void;
  // Opt-in stale-while-revalidate: when set, the last response for this key
  // is shown instantly on revisit (no spinner) while a fresh fetch runs in
  // the background. Key must uniquely identify the request (include filters).
  cacheKey?: string;
}

// Module-level, per-tab response cache for stale-while-revalidate. Never
// persisted — it exists to make back-navigation instant, not to serve
// offline data.
const responseCache = new Map<string, unknown>();

// Called on logout so one user's cached responses can never flash for the
// next user on a shared machine
export function clearFetchCache(): void {
  responseCache.clear();
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
    const cacheKey = optionsRef.current?.cacheKey;
    const cached = cacheKey ? responseCache.get(cacheKey) : undefined;

    try {
      if (cached !== undefined) {
        // Serve stale immediately, revalidate silently in the background
        setData(cached as T);
        setLoading(false);
      } else {
        setLoading(true);
      }
      setError(null);

      const result = await fetchFnRef.current();
      if (cacheKey) responseCache.set(cacheKey, result);
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

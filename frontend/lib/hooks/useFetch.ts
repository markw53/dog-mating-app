// hooks/useFetch.ts
import { useState, useEffect, useCallback } from 'react';
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
      options?.onSuccess?.(result);
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError);
      options?.onError?.(axiosError);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, options]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFn();
        
        if (isMounted) {
          setData(result);
          options?.onSuccess?.(result);
        }
      } catch (err) {
        if (isMounted) {
          const axiosError = err as AxiosError;
          setError(axiosError);
          options?.onError?.(axiosError);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}
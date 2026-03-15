import { useState, useEffect, useCallback, useRef } from 'react';
import type { ApiError } from '../api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
}

/**
 * useApi — Hook générique pour les appels API
 * @param fetcher  Fonction retournant une promesse
 * @param deps     Dépendances pour re-fetch automatique
 * @param immediate Si false, ne fetch pas au montage
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  immediate = true
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<ApiError | null>(null);
  const mountedRef = useRef(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (mountedRef.current) setData(result);
    } catch (err) {
      if (mountedRef.current) setError(err as ApiError);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    if (immediate) fetch();
    return () => { mountedRef.current = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * useMutation — Hook pour les mutations (POST, PUT, DELETE)
 */
export function useMutation<TData, TPayload = unknown>(
  mutationFn: (payload: TPayload) => Promise<TData>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(async (payload: TPayload): Promise<TData | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await mutationFn(payload);
      return result;
    } catch (err) {
      setError(err as ApiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [mutationFn]);

  return { mutate, loading, error };
}

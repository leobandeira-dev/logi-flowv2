import { useState, useEffect, useCallback } from 'react';
import { cache, STORES } from './localCache';

/**
 * Hook para gerenciar cache local de dados
 * Otimizado para módulo armazém
 */
export function useCache(store, key, fetchFn, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { ttl, enabled = true, refetchOnMount = false } = options;

  const fetchData = useCallback(async (forceRefetch = false) => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      // Tentar cache primeiro
      if (!forceRefetch) {
        const cached = await cache.get(store, key);
        if (cached) {
          setData(cached);
          setLoading(false);
          return cached;
        }
      }

      // Buscar dados
      const result = await fetchFn();
      
      // Salvar no cache
      await cache.set(store, key, result, ttl);
      
      setData(result);
      setLoading(false);
      return result;
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError(err);
      setLoading(false);
      
      // Tentar retornar cache em caso de erro
      const cached = await cache.get(store, key);
      if (cached) {
        setData(cached);
        return cached;
      }
    }
  }, [store, key, fetchFn, ttl, enabled]);

  useEffect(() => {
    fetchData(refetchOnMount);
  }, [fetchData, refetchOnMount]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const clearCache = useCallback(async () => {
    await cache.clear(store);
    await fetchData(true);
  }, [store, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    clearCache
  };
}

/**
 * Hook para pré-carregar dados críticos do armazém
 */
export function usePrefetchArmazem() {
  useEffect(() => {
    const prefetch = async () => {
      try {
        // Limpar expirados
        await cache.clearExpired();
        
        console.log('✅ Cache do armazém otimizado');
      } catch (error) {
        console.error('Erro ao pré-carregar cache:', error);
      }
    };

    prefetch();
  }, []);
}
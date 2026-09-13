import { useState, useEffect } from 'react';
import { useDebouncedValue } from './useDebouncedValue.js';
import { searchEntities } from '../api/search.js';

const EMPTY_RESULTS = Object.freeze({ boards: [], tasks: [] });

export function useGlobalSearch(query, debounceMs = 200) {
  const debouncedQuery = useDebouncedValue(query, debounceMs);
  const [results, setResults] = useState(EMPTY_RESULTS);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q) return;

    const controller = new AbortController();
    queueMicrotask(() => setIsSearching(true));
    setError(null);

    searchEntities(q, controller.signal)
      .then((data) => {
        setResults(data || EMPTY_RESULTS);
        setIsSearching(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Search failed');
          setIsSearching(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [debouncedQuery]);

  const hasQuery = Boolean(query.trim());

  return {
    results: hasQuery ? results : EMPTY_RESULTS,
    isSearching: hasQuery ? isSearching : false,
    error,
    debouncedQuery,
  };
}

import { useState, useEffect, useRef } from 'react';

export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  // useRef: timer ID persists across renders without triggering re-renders
  const timerRef = useRef(null);

  useEffect(() => {
    // Clear any existing timer before starting a new one
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebounced(value), delay);
    // Cleanup: cancel pending timer if value or delay changes, or component unmounts
    return () => clearTimeout(timerRef.current);
  }, [value, delay]);

  return debounced;
}

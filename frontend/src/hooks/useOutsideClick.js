import { useEffect, useRef } from 'react';

export function useOutsideClick(ref, callback, enabled = true) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (!enabled) return;

    function handleMouseDown(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        callbackRef.current?.(e);
      }
    }

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [ref, enabled]);
}

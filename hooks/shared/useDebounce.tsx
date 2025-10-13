import { useState, useEffect } from "react";

/**
 * useDebounce
 * @param value - the value to debounce
 * @param delay - debounce delay in milliseconds (default 300ms)
 * @returns debouncedValue - the value updated only after the delay
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // set a timeout to update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // cleanup if value changes before delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

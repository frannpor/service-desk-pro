import { useEffect, useRef, useState, useCallback } from "react";

/**
 * useDebouncedValue
 * Devuelve el valor debounced (ideal para inputs).
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debounced;
}

/**
 * useDebouncedCallback
 * Devuelve una versión debounced de la función (ideal para handlers).
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);

  // keep latest fn
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  return useCallback((...args: Parameters<T>) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      fnRef.current(...args);
    }, delay);
  }, [delay]);
}

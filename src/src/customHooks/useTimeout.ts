import { useCallback, useEffect, useRef } from "react";

export type useTimeoutType = (
  callback: () => void,
  delay: number
) => { reset: () => void; clear: () => void };

/**
 * Custom hook `useTimeout` Handle setting / resetting and clearing timeouts for you
 * @param callback
 * @param delay
 * @returns `reset`, `clear` functions
 */
export const useTimeout: useTimeoutType = (callback, delay) => {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // If Callback changes, re-assign to current Ref
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const set = useCallback(() => {
    timeoutRef.current = setTimeout(() => callbackRef.current(), delay);
  }, [delay]);

  const clear = useCallback(() => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    set();
    return () => {
      clear();
    };
  }, [delay, set, clear]);

  const reset = useCallback(() => {
    clear();
    set();
  }, [clear, set]);

  return { reset, clear };
};

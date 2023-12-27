import { useEffect } from "react";
import { useTimeout } from "./useTimeout";

export type useDebounceType = (
  callback: () => void,
  delay: number,
  dependencies: any[]
) => void;

/**
 *  Custom hook `useDebounce` runs a function with delay, useful for search
 *  queries that pull from API on key typing
 * @param callback () => void
 * @param delay number
 * @param dependencies - list of dependencies
 */
export const useDebounce: useDebounceType = (callback, delay, dependencies) => {
  const { clear, reset } = useTimeout(callback, delay);
  useEffect(reset, [...dependencies, reset]);
  useEffect(clear, [clear]);
};

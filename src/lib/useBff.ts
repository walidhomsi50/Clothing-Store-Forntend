"use client";

import { useCallback, useEffect, useState } from "react";
import { bff } from "./bff";

type State<T> = { data: T | null; error: string | null; status: number; loading: boolean };

/**
 * Loads data from the API through the proxy when the component appears.
 * Pass null as the path to skip loading. Call reload() after a change to fetch fresh data.
 */
export function useBff<T>(path: string | null) {
  const [state, setState] = useState<State<T>>({ data: null, error: null, status: 0, loading: path !== null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (path === null) return;

    let cancelled = false;

    void (async () => {
      const result = await bff<T>(path);

      if (cancelled) return;

      setState(
        result.ok
          ? { data: result.data, error: null, status: 200, loading: false }
          : { data: null, error: result.message, status: result.status, loading: false },
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [path, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  return { ...state, reload };
}

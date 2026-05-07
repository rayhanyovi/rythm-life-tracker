"use client";

import { type DependencyList, useEffect, useState } from "react";

type DataFetchState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ok"; data: T };

type UseDataFetchResult<T> = {
  data: T | null;
  errorMessage: string | null;
  isLoading: boolean;
  reload: () => void;
};

/**
 * Fetches JSON from `url` on mount (and whenever `deps` change).
 * Handles loading state, error state, and request cancellation.
 *
 * @param url   The URL to fetch from (always with cache: "no-store").
 * @param deps  Optional extra dependencies that trigger a refetch.
 */
export function useDataFetch<T>(
  url: string,
  deps: DependencyList = [],
): UseDataFetchResult<T> {
  const [state, setState] = useState<DataFetchState<T>>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setState({ status: "loading" });

    async function run() {
      try {
        const response = await fetch(url, { cache: "no-store" });

        if (cancelled) return;

        if (!response.ok) {
          let message = "Failed to load data.";

          try {
            const body = (await response.json()) as { error?: string };
            if (body.error) message = body.error;
          } catch {
            /* ignore */
          }

          setState({ status: "error", message });
          return;
        }

        const data = (await response.json()) as T;

        if (!cancelled) {
          setState({ status: "ok", data });
        }
      } catch {
        if (!cancelled) {
          setState({ status: "error", message: "Failed to load data." });
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, reloadKey, ...deps]);

  return {
    data: state.status === "ok" ? state.data : null,
    errorMessage: state.status === "error" ? state.message : null,
    isLoading: state.status === "loading",
    reload: () => setReloadKey((k) => k + 1),
  };
}

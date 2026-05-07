"use client";

import { type Dispatch, type SetStateAction, useEffect, useMemo } from "react";

/**
 * Keeps `selectedId` pointing at a valid item in `items`.
 * - If `selectedId` matches an item → returns that item.
 * - If `selectedId` is stale / null and `items` is non-empty → falls back to `items[0]`
 *   and syncs `setSelectedId` to reflect the fallback.
 *
 * Returns the currently selected item, or `null` if the list is empty.
 */
export function useAutoSelect<T extends { id: string }>(
  items: T[],
  selectedId: string | null,
  setSelectedId: Dispatch<SetStateAction<string | null>>,
): T | null {
  const selected = useMemo(() => {
    if (!items.length) return null;
    return items.find((item) => item.id === selectedId) ?? items[0];
  }, [items, selectedId]);

  useEffect(() => {
    if (!selected) {
      setSelectedId(null);
      return;
    }

    setSelectedId(selected.id);
  }, [selected, setSelectedId]);

  return selected ?? null;
}

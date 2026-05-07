"use client";

import { useMemo } from "react";

export type Group<T> = {
  id: string;
  name: string;
  items: T[];
};

/**
 * Groups a flat array of items into sections by a string key field.
 *
 * @param items        The flat array to group.
 * @param groupIdField The field on each item that holds the group ID.
 * @param groupNameFn  A function that derives the group display name from an item.
 *
 * Order of groups follows the first occurrence of each group ID in `items`.
 */
export function useGroupedItems<T>(
  items: T[],
  groupIdField: keyof T,
  groupNameFn: (item: T) => string,
): Group<T>[] {
  return useMemo(() => {
    const groups = new Map<string, Group<T>>();

    for (const item of items) {
      const id = String(item[groupIdField]);

      if (!groups.has(id)) {
        groups.set(id, { id, name: groupNameFn(item), items: [] });
      }

      groups.get(id)!.items.push(item);
    }

    return [...groups.values()];
  }, [items, groupIdField, groupNameFn]);
}

import { useMemo, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { ContentItem } from "@/lib/types";

/**
 * Feed content is server-fetched and paginated, so we can't persist a custom
 * order the way Favorites does (the underlying list changes on every filter
 * change or new page). Instead we keep a session-local display order:
 * existing items keep the position the user dragged them to, new items
 * (from search/filter changes or "load more") are appended at the end.
 *
 * The merge is computed synchronously during render (React's recommended
 * "adjusting state when props change" pattern) rather than in a useEffect,
 * so there's no extra render pass and no risk of a stale frame showing
 * unmerged data.
 */
export function useOrderedItems(items: ContentItem[]) {
  const incomingIds = useMemo(() => items.map((i) => i.id), [items]);

  const [order, setOrder] = useState<string[]>(incomingIds);
  const [trackedIds, setTrackedIds] = useState<string[]>(incomingIds);

  const idsChanged =
    incomingIds.length !== trackedIds.length || incomingIds.some((id, i) => id !== trackedIds[i]);

  if (idsChanged) {
    const incomingSet = new Set(incomingIds);
    const kept = order.filter((id) => incomingSet.has(id));
    const added = incomingIds.filter((id) => !order.includes(id));
    setOrder([...kept, ...added]);
    setTrackedIds(incomingIds);
  }

  const byId = useMemo(() => {
    const map: Record<string, ContentItem> = {};
    for (const item of items) map[item.id] = item;
    return map;
  }, [items]);

  const ordered = useMemo(() => order.map((id) => byId[id]).filter(Boolean), [order, byId]);

  function reorder(activeId: string, overId: string) {
    setOrder((prev) => {
      const oldIndex = prev.indexOf(activeId);
      const newIndex = prev.indexOf(overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  return { ordered, reorder };
}

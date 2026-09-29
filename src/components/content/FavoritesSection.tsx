"use client";

import { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { ContentItem } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { reorderFavorites } from "@/store/slices/favoritesSlice";
import ContentGrid from "./ContentGrid";
import ContentDetailDrawer from "./ContentDetailDrawer";
import { GridSkeleton } from "./StateViews";

export default function FavoritesSection() {
  const dispatch = useAppDispatch();
  const order = useAppSelector((s) => s.favorites.order);
  const items = useAppSelector((s) => s.favorites.items);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  const orderedItems = order.map((id) => items[id]).filter(Boolean);
  const hydrated = useAppSelector((s) => s.favorites.hydrated);

  function handleReorder(activeId: string, overId: string) {
    const oldIndex = order.indexOf(activeId);
    const newIndex = order.indexOf(overId);
    if (oldIndex === -1 || newIndex === -1) return;
    dispatch(reorderFavorites(arrayMove(order, oldIndex, newIndex)));
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Favorites</h1>
        <span className="text-xs text-neutral-400">{orderedItems.length} saved · drag to reorder</span>
      </div>
      {!hydrated ? <GridSkeleton count={4} /> : <ContentGrid
        items={orderedItems}
        isLoading={false}
        isError={false}
        hasMore={false}
        onLoadMore={() => {}}
        onReorder={handleReorder}
        onOpenDetails={setSelectedItem}
        emptyMessage="You haven't favorited anything yet."
      />}

      <ContentDetailDrawer
        item={selectedItem}
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
      />
    </section>
  );
}

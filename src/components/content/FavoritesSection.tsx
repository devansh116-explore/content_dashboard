"use client";

import { arrayMove } from "@dnd-kit/sortable";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { reorderFavorites } from "@/store/slices/favoritesSlice";
import ContentGrid from "./ContentGrid";

export default function FavoritesSection() {
  const dispatch = useAppDispatch();
  const order = useAppSelector((s) => s.favorites.order);
  const items = useAppSelector((s) => s.favorites.items);

  const orderedItems = order.map((id) => items[id]).filter(Boolean);

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
      <ContentGrid
        items={orderedItems}
        isLoading={false}
        isError={false}
        hasMore={false}
        onLoadMore={() => {}}
        onReorder={handleReorder}
        emptyMessage="You haven't favorited anything yet."
      />
    </section>
  );
}

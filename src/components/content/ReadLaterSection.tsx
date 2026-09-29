"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { ContentItem } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearReadLater } from "@/store/slices/readLaterSlice";
import ContentGrid from "./ContentGrid";
import ContentDetailDrawer from "./ContentDetailDrawer";
import { GridSkeleton } from "./StateViews";

export default function ReadLaterSection() {
  const dispatch = useAppDispatch();
  const order = useAppSelector((state) => state.readLater.order);
  const savedItems = useAppSelector((state) => state.readLater.items);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const items = order.map((id) => savedItems[id]).filter(Boolean);
  const hydrated = useAppSelector((state) => state.readLater.hydrated);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Read later</h1>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Saved items stay on this device.</p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => dispatch(clearReadLater())}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <Trash2 size={14} />
            Clear all
          </button>
        )}
      </div>
      {!hydrated ? <GridSkeleton count={4} /> : <ContentGrid
        items={items}
        isLoading={false}
        isError={false}
        hasMore={false}
        onLoadMore={() => {}}
        onOpenDetails={setSelectedItem}
        emptyMessage="Your reading queue is empty. Save an item with the clock button to come back to it."
      />}
      <ContentDetailDrawer
        item={selectedItem}
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
      />
    </section>
  );
}
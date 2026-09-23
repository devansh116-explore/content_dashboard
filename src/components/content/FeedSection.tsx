"use client";

import { useUnifiedFeed } from "@/hooks/useUnifiedFeed";
import { useOrderedItems } from "@/hooks/useOrderedItems";
import ContentGrid from "./ContentGrid";

export default function FeedSection() {
  const { items, isLoading, isError, hasMore, loadMore, retry } = useUnifiedFeed();
  const { ordered, reorder } = useOrderedItems(items);

  return (
    <section>
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Your Feed
        </h1>
        <span className="text-xs text-neutral-400">{items.length} items</span>
      </div>
      <p className="mb-4 text-xs text-neutral-400">Drag any card to reorder your feed.</p>
      <ContentGrid
        items={ordered}
        isLoading={isLoading}
        isError={isError}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onRetry={retry}
        onReorder={reorder}
        emptyMessage="No content matches your current preferences or search."
      />
    </section>
  );
}

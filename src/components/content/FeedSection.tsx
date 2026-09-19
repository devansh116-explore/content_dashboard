"use client";

import { useUnifiedFeed } from "@/hooks/useUnifiedFeed";
import ContentGrid from "./ContentGrid";

export default function FeedSection() {
  const { items, isLoading, isError, hasMore, loadMore, retry } = useUnifiedFeed();

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Your Feed
        </h1>
        <span className="text-xs text-neutral-400">{items.length} items</span>
      </div>
      <ContentGrid
        items={items}
        isLoading={isLoading}
        isError={isError}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onRetry={retry}
        emptyMessage="No content matches your current preferences or search."
      />
    </section>
  );
}

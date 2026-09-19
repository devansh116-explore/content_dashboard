"use client";

import { useMemo } from "react";
import { useUnifiedFeed } from "@/hooks/useUnifiedFeed";
import ContentGrid from "./ContentGrid";

export default function TrendingSection() {
  const { items, isLoading, isError, hasMore, loadMore, retry } = useUnifiedFeed({ trending: true });

  const sorted = useMemo(
    () => [...items].sort((a, b) => (b.metric?.value ?? 0) - (a.metric?.value ?? 0)),
    [items]
  );

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Trending
        </h1>
        <span className="text-xs text-neutral-400">{items.length} items</span>
      </div>
      <ContentGrid
        items={sorted}
        isLoading={isLoading}
        isError={isError}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onRetry={retry}
        emptyMessage="Nothing trending for your current preferences right now."
      />
    </section>
  );
}

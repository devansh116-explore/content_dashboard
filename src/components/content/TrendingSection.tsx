"use client";

import { useMemo, useState } from "react";
import { ContentItem } from "@/lib/types";
import { useUnifiedFeed } from "@/hooks/useUnifiedFeed";
import ContentGrid from "./ContentGrid";
import ContentDetailDrawer from "./ContentDetailDrawer";
import { PartialErrorNotice } from "./StateViews";

export default function TrendingSection() {
  const { items, isLoading, isError, hasMore, loadMore, retry, failedSources, rateLimitedSources, hasPartialError } = useUnifiedFeed({ trending: true });
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

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
      {hasPartialError && <PartialErrorNotice sources={failedSources} rateLimitedSources={rateLimitedSources} onRetry={retry} />}
      <ContentGrid
        items={sorted}
        isLoading={isLoading}
        isError={isError}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onRetry={retry}
        onOpenDetails={setSelectedItem}
        emptyMessage="Nothing trending for your current preferences right now."
      />

      <ContentDetailDrawer
        item={selectedItem}
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
      />
    </section>
  );
}

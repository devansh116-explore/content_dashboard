"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { ContentItem } from "@/lib/types";
import ContentCard from "./ContentCard";
import { EmptyState, ErrorState, GridSkeleton } from "./StateViews";

export default function ContentGrid({
  items,
  isLoading,
  isError,
  hasMore,
  onLoadMore,
  onRetry,
  emptyMessage,
}: {
  items: ContentItem[];
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onRetry?: () => void;
  emptyMessage?: string;
}) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || isLoading || isError) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isError, onLoadMore]);

  if (isError && items.length === 0) return <ErrorState onRetry={onRetry} />;
  if (!isLoading && items.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </AnimatePresence>
      </div>

      {isLoading && (
        <div className="mt-4">
          <GridSkeleton count={4} />
        </div>
      )}

      {isError && items.length > 0 && (
        <div className="mt-4">
          <ErrorState onRetry={onRetry} />
        </div>
      )}

      <div ref={sentinelRef} className="h-1 w-full" />
    </div>
  );
}

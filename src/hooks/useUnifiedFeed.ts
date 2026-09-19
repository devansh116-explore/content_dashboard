import { useMemo, useState } from "react";
import { useGetNewsQuery, useGetRecommendationsQuery, useGetSocialQuery } from "@/store/api/contentApi";
import { useAppSelector } from "@/store/hooks";
import { ContentItem } from "@/lib/types";

export function useUnifiedFeed({ trending = false }: { trending?: boolean } = {}) {
  const categories = useAppSelector((s) => s.preferences.categories);
  const search = useAppSelector((s) => s.ui.searchTerm);
  const [page, setPage] = useState(1);

  const args = { categories, page, search: search || undefined, trending };

  const news = useGetNewsQuery(args);
  const recommendations = useGetRecommendationsQuery(args);
  const social = useGetSocialQuery(args);

  const items = useMemo<ContentItem[]>(() => {
    const merged = [
      ...(news.data?.items ?? []),
      ...(recommendations.data?.items ?? []),
      ...(social.data?.items ?? []),
    ];
    // Interleave-ish ordering: newest first, stable across renders.
    return merged.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [news.data, recommendations.data, social.data]);

  const isInitialLoading =
    (news.isLoading || recommendations.isLoading || social.isLoading) && page === 1;
  const isFetchingMore =
    (news.isFetching || recommendations.isFetching || social.isFetching) && page > 1;
  const isError = news.isError && recommendations.isError && social.isError;
  const hasMore = Boolean(news.data?.nextPage || recommendations.data?.nextPage || social.data?.nextPage);

  function loadMore() {
    if (isFetchingMore) return;
    setPage((p) => p + 1);
  }

  function retry() {
    news.refetch();
    recommendations.refetch();
    social.refetch();
  }

  // Reset pagination whenever the filters meaningfully change so a new
  // search/category selection starts clean from page 1.
  const filterKey = JSON.stringify({ categories, search, trending });
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey);
    setPage(1);
  }

  return {
    items,
    isLoading: isInitialLoading,
    isFetchingMore,
    isError,
    hasMore,
    loadMore,
    retry,
  };
}

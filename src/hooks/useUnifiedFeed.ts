import { useEffect, useMemo, useState } from "react";
import { useGetNewsQuery, useGetRecommendationsQuery, useGetSocialQuery } from "@/store/api/contentApi";
import { useAppSelector } from "@/store/hooks";
import { ContentItem } from "@/lib/types";

export function useUnifiedFeed({ trending = false }: { trending?: boolean } = {}) {
  const categories = useAppSelector((s) => s.preferences.categories);
  const search = useAppSelector((s) => s.ui.searchTerm);
  const hydrated = useAppSelector((s) => s.preferences.hydrated);
  const [page, setPage] = useState(1);
  const filterKey = JSON.stringify({ categories, search, trending });
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  const effectivePage = filterKey === lastFilterKey ? page : 1;

  const args = { categories, page: effectivePage, search: search || undefined, trending };
  const queryOptions = { skip: !hydrated };

  const news = useGetNewsQuery(args, queryOptions);
  const recommendations = useGetRecommendationsQuery(args, queryOptions);
  const social = useGetSocialQuery(args, queryOptions);

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
    !hydrated ||
    ((news.isLoading || recommendations.isLoading || social.isLoading) && effectivePage === 1);
  const isFetchingMore =
    (news.isFetching || recommendations.isFetching || social.isFetching) && effectivePage > 1;
  const isError = news.isError && recommendations.isError && social.isError;
  const hasMore = Boolean(news.data?.nextPage || recommendations.data?.nextPage || social.data?.nextPage);

  function loadMore() {
    if (isFetchingMore || !hasMore) return;
    setPage((p) => p + 1);
  }

  function retry() {
    news.refetch();
    recommendations.refetch();
    social.refetch();
  }

  useEffect(() => {
    if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey);
    setPage(1);
    }
  }, [filterKey, lastFilterKey]);

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

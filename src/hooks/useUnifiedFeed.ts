import { useCallback, useMemo, useState } from "react";
import {
  useGetNewsQuery,
  useGetRecommendationsQuery,
  useGetSocialQuery,
} from "@/store/api/contentApi";
import { useAppSelector } from "@/store/hooks";
import { ContentItem } from "@/lib/types";

function sortItems(items: ContentItem[], sortMode: "newest" | "trending" | "relevance" | "forYou", search: string, affinity: Record<string, number>) {
  const next = [...items];
  const searchTerm = search.toLocaleLowerCase();

  switch (sortMode) {
    case "trending":
      return next.sort((a, b) => (b.metric?.value ?? 0) - (a.metric?.value ?? 0));
    case "relevance":
      return next.sort((a, b) => {
        const aText = `${a.title} ${a.description}`.toLocaleLowerCase();
        const bText = `${b.title} ${b.description}`.toLocaleLowerCase();
        const aScore = aText.includes(searchTerm) ? 1 : 0;
        const bScore = bText.includes(searchTerm) ? 1 : 0;
        if (bScore !== aScore) return bScore - aScore;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
    case "forYou":
      return next.sort((a, b) => {
        const score = (item: ContentItem) => {
          const daysOld = Math.max(0, (Date.now() - Date.parse(item.publishedAt)) / 86_400_000);
          return (affinity[item.category] ?? 0) * 3 + Math.max(0, 1 - daysOld / 14);
        };
        return score(b) - score(a);
      });
    case "newest":
    default:
      return next.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }
}

export function useUnifiedFeed({ trending = false }: { trending?: boolean } = {}) {
  const categories = useAppSelector((s) => s.preferences.categories);
  const search = useAppSelector((s) => s.ui.searchTerm);
  const sortMode = useAppSelector((s) => s.ui.sortMode);
  const sourceFilter = useAppSelector((s) => s.ui.sourceFilter);
  const favorites = useAppSelector((s) => s.favorites.items);
  const readLater = useAppSelector((s) => s.readLater.items);
  const hydrated = useAppSelector((s) => s.preferences.hydrated);
  const filterKey = JSON.stringify({ categories, search, trending, sourceFilter });
  const [pagination, setPagination] = useState({ filterKey, page: 1 });
  const effectivePage = pagination.filterKey === filterKey ? pagination.page : 1;

  const args = { categories, page: effectivePage, search: search || undefined, trending };
  const news = useGetNewsQuery(args, {
    skip: !hydrated || (sourceFilter !== "all" && sourceFilter !== "news"),
  });
  const recommendations = useGetRecommendationsQuery(args, {
    skip: !hydrated || (sourceFilter !== "all" && sourceFilter !== "recommendation"),
  });
  const social = useGetSocialQuery(args, {
    skip: !hydrated || (sourceFilter !== "all" && sourceFilter !== "social"),
  });
  const activeQueries = sourceFilter === "all"
    ? [news, recommendations, social]
    : [sourceFilter === "news" ? news : sourceFilter === "recommendation" ? recommendations : social];
  const sourceResults = sourceFilter === "all"
    ? [
        { label: "News", query: news },
        { label: "Recommendations", query: recommendations },
        { label: "Social", query: social },
      ]
    : [{
        label: sourceFilter === "news" ? "News" : sourceFilter === "recommendation" ? "Recommendations" : "Social",
        query: sourceFilter === "news" ? news : sourceFilter === "recommendation" ? recommendations : social,
      }];
  const failedSources = sourceResults.filter(({ query }) => query.isError).map(({ label }) => label);
  const rateLimitedSources = sourceResults.filter(({ query }) => {
    const error = query.error;
    return Boolean(error && typeof error === "object" && "status" in error && error.status === 429);
  }).map(({ label }) => label);

  const items = useMemo<ContentItem[]>(() => {
    let merged: ContentItem[] = [];

    merged = [
      ...(news.data?.items ?? []),
      ...(recommendations.data?.items ?? []),
      ...(social.data?.items ?? []),
    ];

    const affinity: Record<string, number> = {};
    for (const item of [...Object.values(favorites), ...Object.values(readLater)]) {
      affinity[item.category] = (affinity[item.category] ?? 0) + 1;
    }
    const sourceFiltered = sourceFilter === "all" ? merged : merged.filter((item) => item.source === sourceFilter);
    return sortItems(sourceFiltered, sortMode, search, affinity);
  }, [favorites, news.data, readLater, recommendations.data, search, social.data, sortMode, sourceFilter]);

  const isInitialLoading = !hydrated || (activeQueries.some((query) => query.isLoading) && effectivePage === 1);
  const isFetchingMore =
    activeQueries.some((query) => query.isFetching) &&
    effectivePage > 1;
  const isError = activeQueries.every((query) => query.isError);
  const hasMore = Boolean(
    activeQueries.some((query) => query.data?.nextPage)
  );

  const loadMore = useCallback(() => {
    if (isFetchingMore || !hasMore) return;
    setPagination({ filterKey, page: effectivePage + 1 });
  }, [effectivePage, filterKey, hasMore, isFetchingMore]);

  const retry = useCallback(() => {
    if (sourceFilter === "all" || sourceFilter === "news") news.refetch();
    if (sourceFilter === "all" || sourceFilter === "recommendation") recommendations.refetch();
    if (sourceFilter === "all" || sourceFilter === "social") social.refetch();
  }, [news, recommendations, social, sourceFilter]);

  return {
    items,
    isLoading: isInitialLoading,
    isFetchingMore,
    isError,
    hasMore,
    loadMore,
    retry,
    failedSources,
    rateLimitedSources,
    hasPartialError: failedSources.length > 0 && !isError,
  };
}

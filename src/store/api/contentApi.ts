import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Category, ContentItem, PagedResponse } from "@/lib/types";

interface FetchArgs {
  categories: Category[];
  page: number;
  search?: string;
  trending?: boolean;
}

function buildParams({ categories, page, search, trending }: FetchArgs): string {
  const params = new URLSearchParams({ page: String(page) });
  if (categories.length) params.set("categories", categories.join(","));
  if (search) params.set("search", search);
  if (trending) params.set("trending", "true");
  return params.toString();
}

export const contentApi = createApi({
  reducerPath: "contentApi",
  baseQuery: fetchBaseQuery({
    // An absolute base URL is required outside a real browser (Node's
    // fetch/Request implementation — used by Vitest's jsdom environment,
    // and by any server-side execution — has no browser "document base
    // URL" to resolve a relative path against, unlike an actual browser).
    // window.location.origin gives the correct absolute origin both in the
    // browser and in tests, so this is a portable fix rather than a
    // test-only shim.
    baseUrl: typeof window !== "undefined" ? `${window.location.origin}/api` : "http://localhost/api",
  }),
  tagTypes: ["News", "Recommendations", "Social"],
  endpoints: (builder) => ({
    getNews: builder.query<PagedResponse<ContentItem>, FetchArgs>({
      query: (args) => `/news?${buildParams(args)}`,
      serializeQueryArgs: ({ queryArgs, endpointName }) =>
        JSON.stringify({
          endpointName,
          categories: queryArgs.categories,
          search: queryArgs.search,
          trending: queryArgs.trending,
        }),
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) return newItems;
        currentCache.items.push(...newItems.items);
        currentCache.nextPage = newItems.nextPage;
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
    }),
    getRecommendations: builder.query<PagedResponse<ContentItem>, FetchArgs>({
      query: (args) => `/recommendations?${buildParams(args)}`,
      serializeQueryArgs: ({ queryArgs, endpointName }) =>
        JSON.stringify({
          endpointName,
          categories: queryArgs.categories,
          search: queryArgs.search,
          trending: queryArgs.trending,
        }),
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) return newItems;
        currentCache.items.push(...newItems.items);
        currentCache.nextPage = newItems.nextPage;
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
    }),
    getSocial: builder.query<PagedResponse<ContentItem>, FetchArgs>({
      query: (args) => `/social?${buildParams(args)}`,
      serializeQueryArgs: ({ queryArgs, endpointName }) =>
        JSON.stringify({
          endpointName,
          categories: queryArgs.categories,
          search: queryArgs.search,
          trending: queryArgs.trending,
        }),
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) return newItems;
        currentCache.items.push(...newItems.items);
        currentCache.nextPage = newItems.nextPage;
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
    }),
  }),
});

export const { useGetNewsQuery, useGetRecommendationsQuery, useGetSocialQuery } = contentApi;

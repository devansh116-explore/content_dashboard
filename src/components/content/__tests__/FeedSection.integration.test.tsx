import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { contentApi } from "@/store/api/contentApi";
import preferencesReducer, { PreferencesState } from "@/store/slices/preferencesSlice";
import favoritesReducer from "@/store/slices/favoritesSlice";
import readLaterReducer from "@/store/slices/readLaterSlice";
import uiReducer from "@/store/slices/uiSlice";
import { ContentItem, PagedResponse } from "@/lib/types";
import { ToastProvider } from "@/components/ui/ToastProvider";
import FeedSection from "../FeedSection";

// This suite exercises the real pipeline — RTK Query's fetchBaseQuery,
// the Redux store, useUnifiedFeed, and the rendered component tree — rather
// than a single unit in isolation. Only `fetch` is mocked, routed by which
// of the three API paths it was called with, so all three sources are
// genuinely exercised together the way they are in the browser.

function makeItem(overrides: Partial<ContentItem> & Pick<ContentItem, "id" | "source" | "title">): ContentItem {
  return {
    category: "technology",
    description: "A description.",
    imageUrl: "https://example.com/img.jpg",
    url: "https://example.com",
    author: "Author",
    publishedAt: new Date().toISOString(),
    ctaLabel: "Read More",
    ...overrides,
  };
}

function paged(items: ContentItem[]): PagedResponse<ContentItem> {
  return { items, nextPage: null, totalAvailable: items.length };
}

function mockFetchByPath(routes: Record<"news" | "recommendations" | "social", PagedResponse<ContentItem>>) {
  global.fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = input instanceof Request ? input.url : String(input);
    const key = (["news", "recommendations", "social"] as const).find((k) => url.includes(`/api/${k}`));
    const body = key ? routes[key] : paged([]);
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as unknown as typeof fetch;
}

function mockFetchAllFailing() {
  global.fetch = vi.fn(
    async () =>
      new Response(JSON.stringify({}), {
        status: 500,
        headers: { "content-type": "application/json" },
      })
  ) as unknown as typeof fetch;
}

function renderFeed(categories: PreferencesState["categories"] = ["technology"]) {
  const store = configureStore({
    reducer: {
      preferences: preferencesReducer,
      favorites: favoritesReducer,
      readLater: readLaterReducer,
      ui: uiReducer,
      [contentApi.reducerPath]: contentApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(contentApi.middleware),
    preloadedState: {
      preferences: { categories, darkMode: false, hydrated: true },
    },
  });
  render(
    <ToastProvider>
      <Provider store={store}>
        <FeedSection />
      </Provider>
    </ToastProvider>
  );
  return store;
}

describe("FeedSection integration (real Redux + RTK Query pipeline)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders items from all three sources once fetched", async () => {
    mockFetchByPath({
      news: paged([makeItem({ id: "n1", source: "news", title: "Breaking News Headline" })]),
      recommendations: paged([makeItem({ id: "r1", source: "recommendation", title: "Recommended Movie" })]),
      social: paged([makeItem({ id: "s1", source: "social", title: "#technology — Hot Take" })]),
    });

    renderFeed();

    await waitFor(() => expect(screen.getByText("Breaking News Headline")).toBeInTheDocument());
    expect(screen.getByText("Recommended Movie")).toBeInTheDocument();
    expect(screen.getByText("#technology — Hot Take")).toBeInTheDocument();
  });

  it("shows a loading skeleton before content resolves", async () => {
    // Never resolves within this test — we only need to observe the
    // pending state, not the eventual transition (that's covered by the
    // other tests, which each wait for their resolved state to appear).
    global.fetch = vi.fn(() => new Promise<Response>(() => {})) as unknown as typeof fetch;

    renderFeed();

    await waitFor(() => expect(document.querySelector(".animate-pulse")).toBeInTheDocument());
  });

  it("shows the empty state when every source returns no items", async () => {
    mockFetchByPath({
      news: paged([]),
      recommendations: paged([]),
      social: paged([]),
    });

    renderFeed();

    await waitFor(() =>
      expect(screen.getByText(/no content matches your current preferences/i)).toBeInTheDocument()
    );
  });

  it("shows the error state when every source fails", async () => {
    mockFetchAllFailing();

    renderFeed();

    await waitFor(() =>
      expect(screen.getByText(/something went wrong loading this content/i)).toBeInTheDocument()
    );
  });
});

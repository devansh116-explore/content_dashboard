import { describe, it, expect, beforeEach } from "vitest";
import reducer, { toggleFavorite, reorderFavorites, hydrateFavorites } from "../favoritesSlice";
import { ContentItem } from "@/lib/types";

function makeItem(id: string): ContentItem {
  return {
    id,
    source: "news",
    category: "technology",
    title: `Item ${id}`,
    description: "desc",
    imageUrl: "https://example.com/img.jpg",
    url: "https://example.com",
    author: "Author",
    publishedAt: new Date().toISOString(),
    ctaLabel: "Read More",
  };
}

describe("favoritesSlice", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts empty", () => {
    const state = reducer(undefined, { type: "@@INIT" });
    expect(state.order).toEqual([]);
    expect(Object.keys(state.items)).toHaveLength(0);
  });

  it("adds an item to favorites when toggled on", () => {
    const item = makeItem("a");
    const state = reducer(undefined, toggleFavorite(item));
    expect(state.items["a"]).toEqual(item);
    expect(state.order).toEqual(["a"]);
  });

  it("removes an item from favorites when toggled off", () => {
    const item = makeItem("a");
    const added = reducer(undefined, toggleFavorite(item));
    const removed = reducer(added, toggleFavorite(item));
    expect(removed.items["a"]).toBeUndefined();
    expect(removed.order).toEqual([]);
  });

  it("appends new favorites to the end of the order", () => {
    let state = reducer(undefined, toggleFavorite(makeItem("a")));
    state = reducer(state, toggleFavorite(makeItem("b")));
    state = reducer(state, toggleFavorite(makeItem("c")));
    expect(state.order).toEqual(["a", "b", "c"]);
  });

  it("reorders favorites via drag-and-drop", () => {
    let state = reducer(undefined, toggleFavorite(makeItem("a")));
    state = reducer(state, toggleFavorite(makeItem("b")));
    state = reducer(state, toggleFavorite(makeItem("c")));
    state = reducer(state, reorderFavorites(["c", "a", "b"]));
    expect(state.order).toEqual(["c", "a", "b"]);
  });

  it("persists to localStorage on toggle", () => {
    reducer(undefined, toggleFavorite(makeItem("a")));
    const raw = window.localStorage.getItem("content-dashboard:favorites");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string).order).toEqual(["a"]);
  });

  it("hydrates a previously saved favorites list", () => {
    const item = makeItem("a");
    window.localStorage.setItem(
      "content-dashboard:favorites",
      JSON.stringify({ items: { a: item }, order: ["a"] })
    );
    const state = reducer(undefined, hydrateFavorites());
    expect(state.order).toEqual(["a"]);
    expect(state.items.a).toEqual(item);
  });
});

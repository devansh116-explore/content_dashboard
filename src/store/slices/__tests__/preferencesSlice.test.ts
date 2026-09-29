import { describe, it, expect, beforeEach } from "vitest";
import reducer, { toggleCategory, setCategories, toggleDarkMode, hydrate } from "../preferencesSlice";

describe("preferencesSlice", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns the default state", () => {
    const state = reducer(undefined, { type: "@@INIT" });
    expect(state.categories).toContain("technology");
    expect(state.darkMode).toBe(false);
    expect(state.hydrated).toBe(false);
  });

  it("adds a category that is not yet selected", () => {
    const state = reducer(undefined, toggleCategory("science"));
    expect(state.categories).toContain("science");
  });

  it("removes a category that is already selected", () => {
    const initial = reducer(undefined, setCategories(["technology", "sports"]));
    const state = reducer(initial, toggleCategory("technology"));
    expect(state.categories).toEqual(["sports"]);
  });

  it("keeps the last selected category", () => {
    const initial = reducer(undefined, setCategories(["technology"]));
    const state = reducer(initial, toggleCategory("technology"));
    expect(state.categories).toEqual(["technology"]);
  });

  it("toggles dark mode", () => {
    const state = reducer(undefined, toggleDarkMode());
    expect(state.darkMode).toBe(true);
    const toggledBack = reducer(state, toggleDarkMode());
    expect(toggledBack.darkMode).toBe(false);
  });

  it("persists category changes to localStorage", () => {
    reducer(undefined, toggleCategory("health"));
    const raw = window.localStorage.getItem("content-dashboard:preferences");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string).categories).toContain("health");
  });

  it("hydrates from a previously persisted selection", () => {
    window.localStorage.setItem(
      "content-dashboard:preferences",
      JSON.stringify({ categories: ["finance"], darkMode: true })
    );
    const state = reducer(undefined, hydrate());
    expect(state.categories).toEqual(["finance"]);
    expect(state.darkMode).toBe(true);
    expect(state.hydrated).toBe(true);
  });

  it("hydrates to defaults when nothing was saved before", () => {
    const state = reducer(undefined, hydrate());
    expect(state.categories.length).toBeGreaterThan(0);
    expect(state.hydrated).toBe(true);
  });

  it("ignores malformed persisted preferences", () => {
    window.localStorage.setItem(
      "content-dashboard:preferences",
      JSON.stringify({ categories: ["invalid", "science"], darkMode: "yes" })
    );
    const state = reducer(undefined, hydrate());
    expect(state.categories).toEqual(["science"]);
    expect(state.darkMode).toBe(false);
  });
});

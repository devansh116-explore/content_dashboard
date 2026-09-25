import { describe, expect, it } from "vitest";
import { filterSearch, parseCategories, parsePage } from "@/lib/queryParams";

describe("query parameters", () => {
  it("normalizes invalid pages to the first page", () => {
    expect(parsePage(null)).toBe(1);
    expect(parsePage("abc")).toBe(1);
    expect(parsePage("0")).toBe(1);
    expect(parsePage("101")).toBe(1);
    expect(parsePage("2")).toBe(2);
  });

  it("keeps only supported categories", () => {
    expect(parseCategories("technology,invalid,science")).toEqual(["technology", "science"]);
  });

  it("filters fallback items using the same search term", () => {
    const items = [{ title: "Technology update" }, { title: "Sports update" }];
    expect(filterSearch(items, "technology")).toEqual([items[0]]);
  });
});

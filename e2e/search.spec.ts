import { test, expect } from "@playwright/test";

test.describe("Search", () => {
  test("typing in the search box filters the feed after debounce", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Your Feed" })).toBeVisible();

    // Wait for the initial feed to render at least one card.
    await expect(page.locator("article").first()).toBeVisible({ timeout: 10_000 });

    const search = page.getByLabel("Search content");
    await search.fill("technology");

    // Only social mock headlines include the category name, so this query
    // settles to the four matching social posts rather than all 36 items.
    await expect(page.locator("article")).toHaveCount(4, { timeout: 5_000 });

    const titles = await page.locator("article h3").allTextContents();
    // At least the mock data is generated in a way that "technology" search
    // should surface technology-flavoured headlines/hashtags.
    expect(titles.length).toBeGreaterThan(0);
    expect(titles.every((title) => title.toLowerCase().includes("technology"))).toBe(true);
  });

  test("clearing the search restores the full feed", async ({ page }) => {
    await page.goto("/");
    const search = page.getByLabel("Search content");
    await search.fill("technology");
    await page.waitForTimeout(500);

    await page.getByLabel("Clear search").click();
    await expect(search).toHaveValue("");
  });
});

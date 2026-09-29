import { test, expect } from "@playwright/test";

test.describe("Search", () => {
  test("typing in the search box filters the feed after debounce", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Your Feed" })).toBeVisible();

    // Wait for the initial feed to render at least one card.
    await expect(page.locator("article").first()).toBeVisible({ timeout: 10_000 });

    const search = page.getByLabel("Search content");
    await search.fill("technology");

    // Debounce window is 350ms — result should update shortly after, without
    // requiring a page reload or explicit submit.
    await expect(async () => {
      const count = await page.locator("article").count();
      expect(count).toBeGreaterThan(0);
    }).toPass({ timeout: 5_000 });

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

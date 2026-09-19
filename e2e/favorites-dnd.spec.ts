import { test, expect } from "@playwright/test";

test.describe("Favorites and drag-and-drop", () => {
  test("favoriting a card adds it to the Favorites section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("article").first()).toBeVisible({ timeout: 10_000 });

    const firstCard = page.locator("article").first();
    const title = await firstCard.locator("h3").textContent();
    await firstCard.getByLabel("Add to favorites").click();

    await page.getByRole("button", { name: /^favorites/i }).click();
    await expect(page.getByRole("heading", { name: "Favorites" })).toBeVisible();
    await expect(page.locator("article", { hasText: title ?? "" }).first()).toBeVisible();
  });

  test("reorders favorites via drag-and-drop", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("article").first()).toBeVisible({ timeout: 10_000 });

    // Favorite the first two visible cards.
    const cards = page.locator("article");
    await cards.nth(0).getByLabel("Add to favorites").click();
    await cards.nth(1).getByLabel("Add to favorites").click();

    await page.getByRole("button", { name: /^favorites/i }).click();
    await expect(page.getByRole("heading", { name: "Favorites" })).toBeVisible();

    const favoriteCards = page.locator("article");
    await expect(favoriteCards).toHaveCount(2);

    const firstTitleBefore = await favoriteCards.nth(0).locator("h3").textContent();
    const secondTitleBefore = await favoriteCards.nth(1).locator("h3").textContent();

    const firstHandle = page.getByLabel("Drag to reorder").nth(0);
    const secondHandle = page.getByLabel("Drag to reorder").nth(1);

    const firstBox = await firstHandle.boundingBox();
    const secondBox = await secondHandle.boundingBox();
    if (!firstBox || !secondBox) throw new Error("Could not locate drag handles");

    // Drag the first favorite past the second one.
    await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(secondBox.x + secondBox.width / 2, secondBox.y + secondBox.height / 2 + 40, {
      steps: 10,
    });
    await page.mouse.up();

    const favoriteCardsAfter = page.locator("article");
    const firstTitleAfter = await favoriteCardsAfter.nth(0).locator("h3").textContent();
    const secondTitleAfter = await favoriteCardsAfter.nth(1).locator("h3").textContent();

    // Order should have changed (the two titles swap positions).
    expect([firstTitleAfter, secondTitleAfter]).toContain(firstTitleBefore);
    expect([firstTitleAfter, secondTitleAfter]).toContain(secondTitleBefore);
  });
});

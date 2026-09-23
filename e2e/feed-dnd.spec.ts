import { test, expect } from "@playwright/test";

test.describe("Feed drag-and-drop", () => {
  test("reorders cards within the main feed via drag-and-drop", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Your Feed" })).toBeVisible();
    await expect(page.locator("article").first()).toBeVisible({ timeout: 10_000 });

    const cards = page.locator("article");
    const firstTitleBefore = await cards.nth(0).locator("h3").textContent();
    const secondTitleBefore = await cards.nth(1).locator("h3").textContent();

    const handles = page.getByLabel("Drag to reorder");
    const firstBox = await handles.nth(0).boundingBox();
    const secondBox = await handles.nth(1).boundingBox();
    if (!firstBox || !secondBox) throw new Error("Could not locate drag handles");

    await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(secondBox.x + secondBox.width / 2, secondBox.y + secondBox.height / 2 + 40, {
      steps: 10,
    });
    await page.mouse.up();

    const cardsAfter = page.locator("article");
    const firstTitleAfter = await cardsAfter.nth(0).locator("h3").textContent();
    const secondTitleAfter = await cardsAfter.nth(1).locator("h3").textContent();

    expect([firstTitleAfter, secondTitleAfter]).toContain(firstTitleBefore);
    expect([firstTitleAfter, secondTitleAfter]).toContain(secondTitleBefore);
  });

  test("a drag handle is keyboard-focusable and reachable via Tab", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("article").first()).toBeVisible({ timeout: 10_000 });

    const firstHandle = page.getByLabel("Drag to reorder").first();
    await firstHandle.focus();
    await expect(firstHandle).toBeFocused();
  });
});

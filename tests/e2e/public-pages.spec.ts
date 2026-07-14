import { expect, test } from "@playwright/test";

test("portfolio landing page explains the product", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Hear the room. Improve the next one." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Instructor login" })).toBeVisible();
});

test("closed or unknown sessions return a safe unavailable state", async ({ page }) => {
  await page.goto("/session/not-a-real-session");
  await expect(page.getByRole("heading", { name: "Session unavailable" })).toBeVisible();
});

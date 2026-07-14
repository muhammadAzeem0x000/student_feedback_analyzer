import { expect, test } from "@playwright/test";

const password = process.env.DEMO_INSTRUCTOR_PASSWORD;
test.skip(!password, "Demo instructor credentials are not configured.");

test("instructor can sign in and view the seeded feedback workspace", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Login as test instructor" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  await expect(page.getByText("Unit Testing and Test Automation")).toBeVisible();
});

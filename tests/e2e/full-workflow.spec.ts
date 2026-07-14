import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const password = process.env.DEMO_INSTRUCTOR_PASSWORD;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
test.skip(process.env.RUN_FULL_E2E !== "true" || !password || !serviceKey || !projectUrl, "Full workflow requires explicit isolated-development opt-in.");

test("complete instructor-to-student-to-analysis workflow", async ({ page }) => {
  test.setTimeout(180_000);
  const suffix = crypto.randomUUID().slice(0, 8).toUpperCase();
  const sessionTitle = `Feedback workflow ${suffix}`;
  const admin = createClient(projectUrl!, serviceKey!, { auth: { persistSession: false } });
  const { data: assignedCourse } = await admin.from("courses").select("id").eq("code", "SE-401").single();
  expect(assignedCourse).toBeTruthy();

  try {
    await page.goto("/login");
    await page.getByLabel("Email address").fill("instructor@example.com");
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in securely" }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/sessions/new");
    await page.getByLabel("Course", { exact: true }).selectOption(assignedCourse!.id);
    await page.getByLabel("Session title").fill(sessionTitle);
    await page.getByLabel("Expected responses").fill("1");
    await page.getByLabel("Minimum for AI analysis").fill("1");
    const createSession = page.waitForResponse(response => response.url().endsWith("/api/sessions") && response.request().method() === "POST");
    await page.getByRole("button", { name: "Create session" }).click();
    const createSessionResponse = await createSession;
    expect(createSessionResponse.status()).toBe(201);
    await expect(page).toHaveURL(/\/dashboard\/sessions\/[0-9a-f-]{36}$/);
    const workspaceUrl = page.url();
    await page.waitForLoadState("networkidle");

    const saveQuestions = page.waitForResponse(response => response.url().includes("/questions") && response.request().method() === "PUT");
    await page.getByRole("button", { name: "Save questions" }).click();
    expect((await saveQuestions).ok()).toBeTruthy();
    await page.getByLabel("Number of codes").fill("1");
    const generateCodes = page.waitForResponse(response => response.url().includes("/codes") && response.request().method() === "POST");
    await page.getByRole("button", { name: "Generate", exact: true }).click();
    expect((await generateCodes).ok()).toBeTruthy();
    const codePattern = /^[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/;
    const codeLocator = page.locator("span").filter({ hasText: codePattern });
    await expect(codeLocator).toHaveCount(1);
    const responseCode = (await codeLocator.textContent())!;
    const publicLink = await page.locator('a[target="_blank"][href^="/session/"]').getAttribute("href");
    expect(publicLink).toBeTruthy();
    const openSession = page.waitForResponse(response => response.url().includes("/status") && response.request().method() === "PATCH");
    await page.getByRole("button", { name: "Open session" }).click();
    expect((await openSession).ok()).toBeTruthy();

    async function fillFeedback() {
      await page.getByLabel("Enter the code shared by your instructor").fill(responseCode);
      const ratingFields = page.locator("fieldset").filter({ has: page.getByText("The learning objectives were clear.") });
      await ratingFields.getByText("5", { exact: true }).click();
      const paceFields = page.locator("fieldset").filter({ has: page.getByText("The pace of the session supported my learning.") });
      await paceFields.getByText("4", { exact: true }).click();
      await page.getByText("Live coding", { exact: true }).click();
      const clearest = page.locator("fieldset").filter({ has: page.getByText("What was the clearest part of the session?") });
      await clearest.getByRole("textbox").fill("The worked example made the testing cycle clear.");
      const improve = page.locator("fieldset").filter({ has: page.getByText("What is one change that would improve the next session?") });
      await improve.getByRole("textbox").fill("Reserve more time for independent practice.");
    }

    await page.goto(publicLink!);
    await fillFeedback();
    const firstSubmission = page.waitForResponse(response => response.url().includes("/submit") && response.request().method() === "POST");
    await page.getByRole("button", { name: "Submit anonymous feedback" }).click();
    expect((await firstSubmission).ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: "Feedback received" })).toBeVisible();

    await page.goto(publicLink!);
    await fillFeedback();
    const reusedSubmission = page.waitForResponse(response => response.url().includes("/submit") && response.request().method() === "POST");
    await page.getByRole("button", { name: "Submit anonymous feedback" }).click();
    expect((await reusedSubmission).status()).toBe(409);
    await expect(page.getByText("The response code is invalid or has already been used.")).toBeVisible();

    await page.goto(workspaceUrl);
    await expect(page.getByText("The worked example made the testing cycle clear.")).toBeVisible();
    page.once("dialog", dialog => dialog.accept());
    const closeSession = page.waitForResponse(response => response.url().includes("/status") && response.request().method() === "PATCH");
    await page.getByRole("button", { name: "Close session" }).click();
    expect((await closeSession).ok()).toBeTruthy();
    await page.reload();
    await page.getByLabel("What worked well?").fill("The realistic worked example clearly connected the concepts to practice.");
    await page.getByLabel("What felt challenging?").fill("The activity timing left less independent practice than planned.");
    await page.getByLabel("What surprised you?").fill("Students wanted more time even though the live example felt well paced.");
    await page.getByLabel("What will you try next?").fill("I will time-box the example and reserve fifteen minutes for practice.");
    const saveReflection = page.waitForResponse(response => response.url().includes("/reflection") && response.request().method() === "PUT");
    await page.getByRole("button", { name: "Save reflection" }).click();
    expect((await saveReflection).ok()).toBeTruthy();
    await page.reload();
    const analyze = page.waitForResponse(response => response.url().includes("/analyze") && response.request().method() === "POST");
    await page.getByRole("button", { name: "Generate five insights" }).click();
    expect((await analyze).ok()).toBeTruthy();
    await page.reload();
    await expect(page.getByText("Clarify key transitions")).toBeVisible();
  } finally {
    await admin.from("feedback_sessions").delete().eq("title", sessionTitle);
  }
});



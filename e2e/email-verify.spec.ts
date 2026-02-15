/**
 * E2E tests for Gmail App Password verification on Step 3.
 *
 * Uses real SMTP credentials from root .env to test the verify flow.
 * Requires GMAIL_USER and GMAIL_APP_PASSWORD in the environment.
 */
import { expect, test } from "@playwright/test";
import { config } from "dotenv";
import { resolve } from "path";

// Load root .env (not web/.env) for Gmail credentials
config({ path: resolve(__dirname, "../.env") });

const GMAIL_USER = process.env.GMAIL_USER ?? "";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD ?? "";

test.describe("Step 3: Email Verification", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Skip AI -> Step 2
    await page.getByRole("button", { name: /continue without ai/i }).click();
    // Go to Step 3
    await page.getByRole("button", { name: /set up daily automation/i }).click();
    await expect(page.locator("h1")).toContainText("Automation");
  });

  test("shows App Password warning callout", async ({ page }) => {
    await expect(
      page.locator("text=This is not your Gmail password"),
    ).toBeVisible();
    await expect(
      page.locator('a[href*="myaccount.google.com/apppasswords"]'),
    ).toBeVisible();
  });

  test("verify button is disabled until all fields are filled", async ({ page }) => {
    const verifyBtn = page.getByRole("button", { name: /verify credentials/i });
    await expect(verifyBtn).toBeDisabled();

    // Fill only Gmail address
    await page.locator('input[type="email"]').fill("test@gmail.com");
    await expect(verifyBtn).toBeDisabled();

    // Fill app password too
    await page.locator('input[type="password"]').fill("abcdefghijklmnop");
    await expect(verifyBtn).toBeDisabled();

    // Fill recipients - now all fields ready
    await page.locator('input[placeholder*="team@company"]').fill("test@example.com");
    await expect(verifyBtn).toBeEnabled();
  });

  test("deploy button is disabled before email verification", async ({ page }) => {
    const deployBtn = page.getByRole("button", { name: /deploy automation/i });
    await expect(deployBtn).toBeDisabled();

    // Fill all email fields
    await page.locator('input[type="email"]').fill("test@gmail.com");
    await page.locator('input[type="password"]').fill("abcdefghijklmnop");
    await page.locator('input[placeholder*="team@company"]').fill("test@example.com");

    // Deploy still disabled (not verified + no GitHub token)
    await expect(deployBtn).toBeDisabled();
  });

  test("wrong password shows error", async ({ page }) => {
    test.skip(!GMAIL_USER, "GMAIL_USER not set in .env");

    await page.locator('input[type="email"]').fill(GMAIL_USER);
    await page.locator('input[type="password"]').fill("wrongpassword1234");
    await page.locator('input[placeholder*="team@company"]').fill("test@example.com");

    await page.getByRole("button", { name: /verify credentials/i }).click();

    // Wait for the error (SMTP auth takes a few seconds)
    await expect(page.locator("text=Authentication failed")).toBeVisible({
      timeout: 15000,
    });

    // Password field should have red border
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toHaveClass(/border-red/);
  });

  test("correct App Password verifies successfully", async ({ page }) => {
    test.skip(!GMAIL_USER || !GMAIL_APP_PASSWORD, "Gmail credentials not set in .env");

    await page.locator('input[type="email"]').fill(GMAIL_USER);
    await page.locator('input[type="password"]').fill(GMAIL_APP_PASSWORD);
    await page.locator('input[placeholder*="team@company"]').fill("test@example.com");

    await page.getByRole("button", { name: /verify credentials/i }).click();

    // Wait for verification (SMTP handshake)
    await expect(
      page.getByRole("button", { name: /verified/i }),
    ).toBeVisible({ timeout: 15000 });

    // Password field should have green border
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toHaveClass(/border-emerald/);
  });

  test("changing email field resets verification", async ({ page }) => {
    test.skip(!GMAIL_USER || !GMAIL_APP_PASSWORD, "Gmail credentials not set in .env");

    // Verify first
    await page.locator('input[type="email"]').fill(GMAIL_USER);
    await page.locator('input[type="password"]').fill(GMAIL_APP_PASSWORD);
    await page.locator('input[placeholder*="team@company"]').fill("test@example.com");

    await page.getByRole("button", { name: /verify credentials/i }).click();
    await expect(
      page.getByRole("button", { name: /verified/i }),
    ).toBeVisible({ timeout: 15000 });

    // Change the Gmail address
    await page.locator('input[type="email"]').fill("other@gmail.com");

    // Should reset to "Verify Credentials"
    await expect(
      page.getByRole("button", { name: /verify credentials/i }),
    ).toBeVisible();
  });
});

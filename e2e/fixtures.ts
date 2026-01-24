import { test as base, expect, Page } from "@playwright/test";

// Test credentials
export const SUPERADMIN = {
  email: "superadmin@test.com",
  password: "superadmin123",
};

export const EXECUTIVE = {
  email: "vikash.yadav@suprans.in",
  password: "Suprans123",
};

// Helper function to login
export async function login(page: Page, email: string, password: string) {
  await page.goto("/sign-in");
  await page.waitForLoadState("networkidle");

  // Fill login form
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);

  // Click sign in
  await page.getByRole("button", { name: /sign in/i }).click();

  // Wait for navigation away from sign-in
  await page.waitForURL((url) => !url.pathname.includes("sign-in"), {
    timeout: 15000,
  });
}

// Extended test with login helpers
export const test = base.extend<{
  superadminPage: Page;
  executivePage: Page;
}>({
  superadminPage: async ({ page }, use) => {
    await login(page, SUPERADMIN.email, SUPERADMIN.password);
    await use(page);
  },
  executivePage: async ({ page }, use) => {
    await login(page, EXECUTIVE.email, EXECUTIVE.password);
    await use(page);
  },
});

export { expect };

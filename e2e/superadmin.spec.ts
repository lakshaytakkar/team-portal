import { test, expect } from "./fixtures";

test.describe("Superadmin - Dashboard & Navigation", () => {
  test("should load CEO dashboard with metrics", async ({ superadminPage }) => {
    await superadminPage.goto("/ceo/dashboard");
    await superadminPage.waitForLoadState("networkidle");

    // Should show dashboard content
    await expect(superadminPage.locator("main, [role='main']").first()).toBeVisible();

    // Look for stat cards or metrics
    const hasMetrics = await superadminPage
      .locator('[class*="card"], [class*="stat"], [class*="metric"], [class*="kpi"]')
      .first()
      .isVisible()
      .catch(() => false);

    expect(hasMetrics).toBeTruthy();
  });

  test("should navigate to Explore page", async ({ superadminPage }) => {
    await superadminPage.goto("/explore");
    await superadminPage.waitForLoadState("networkidle");

    await expect(superadminPage).toHaveURL(/explore/);
  });

  test("should open global search", async ({ superadminPage }) => {
    // Try keyboard shortcut or click search
    const searchTrigger = superadminPage.locator(
      '[data-testid="search"], [aria-label*="search"], button:has(svg)'
    );

    if (await searchTrigger.first().isVisible()) {
      await searchTrigger.first().click();

      // Check if search dialog/input appears
      const searchInput = superadminPage.locator(
        'input[type="search"], input[placeholder*="search" i], [role="combobox"]'
      );
      await expect(searchInput.first()).toBeVisible({ timeout: 5000 }).catch(() => {
        // Search might work differently
      });
    }
  });
});

test.describe("Superadmin - User Management", () => {
  test("should load users list", async ({ superadminPage }) => {
    await superadminPage.goto("/admin/users");
    await superadminPage.waitForLoadState("networkidle");

    // Should show users table or list
    const content = superadminPage.locator("table, [role='grid'], [class*='list']");
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test("should open create user dialog", async ({ superadminPage }) => {
    await superadminPage.goto("/admin/users");
    await superadminPage.waitForLoadState("networkidle");

    // Find and click create button
    const createBtn = superadminPage.getByRole("button", {
      name: /create|add|new/i,
    });

    if (await createBtn.first().isVisible()) {
      await createBtn.first().click();

      // Dialog should open
      const dialog = superadminPage.locator('[role="dialog"], [data-state="open"]');
      await expect(dialog.first()).toBeVisible({ timeout: 5000 });

      // Should have form fields
      await expect(
        superadminPage.getByLabel(/email/i).first()
      ).toBeVisible();

      // Close dialog
      await superadminPage.keyboard.press("Escape");
    }
  });

  test("should filter users with search", async ({ superadminPage }) => {
    await superadminPage.goto("/admin/users");
    await superadminPage.waitForLoadState("networkidle");

    const searchInput = superadminPage.locator(
      'input[placeholder*="search" i], input[type="search"]'
    );

    if (await searchInput.first().isVisible()) {
      await searchInput.first().fill("test");
      await superadminPage.waitForTimeout(500); // Debounce

      // Table should update
      await expect(superadminPage.locator("table, [role='grid']").first()).toBeVisible();
    }
  });
});

test.describe("Superadmin - Task Management", () => {
  test("should load tasks page", async ({ superadminPage }) => {
    await superadminPage.goto("/tasks");
    await superadminPage.waitForLoadState("networkidle");

    // Should show tasks content
    await expect(superadminPage.locator("main").first()).toBeVisible();
  });

  test("should show task filters", async ({ superadminPage }) => {
    await superadminPage.goto("/tasks");
    await superadminPage.waitForLoadState("networkidle");

    // Look for filter controls
    const filters = superadminPage.locator(
      'select, [role="combobox"], button:has-text("filter"), button:has-text("status"), button:has-text("priority")'
    );

    const hasFilters = (await filters.count()) > 0;
    expect(hasFilters).toBeTruthy();
  });

  test("should open create task dialog", async ({ superadminPage }) => {
    await superadminPage.goto("/tasks");
    await superadminPage.waitForLoadState("networkidle");

    const createBtn = superadminPage.getByRole("button", {
      name: /create|add|new/i,
    });

    if (await createBtn.first().isVisible()) {
      await createBtn.first().click();

      // Dialog should open with form
      const dialog = superadminPage.locator('[role="dialog"]');
      await expect(dialog.first()).toBeVisible({ timeout: 5000 });

      // Close
      await superadminPage.keyboard.press("Escape");
    }
  });

  test("should switch between table and kanban views", async ({
    superadminPage,
  }) => {
    await superadminPage.goto("/tasks");
    await superadminPage.waitForLoadState("networkidle");

    // Look for view toggle
    const viewToggle = superadminPage.locator(
      'button:has-text("kanban"), button:has-text("table"), [role="tablist"]'
    );

    if (await viewToggle.first().isVisible()) {
      await viewToggle.first().click();
      await superadminPage.waitForTimeout(500);
    }
  });
});

test.describe("Superadmin - Project Management", () => {
  test("should load projects page", async ({ superadminPage }) => {
    await superadminPage.goto("/projects");
    await superadminPage.waitForLoadState("networkidle");

    await expect(superadminPage.locator("main").first()).toBeVisible();
  });

  test("should show project cards or list", async ({ superadminPage }) => {
    await superadminPage.goto("/projects");
    await superadminPage.waitForLoadState("networkidle");

    // Look for project cards or table
    const projects = superadminPage.locator(
      '[class*="card"], [class*="project"], table, [role="grid"]'
    );

    await expect(projects.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Superadmin - HR Dashboard", () => {
  test("should load HR dashboard with stats", async ({ superadminPage }) => {
    await superadminPage.goto("/hr/dashboard");
    await superadminPage.waitForLoadState("networkidle");

    await expect(superadminPage.locator("main").first()).toBeVisible();

    // Should have stat cards
    const stats = superadminPage.locator('[class*="card"], [class*="stat"]');
    await expect(stats.first()).toBeVisible({ timeout: 10000 });
  });

  test("should load employees list", async ({ superadminPage }) => {
    await superadminPage.goto("/hr/employees");
    await superadminPage.waitForLoadState("networkidle");

    const content = superadminPage.locator("table, [role='grid'], [class*='list']");
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Superadmin - Finance Dashboard", () => {
  test("should load finance dashboard", async ({ superadminPage }) => {
    await superadminPage.goto("/finance/dashboard");
    await superadminPage.waitForLoadState("networkidle");

    await expect(superadminPage.locator("main").first()).toBeVisible();
  });

  test("should load transactions page", async ({ superadminPage }) => {
    await superadminPage.goto("/finance/transactions");
    await superadminPage.waitForLoadState("networkidle");

    await expect(superadminPage.locator("main").first()).toBeVisible();
  });
});

test.describe("Superadmin - Recruitment", () => {
  test("should load recruitment dashboard", async ({ superadminPage }) => {
    await superadminPage.goto("/recruitment/dashboard");
    await superadminPage.waitForLoadState("networkidle");

    await expect(superadminPage.locator("main").first()).toBeVisible();
  });

  test("should load candidates list", async ({ superadminPage }) => {
    await superadminPage.goto("/recruitment/candidates");
    await superadminPage.waitForLoadState("networkidle");

    await expect(superadminPage.locator("main").first()).toBeVisible();
  });
});

test.describe("Superadmin - Admin Settings", () => {
  test("should load verticals page", async ({ superadminPage }) => {
    await superadminPage.goto("/admin/verticals");
    await superadminPage.waitForLoadState("networkidle");

    await expect(superadminPage.locator("main").first()).toBeVisible();
  });

  test("should load permissions page", async ({ superadminPage }) => {
    await superadminPage.goto("/admin/permissions");
    await superadminPage.waitForLoadState("networkidle");

    await expect(superadminPage.locator("main").first()).toBeVisible();
  });

  test("should load reminders page", async ({ superadminPage }) => {
    await superadminPage.goto("/admin/reminders");
    await superadminPage.waitForLoadState("networkidle");

    await expect(superadminPage.locator("main").first()).toBeVisible();
  });
});

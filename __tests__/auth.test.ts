import { shortest } from "@antiwork/shortest";

// =============================================================================
// AUTHENTICATION TESTS
// =============================================================================

describe("Authentication", () => {
  // ---------------------------------------------------------------------------
  // Superadmin Login
  // ---------------------------------------------------------------------------
  shortest(
    "Navigate to sign-in page, enter superadmin@test.com as email and superadmin123 as password, click sign in button, and verify redirect to dashboard or explore page",
    {
      email: "superadmin@test.com",
      password: "superadmin123",
    }
  );

  shortest(
    "After logging in as superadmin, verify the sidebar shows admin menu items including Users, Organizations, Verticals, Permissions, and Settings"
  );

  shortest(
    "Click on the user avatar or profile menu in the top right, verify superadmin name is displayed, then click sign out and verify redirect to sign-in page"
  );

  // ---------------------------------------------------------------------------
  // Executive Login
  // ---------------------------------------------------------------------------
  shortest(
    "Navigate to sign-in page, enter vikash.yadav@suprans.in as email and Suprans123 as password, click sign in button, and verify redirect to projects or my-tasks page",
    {
      email: "vikash.yadav@suprans.in",
      password: "Suprans123",
    }
  );

  shortest(
    "After logging in as executive, verify the sidebar shows My Workspace menu items but does NOT show Admin menu items like Users or Permissions"
  );

  // ---------------------------------------------------------------------------
  // Authentication Error Handling
  // ---------------------------------------------------------------------------
  shortest(
    "Navigate to sign-in page, enter invalid@test.com as email and wrongpassword as password, click sign in, and verify an error message is displayed"
  );

  shortest(
    "Navigate to sign-in page, leave email field empty, try to submit, and verify validation error is shown"
  );
});

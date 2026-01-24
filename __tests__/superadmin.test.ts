import { shortest } from "@antiwork/shortest";

// =============================================================================
// SUPERADMIN TEST SUITE
// Complete E2E tests for superadmin role functionality
// =============================================================================

describe("Superadmin - Dashboard & Navigation", () => {
  // Login before tests
  shortest(
    "Navigate to sign-in page, enter superadmin@test.com as email and superadmin123 as password, click sign in and wait for dashboard to load",
    {
      email: "superadmin@test.com",
      password: "superadmin123",
    }
  );

  // ---------------------------------------------------------------------------
  // CEO Dashboard
  // ---------------------------------------------------------------------------
  shortest(
    "Navigate to CEO Dashboard from sidebar, verify the page loads with Business Overview section showing metrics like Revenue, Tasks, Projects"
  );

  shortest(
    "On CEO Dashboard, verify Executive KPIs section displays key performance indicators with numerical values and trend indicators"
  );

  shortest(
    "On CEO Dashboard, verify there are chart widgets showing Revenue Trends or Growth metrics with date filter options"
  );

  // ---------------------------------------------------------------------------
  // Explore Page
  // ---------------------------------------------------------------------------
  shortest(
    "Navigate to Explore page from sidebar, verify it shows organization-wide resources and search functionality"
  );

  // ---------------------------------------------------------------------------
  // Global Search
  // ---------------------------------------------------------------------------
  shortest(
    "Click on the global search icon or press Cmd+K, type 'task' in the search box, verify search results appear showing relevant tasks or pages"
  );
});

describe("Superadmin - User Management", () => {
  shortest(
    "Navigate to sign-in page, enter superadmin@test.com and superadmin123, sign in",
    { email: "superadmin@test.com", password: "superadmin123" }
  );

  // ---------------------------------------------------------------------------
  // View Users
  // ---------------------------------------------------------------------------
  shortest(
    "Navigate to Admin > Users from sidebar, verify the users list table loads showing columns like Name, Email, Role, Status"
  );

  shortest(
    "On Users page, use the search box to filter users, verify the table updates to show matching results"
  );

  // ---------------------------------------------------------------------------
  // Create User (Read-only test - don't actually create to avoid data pollution)
  // ---------------------------------------------------------------------------
  shortest(
    "On Users page, click the Create User or Add User button, verify a dialog opens with form fields for Email, Password, Name, Role, and Department"
  );

  shortest(
    "In the Create User dialog, verify Role dropdown has options like Employee, Manager, Executive, and close the dialog without saving"
  );

  // ---------------------------------------------------------------------------
  // User Actions
  // ---------------------------------------------------------------------------
  shortest(
    "On Users page, click the actions menu (three dots) on any user row, verify options like Edit, View, or Delete are available"
  );
});

describe("Superadmin - Task Management", () => {
  shortest(
    "Navigate to sign-in page, enter superadmin@test.com and superadmin123, sign in",
    { email: "superadmin@test.com", password: "superadmin123" }
  );

  // ---------------------------------------------------------------------------
  // View Tasks
  // ---------------------------------------------------------------------------
  shortest(
    "Navigate to Tasks page from Operations section in sidebar, verify the tasks page loads with either a table or kanban view"
  );

  shortest(
    "On Tasks page, verify filter options are available for Status, Priority, Assignee, and Date range"
  );

  shortest(
    "On Tasks page, if there is a view toggle, switch between Table and Kanban views and verify both render correctly"
  );

  // ---------------------------------------------------------------------------
  // Create Task
  // ---------------------------------------------------------------------------
  shortest(
    "On Tasks page, click Create Task or Add Task button, verify a dialog opens with fields for Task Name, Description, Status, Priority, Project, Assignee, and Due Date"
  );

  shortest(
    "In Create Task dialog, fill in Task Name as 'Test Task from AI', set Priority to High, set Status to Not Started, then click Save or Create button"
  );

  shortest(
    "After creating the task, verify 'Test Task from AI' appears in the task list or a success notification is shown"
  );

  // ---------------------------------------------------------------------------
  // Edit Task
  // ---------------------------------------------------------------------------
  shortest(
    "Find the task 'Test Task from AI' in the list, click on it or click the edit action, verify the edit dialog opens with the task details pre-filled"
  );

  shortest(
    "In the edit dialog, change the Status to 'In Progress', click Save, and verify the task status is updated in the list"
  );

  // ---------------------------------------------------------------------------
  // Task Filtering
  // ---------------------------------------------------------------------------
  shortest(
    "On Tasks page, use the Priority filter to show only High priority tasks, verify the list updates to show only high priority items"
  );

  shortest(
    "On Tasks page, use the Status filter to show only 'In Progress' tasks, verify the filtered results are displayed"
  );

  // ---------------------------------------------------------------------------
  // Delete Task (cleanup)
  // ---------------------------------------------------------------------------
  shortest(
    "Find 'Test Task from AI' task, click the actions menu, select Delete, confirm the deletion, and verify the task is removed from the list"
  );
});

describe("Superadmin - Project Management", () => {
  shortest(
    "Navigate to sign-in page, enter superadmin@test.com and superadmin123, sign in",
    { email: "superadmin@test.com", password: "superadmin123" }
  );

  // ---------------------------------------------------------------------------
  // View Projects
  // ---------------------------------------------------------------------------
  shortest(
    "Navigate to Projects page from sidebar, verify the page loads showing project cards or a project list with names, status, and progress indicators"
  );

  // ---------------------------------------------------------------------------
  // Create Project
  // ---------------------------------------------------------------------------
  shortest(
    "On Projects page, click Create Project or New Project button, verify a dialog opens with fields for Project Name, Description, Start Date, End Date, and Team Members"
  );

  shortest(
    "In Create Project dialog, enter 'AI Test Project' as name, set status to Planning, then close the dialog without saving to avoid test data"
  );

  // ---------------------------------------------------------------------------
  // Project Details
  // ---------------------------------------------------------------------------
  shortest(
    "Click on any existing project card to view project details, verify the detail page shows project information, team members, and associated tasks"
  );
});

describe("Superadmin - HR Management", () => {
  shortest(
    "Navigate to sign-in page, enter superadmin@test.com and superadmin123, sign in",
    { email: "superadmin@test.com", password: "superadmin123" }
  );

  // ---------------------------------------------------------------------------
  // HR Dashboard
  // ---------------------------------------------------------------------------
  shortest(
    "Navigate to HR Dashboard from sidebar, verify it displays employee statistics like Total Employees, New Hires, and department breakdowns"
  );

  shortest(
    "On HR Dashboard, verify there are charts showing employee distribution, work hours, or other HR metrics"
  );

  // ---------------------------------------------------------------------------
  // Employees List
  // ---------------------------------------------------------------------------
  shortest(
    "Navigate to Employees page under HR section, verify the employee list loads with columns for Name, Email, Department, Role, and Status"
  );

  // ---------------------------------------------------------------------------
  // Leave Requests
  // ---------------------------------------------------------------------------
  shortest(
    "Navigate to Leave Requests page, verify pending leave requests are displayed with options to Approve or Reject"
  );
});

describe("Superadmin - Finance Dashboard", () => {
  shortest(
    "Navigate to sign-in page, enter superadmin@test.com and superadmin123, sign in",
    { email: "superadmin@test.com", password: "superadmin123" }
  );

  shortest(
    "Navigate to Finance Dashboard from sidebar, verify it shows financial metrics like Revenue, Expenses, and Profit margins"
  );

  shortest(
    "On Finance Dashboard, verify there are charts showing Revenue vs Expenses trends and expense category breakdowns"
  );

  shortest(
    "Navigate to Transactions page under Finance, verify transaction list loads with Date, Description, Amount, and Category columns"
  );
});

describe("Superadmin - Recruitment", () => {
  shortest(
    "Navigate to sign-in page, enter superadmin@test.com and superadmin123, sign in",
    { email: "superadmin@test.com", password: "superadmin123" }
  );

  shortest(
    "Navigate to Recruitment Dashboard, verify it shows recruitment metrics like Open Positions, Total Applications, and Interviews Scheduled"
  );

  shortest(
    "Navigate to Candidates page, verify the candidates list displays with Name, Applied Role, Status, and Application Date"
  );

  shortest(
    "Navigate to Job Roles page, verify the list of job roles with their details and status is displayed"
  );
});

describe("Superadmin - Admin Settings", () => {
  shortest(
    "Navigate to sign-in page, enter superadmin@test.com and superadmin123, sign in",
    { email: "superadmin@test.com", password: "superadmin123" }
  );

  shortest(
    "Navigate to Admin > Verticals, verify the verticals/business units list is displayed with options to create or edit"
  );

  shortest(
    "Navigate to Admin > Permissions, verify permission settings or role-based access configuration is accessible"
  );

  shortest(
    "Navigate to Admin > Organizations, verify organization management interface is displayed"
  );

  shortest(
    "Navigate to Admin > Reminders, verify the reminders management interface shows with options to create reminders for users"
  );
});

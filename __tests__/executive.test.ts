import { shortest } from "@antiwork/shortest";

// =============================================================================
// EXECUTIVE TEST SUITE
// Complete E2E tests for executive/employee role functionality
// =============================================================================

describe("Executive - Dashboard & Navigation", () => {
  // Login as executive
  shortest(
    "Navigate to sign-in page, enter vikash.yadav@suprans.in as email and Suprans123 as password, click sign in and wait for dashboard to load",
    {
      email: "vikash.yadav@suprans.in",
      password: "Suprans123",
    }
  );

  // ---------------------------------------------------------------------------
  // Personal Dashboard
  // ---------------------------------------------------------------------------
  shortest(
    "After login, verify the dashboard shows personal KPIs like My Tasks count, My Projects count, and upcoming items"
  );

  shortest(
    "On dashboard, verify Quick Links section is visible with shortcuts to common actions like My Tasks, My Calendar, My Documents"
  );

  shortest(
    "On dashboard, verify Recent Activity section shows recent updates related to the user's tasks and projects"
  );

  // ---------------------------------------------------------------------------
  // Sidebar Navigation - My Workspace
  // ---------------------------------------------------------------------------
  shortest(
    "Verify sidebar shows My Workspace section with items: My Tasks, My Projects, My Calendar, My Documents, My Goals"
  );

  shortest(
    "Verify sidebar does NOT show Admin section items like Users, Organizations, or Permissions"
  );
});

describe("Executive - My Tasks", () => {
  shortest(
    "Navigate to sign-in page, enter vikash.yadav@suprans.in and Suprans123, sign in",
    { email: "vikash.yadav@suprans.in", password: "Suprans123" }
  );

  // ---------------------------------------------------------------------------
  // View Tasks
  // ---------------------------------------------------------------------------
  shortest(
    "Navigate to My Tasks from sidebar, verify the page loads showing only tasks assigned to the current user"
  );

  shortest(
    "On My Tasks page, verify filter options are available for Status and Priority"
  );

  shortest(
    "On My Tasks page, switch between Table and Kanban views if toggle is available, verify both views work"
  );

  // ---------------------------------------------------------------------------
  // Task Status Updates
  // ---------------------------------------------------------------------------
  shortest(
    "On My Tasks page, find a task with status 'Not Started', click on it or use quick actions to change status to 'In Progress'"
  );

  shortest(
    "Verify the task status change is reflected immediately in the task list or kanban board"
  );

  // ---------------------------------------------------------------------------
  // Task Filtering
  // ---------------------------------------------------------------------------
  shortest(
    "On My Tasks page, filter by 'Today' or 'This Week' date filter, verify only relevant tasks are shown"
  );

  shortest(
    "On My Tasks page, filter by Priority 'High', verify only high priority tasks are displayed"
  );

  // ---------------------------------------------------------------------------
  // Task Details
  // ---------------------------------------------------------------------------
  shortest(
    "Click on any task to open task details, verify task information including Title, Description, Priority, Due Date, and Project are displayed"
  );
});

describe("Executive - My Projects", () => {
  shortest(
    "Navigate to sign-in page, enter vikash.yadav@suprans.in and Suprans123, sign in",
    { email: "vikash.yadav@suprans.in", password: "Suprans123" }
  );

  // ---------------------------------------------------------------------------
  // View Projects
  // ---------------------------------------------------------------------------
  shortest(
    "Navigate to My Projects or Projects page from sidebar, verify projects where user is a team member are displayed"
  );

  shortest(
    "On Projects page, verify each project card shows Project Name, Status, Progress percentage, and Team Members"
  );

  // ---------------------------------------------------------------------------
  // Project Details
  // ---------------------------------------------------------------------------
  shortest(
    "Click on a project card to view details, verify the project detail page shows full project information and associated tasks"
  );

  shortest(
    "On project detail page, verify the user can see tasks associated with the project"
  );
});

describe("Executive - Calendar & Scheduling", () => {
  shortest(
    "Navigate to sign-in page, enter vikash.yadav@suprans.in and Suprans123, sign in",
    { email: "vikash.yadav@suprans.in", password: "Suprans123" }
  );

  // ---------------------------------------------------------------------------
  // My Calendar
  // ---------------------------------------------------------------------------
  shortest(
    "Navigate to My Calendar from sidebar, verify the calendar view loads showing the current month"
  );

  shortest(
    "On Calendar page, verify tasks with due dates and scheduled events are displayed on their respective dates"
  );

  shortest(
    "On Calendar page, click on different dates or use navigation to move between months, verify the view updates correctly"
  );
});

describe("Executive - Leave Management", () => {
  shortest(
    "Navigate to sign-in page, enter vikash.yadav@suprans.in and Suprans123, sign in",
    { email: "vikash.yadav@suprans.in", password: "Suprans123" }
  );

  // ---------------------------------------------------------------------------
  // View Leave Requests
  // ---------------------------------------------------------------------------
  shortest(
    "Navigate to My Leave Requests from sidebar, verify the page shows the user's submitted leave requests with status"
  );

  // ---------------------------------------------------------------------------
  // Request Leave
  // ---------------------------------------------------------------------------
  shortest(
    "On My Leave Requests page, click Request Leave or New Leave button, verify a dialog opens with Date Range, Leave Type, and Reason fields"
  );

  shortest(
    "In Request Leave dialog, verify Leave Type dropdown has options like Annual Leave, Sick Leave, Personal Leave, then close without submitting"
  );
});

describe("Executive - Attendance", () => {
  shortest(
    "Navigate to sign-in page, enter vikash.yadav@suprans.in and Suprans123, sign in",
    { email: "vikash.yadav@suprans.in", password: "Suprans123" }
  );

  shortest(
    "Navigate to My Attendance from sidebar, verify attendance records are displayed showing dates, check-in/out times, and work hours"
  );

  shortest(
    "On My Attendance page, verify there are filters for date range to view historical attendance data"
  );
});

describe("Executive - Documents & Resources", () => {
  shortest(
    "Navigate to sign-in page, enter vikash.yadav@suprans.in and Suprans123, sign in",
    { email: "vikash.yadav@suprans.in", password: "Suprans123" }
  );

  // ---------------------------------------------------------------------------
  // My Documents
  // ---------------------------------------------------------------------------
  shortest(
    "Navigate to My Documents from sidebar, verify the documents page loads showing personal documents and files"
  );

  // ---------------------------------------------------------------------------
  // Knowledge Base
  // ---------------------------------------------------------------------------
  shortest(
    "Navigate to Knowledge Base from Resources section, verify the knowledge base page loads with searchable articles or documentation"
  );

  // ---------------------------------------------------------------------------
  // My Resources
  // ---------------------------------------------------------------------------
  shortest(
    "Navigate to My Resources or External Resources, verify the page shows shared resources and credentials accessible to the user"
  );
});

describe("Executive - Goals & Performance", () => {
  shortest(
    "Navigate to sign-in page, enter vikash.yadav@suprans.in and Suprans123, sign in",
    { email: "vikash.yadav@suprans.in", password: "Suprans123" }
  );

  shortest(
    "Navigate to My Goals from sidebar, verify personal goals are displayed with progress indicators"
  );

  shortest(
    "Navigate to My Performance Reviews if available, verify performance review history or current review status is shown"
  );
});

describe("Executive - Notifications", () => {
  shortest(
    "Navigate to sign-in page, enter vikash.yadav@suprans.in and Suprans123, sign in",
    { email: "vikash.yadav@suprans.in", password: "Suprans123" }
  );

  shortest(
    "Click on the notifications icon in the header, verify a notifications dropdown or page opens showing recent notifications"
  );

  shortest(
    "Navigate to Notifications page, verify notifications list is displayed with timestamp and notification type"
  );

  shortest(
    "On Notifications page, click on a notification to mark it as read or navigate to the related item"
  );
});

describe("Executive - Profile & Settings", () => {
  shortest(
    "Navigate to sign-in page, enter vikash.yadav@suprans.in and Suprans123, sign in",
    { email: "vikash.yadav@suprans.in", password: "Suprans123" }
  );

  shortest(
    "Click on user avatar or profile menu in the header, verify profile options are displayed"
  );

  shortest(
    "Verify the profile menu shows the user's name and email correctly as vikash.yadav@suprans.in"
  );

  shortest(
    "From profile menu, click Sign Out, verify the user is logged out and redirected to sign-in page"
  );
});

describe("Executive - Access Control Verification", () => {
  shortest(
    "Navigate to sign-in page, enter vikash.yadav@suprans.in and Suprans123, sign in",
    { email: "vikash.yadav@suprans.in", password: "Suprans123" }
  );

  // Verify executive cannot access admin pages
  shortest(
    "Try to manually navigate to /admin/users by typing in the URL, verify access is denied or redirected"
  );

  shortest(
    "Try to manually navigate to /admin/permissions by typing in the URL, verify access is denied or redirected"
  );

  shortest(
    "Verify the URL /tasks redirects to /my-tasks for executive users since /tasks is superadmin only"
  );
});

import { ModulePermissionGroup } from "@/lib/types/permissions"

export const permissionDefinitions: ModulePermissionGroup[] = [
  {
    moduleId: "projects",
    moduleName: "Projects",
    permissions: [
      { key: "projects.view", label: "View Projects", description: "View project list and details" },
      { key: "projects.view.all", label: "View All Projects", description: "View all projects (not just assigned)" },
      { key: "projects.view.assigned", label: "View Assigned Only", description: "View only projects assigned to user" },
      { key: "projects.create", label: "Create Projects", description: "Create new projects" },
      { key: "projects.edit", label: "Edit Projects", description: "Edit existing projects" },
      { key: "projects.delete", label: "Delete Projects", description: "Delete projects" },
    ],
  },
  {
    moduleId: "tasks",
    moduleName: "Tasks",
    permissions: [
      { key: "tasks.view", label: "View Tasks", description: "View task list and details" },
      { key: "tasks.view.all", label: "View All Tasks", description: "View all tasks (not just assigned)" },
      { key: "tasks.view.assigned", label: "View Assigned Only", description: "View only tasks assigned to user" },
      { key: "tasks.create", label: "Create Tasks", description: "Create new tasks" },
      { key: "tasks.edit", label: "Edit Tasks", description: "Edit existing tasks" },
      { key: "tasks.delete", label: "Delete Tasks", description: "Delete tasks" },
      { key: "tasks.assign", label: "Assign Tasks", description: "Assign tasks to team members" },
    ],
  },
  {
    moduleId: "hr",
    moduleName: "HR",
    permissions: [
      { key: "hr.view", label: "View HR Data", description: "View HR information" },
      { key: "hr.employees.view", label: "View Employees", description: "View employee list and details" },
      { key: "hr.employees.create", label: "Create Employees", description: "Create new employee records" },
      { key: "hr.employees.edit", label: "Edit Employees", description: "Edit employee information" },
      { key: "hr.employees.delete", label: "Delete Employees", description: "Delete employee records" },
    ],
  },
  {
    moduleId: "recruitment",
    moduleName: "Recruitment",
    permissions: [
      { key: "recruitment.view", label: "View Recruitment", description: "View recruitment data" },
      { key: "recruitment.candidates.view", label: "View Candidates", description: "View candidate list" },
      { key: "recruitment.candidates.create", label: "Create Candidates", description: "Add new candidates" },
      { key: "recruitment.interviews.schedule", label: "Schedule Interviews", description: "Schedule interview sessions" },
    ],
  },
  {
    moduleId: "finance",
    moduleName: "Finance",
    permissions: [
      { key: "finance.view", label: "View Finance", description: "View financial data" },
      { key: "finance.invoices.view", label: "View Invoices", description: "View invoice list" },
      { key: "finance.invoices.create", label: "Create Invoices", description: "Create new invoices" },
      { key: "finance.expenses.view", label: "View Expenses", description: "View expense reports" },
      { key: "finance.expenses.approve", label: "Approve Expenses", description: "Approve expense requests" },
    ],
  },
  {
    moduleId: "admin",
    moduleName: "Administration",
    permissions: [
      { key: "admin.users.view", label: "View Users", description: "View user management" },
      { key: "admin.users.create", label: "Create Users", description: "Create new users" },
      { key: "admin.users.edit", label: "Edit Users", description: "Edit user information" },
      { key: "admin.users.delete", label: "Delete Users", description: "Delete users" },
      { key: "admin.permissions.manage", label: "Manage Permissions", description: "Manage role permissions" },
      { key: "admin.settings.view", label: "View Settings", description: "View system settings" },
      { key: "admin.settings.edit", label: "Edit Settings", description: "Edit system settings" },
    ],
  },
]

// Helper function to get all permission keys
function getAllPermissionKeys(): string[] {
  return permissionDefinitions.flatMap((group) => group.permissions.map((perm) => perm.key))
}

// Default role permissions - can be overridden
export const defaultRolePermissions: Record<string, Record<string, boolean>> = {
  executive: {
    "projects.view": true,
    "projects.view.assigned": true, // Executives see only assigned projects by default
    "tasks.view": true,
    "tasks.view.assigned": true, // Executives see only assigned tasks by default
    "tasks.create": true,
    "tasks.edit": true,
  },
  manager: {
    "projects.view": true,
    "projects.view.all": true, // Managers see all projects
    "projects.create": true,
    "projects.edit": true,
    "tasks.view": true,
    "tasks.view.all": true, // Managers see all tasks
    "tasks.create": true,
    "tasks.edit": true,
    "tasks.assign": true,
    "hr.view": true,
    "hr.employees.view": true,
    "recruitment.view": true,
    "recruitment.candidates.view": true,
  },
  superadmin: {
    // SuperAdmin has all permissions by default
    ...getAllPermissionKeys().reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {} as Record<string, boolean>),
  },
}


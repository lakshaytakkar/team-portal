# Tasks List Page Spec

## Page Information

- **Route**: `/tasks`
- **Page Name**: Tasks List
- **Roles**: Executive, Manager, SuperAdmin
- **Purpose**: View and manage tasks with hierarchical structure. Executives see assigned tasks, Managers see team tasks, SuperAdmin sees all.

## Layout Sections

### Header
- Title: "My Tasks" (Executive) / "Team Tasks" (Manager) / "All Tasks" (SuperAdmin)
- Breadcrumbs: Home > Tasks
- Actions: "New Task" button (top right) - Manager/SuperAdmin only

### Main Content
- **Stats Cards Row**: 3 cards (Total Tasks, Completed, In Progress)
- **Tasks Table**:
  - Columns: Task Name, Status, Priority, Assigned To, Last Updated
  - Hierarchical rows (Level 0, Level 1, Level 2)
  - Expand/collapse functionality
  - Figma link icons

## Data Requirements

### Entities Needed
- `tasks`: Task records with hierarchical structure
- `users`: For assigned_to field
- `projects`: For project links

### Sample Data Structure
Uses existing `Task` type from `lib/types/task.ts`

## Top-Level Actions

| Action | Button/Link Location | Roles | Description | Validation |
|--------|---------------------|-------|-------------|------------|
| New Task | Header button | Manager, SuperAdmin | Opens create task modal/form | - |
| Filter | Filter bar | All | Apply filters (status, priority, project) | - |
| Search | Search bar | All | Search tasks | Min 2 chars |

## Row-Level Actions

| Action | Location | Roles | Description | Validation |
|--------|----------|-------|-------------|------------|
| Expand/Collapse | Row icon | All | Toggle subtask visibility | - |
| View Detail | Row click | All | Navigate to `/tasks/[id]` | - |
| Edit | Row menu | Manager+ (own/team) | Opens edit form | - |
| Delete | Row menu | SuperAdmin | Deletes task | Confirmation required |
| Update Status | Quick action | All (own) / Manager+ (team) | Quick status update | - |

## Form Fields (Create/Edit Task)

| Field | Label | Type | Required | Default | Validation | Permissions |
|-------|-------|------|----------|---------|------------|-------------|
| name | Task Name | text | Yes | - | Min 3 chars, max 200 | Manager+ |
| description | Description | textarea | No | - | Max 1000 chars | Manager+ |
| status | Status | select | Yes | "not-started" | Valid enum | Manager+ |
| priority | Priority | select | Yes | "medium" | Valid enum | Manager+ |
| project | Project | select | No | - | Valid project ID | Manager+ |
| parentTask | Parent Task | select | No | - | Valid task ID (for subtasks) | Manager+ |
| assignedTo | Assigned To | select | Yes | Current user | Valid user ID | Manager+ |
| dueDate | Due Date | date | No | - | Valid date | Manager+ |
| figmaLink | Figma Link | url | No | - | Valid URL | Manager+ |

## States

### Loading State
- Show skeleton table rows
- Disable all actions
- Show "Loading tasks..." message

### Empty State
- Icon: CheckSquare icon
- Title: "No tasks yet"
- Description: "Create your first task to get started"
- Action: "New Task" button (if user has permission)

### Error State
- Show error message: "Failed to load tasks. Please try again."
- Retry button

## Permissions & Access Control

### View Access
- **Executive**: Can view assigned tasks only (`assignedTo = currentUser`)
- **Manager**: Can view team tasks + own tasks
- **SuperAdmin**: Can view all tasks

### Create Access
- **Executive**: No
- **Manager**: Yes
- **SuperAdmin**: Yes

### Edit Access
- **Executive**: Own tasks only
- **Manager**: Team tasks + own tasks
- **SuperAdmin**: All tasks

## Navigation

### From This Page
- Click task row → `/tasks/[id]` (detail page)
- Click "New Task" → Opens modal or navigate to `/tasks/new`

### To This Page
- From Dashboard → Click "View All" in Tasks widget
- From Sidebar → Click "Tasks" menu item

## Analytics Events

- `tasks_list_viewed`: When page loads
- `task_created`: When task is created
- `task_expanded`: When task row is expanded
- `task_status_updated`: When status is updated
- `filter_applied`: When filter is applied

## Design Notes

- Uses hierarchical table with indentation for subtasks
- Level 0 tasks are bold, Level 1/2 are indented
- Figma links show as external link icons
- Expand/collapse icons on left
- Match existing design from current implementation

## Implementation Checklist

- [x] Phase 1: Page shell created (already exists)
- [x] Phase 1: Hierarchical table implemented (already exists)
- [ ] Phase 2: Add empty/loading/error states
- [ ] Phase 2: Fix search functionality
- [ ] Phase 2: Add filter functionality
- [ ] Phase 3: Implement create task modal/form
- [ ] Phase 3: Implement task detail page
- [ ] Phase 3: Add row-level actions (edit, delete, status update)
- [ ] Phase 4: Add microinteractions
- [ ] Phase 4: Bug fixes and polish


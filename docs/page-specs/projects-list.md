# Projects List Page Spec

## Page Information

- **Route**: `/projects`
- **Page Name**: Projects List
- **Roles**: Executive, Manager, SuperAdmin
- **Purpose**: View and manage projects. Executives see assigned projects, Managers see team projects, SuperAdmin sees all.

## Layout Sections

### Header
- Title: "Projects Overview"
- Breadcrumbs: Home > Projects
- Actions: "New Project" button (top right) - Manager/SuperAdmin only

### Main Content
- **Stats Cards Row**: 4 cards (Total Projects, Total Tasks, Total Due Today, Tasks Completed)
- **Projects List Section**:
  - Search bar + Filter button
  - Kanban board view (Not Started, In Progress, Completed, On Hold)
  - Project cards in columns

## Data Requirements

### Entities Needed
- `projects`: Project records
- `tasks`: For task counts
- `project_members`: For team display

### Sample Data Structure
Uses existing `Project` type from `lib/types/project.ts`

## Top-Level Actions

| Action | Button/Link Location | Roles | Description | Validation |
|--------|---------------------|-------|-------------|------------|
| New Project | Header button | Manager, SuperAdmin | Opens create project modal/form | - |
| Search | Search bar | All | Search projects | Min 2 chars |
| Filter | Filter button | All | Apply filters (status, priority, date) | - |

## Row-Level Actions

| Action | Location | Roles | Description | Validation |
|--------|----------|-------|-------------|------------|
| View Detail | Card click | All | Navigate to `/projects/[id]` | - |
| Edit | Card menu | Manager+ (own/team) | Opens edit form | - |
| Delete | Card menu | SuperAdmin | Deletes project | Confirmation required |

## Form Fields (Create/Edit Project)

| Field | Label | Type | Required | Default | Validation | Permissions |
|-------|-------|------|----------|---------|------------|-------------|
| name | Project Name | text | Yes | - | Min 3 chars, max 100 | Manager+ |
| description | Description | textarea | No | - | Max 500 chars | Manager+ |
| status | Status | select | Yes | "planning" | Valid enum | Manager+ |
| priority | Priority | select | Yes | "medium" | Valid enum | Manager+ |
| startDate | Start Date | date | No | Today | Valid date | Manager+ |
| dueDate | Due Date | date | No | - | After start date | Manager+ |
| owner | Owner | select | Yes | Current user | Valid user ID | Manager+ |
| teamMembers | Team Members | multi-select | No | - | Valid user IDs | Manager+ |

## States

### Loading State
- Show skeleton cards matching project card layout
- Disable all actions
- Show "Loading projects..." message

### Empty State
- Icon: Folder icon
- Title: "No projects yet"
- Description: "Create your first project to get started"
- Action: "New Project" button (if user has permission)

### Error State
- Show error message: "Failed to load projects. Please try again."
- Retry button

## Permissions & Access Control

### View Access
- **Executive**: Can view assigned projects only
- **Manager**: Can view team projects + own projects
- **SuperAdmin**: Can view all projects

### Create Access
- **Executive**: No
- **Manager**: Yes
- **SuperAdmin**: Yes

### Edit Access
- **Executive**: Own projects only (if owner)
- **Manager**: Team projects + own projects
- **SuperAdmin**: All projects

## Navigation

### From This Page
- Click project card → `/projects/[id]` (detail page)
- Click "New Project" → Opens modal or navigate to `/projects/new`

### To This Page
- From Dashboard → Click "View All" in Projects widget
- From Sidebar → Click "Projects" menu item

## Analytics Events

- `projects_list_viewed`: When page loads
- `project_created`: When project is created
- `project_card_clicked`: When project card clicked
- `filter_applied`: When filter is applied

## Design Notes

- Uses Kanban board layout (already implemented)
- Project cards show: icon, name, description, status badge, progress bar, team avatars
- Cards are clickable for navigation
- Match existing design from current implementation

## Implementation Checklist

- [x] Phase 1: Page shell created (already exists)
- [x] Phase 1: Kanban layout implemented (already exists)
- [ ] Phase 2: Add empty/loading/error states
- [ ] Phase 2: Fix search functionality
- [ ] Phase 2: Add filter functionality
- [ ] Phase 3: Implement create project modal/form
- [ ] Phase 3: Add row-level actions (edit, delete)
- [ ] Phase 3: Implement project detail page improvements
- [ ] Phase 4: Add microinteractions
- [ ] Phase 4: Bug fixes and polish


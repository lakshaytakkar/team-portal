# Dashboard Page Spec

## Page Information

- **Route**: `/`
- **Page Name**: Dashboard Home
- **Roles**: Executive, Manager, SuperAdmin
- **Purpose**: Central hub showing summary metrics and quick access to key modules

## Layout Sections

### Header
- Title: "Dashboard" (or personalized greeting)
- Breadcrumbs: Home
- Actions: None (or quick action buttons)

### Main Content
- **Stats Row**: 4-6 key metric cards
- **My Tasks Widget**: Summary of user's tasks (Executive focus)
- **My Projects Widget**: Summary of user's projects (Executive focus)
- **My Calls Widget**: Summary of user's calls (Executive focus)
- **My Attendance Widget**: Today's attendance status + quick check-in/out
- **Team Overview** (Manager/SuperAdmin only): Team metrics and activity

## Data Requirements

### Entities Needed
- `projects`: Filtered by user role (own vs team vs all)
- `tasks`: Filtered by assignee
- `calls`: Filtered by user
- `attendance`: Today's record + recent history

### Sample Data Structure
```typescript
interface DashboardData {
  stats: {
    totalTasks: number
    completedTasks: number
    totalProjects: number
    activeProjects: number
    totalCalls: number
    callsThisWeek: number
  }
  myTasks: Task[]
  myProjects: Project[]
  myCalls: Call[]
  attendanceToday: AttendanceRecord | null
}
```

## Top-Level Actions

| Action | Button/Link Location | Roles | Description | Validation |
|--------|---------------------|-------|-------------|------------|
| View All Tasks | Tasks widget footer | All | Navigate to `/tasks` | - |
| View All Projects | Projects widget footer | All | Navigate to `/projects` | - |
| View All Calls | Calls widget footer | All | Navigate to `/calls` | - |
| Check In | Attendance widget | All | Record check-in | Not already checked in |
| Check Out | Attendance widget | All | Record check-out | Must be checked in |

## Row-Level Actions

| Action | Location | Roles | Description | Validation |
|--------|----------|-------|-------------|------------|
| View Task | Task card click | All | Navigate to `/tasks/[id]` | - |
| View Project | Project card click | All | Navigate to `/projects/[id]` | - |
| View Call | Call card click | All | Navigate to `/calls/[id]` | - |

## Form Fields

N/A (Dashboard is primarily read-only with navigation actions)

## States

### Loading State
- Show skeleton loaders for each widget
- Disable all actions
- Show "Loading dashboard..." message

### Empty State
- Show empty state for each widget if no data
- "No tasks yet" with link to create
- "No projects yet" with link to create
- "No calls yet" with link to create

### Error State
- Show error message per widget if fetch fails
- Retry button for each failed widget
- Don't block entire page if one widget fails

## Permissions & Access Control

### View Access
- **Executive**: See only "My" widgets (My Tasks, My Projects, My Calls, My Attendance)
- **Manager**: See "My" widgets + Team Overview widget
- **SuperAdmin**: See all widgets + System Overview widget

### Widget Visibility
- **My Tasks**: All roles
- **My Projects**: All roles
- **My Calls**: All roles
- **My Attendance**: All roles
- **Team Overview**: Manager, SuperAdmin
- **System Overview**: SuperAdmin only

## Navigation

### From This Page
- Click task card → `/tasks/[id]`
- Click project card → `/projects/[id]`
- Click call card → `/calls/[id]`
- Click "View All" → Respective list page
- Click "Check In/Out" → Updates attendance (stays on page)

### To This Page
- Default route after login
- Click "Dashboard" in sidebar
- Click logo/home icon

## Analytics Events

- `dashboard_viewed`: When dashboard loads
- `widget_clicked`: When widget "View All" clicked
- `task_card_clicked`: When task card clicked
- `check_in_clicked`: When check-in button clicked
- `check_out_clicked`: When check-out button clicked

## Design Notes

- Use grid layout for widgets (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
- Stats cards should be visually distinct from content widgets
- Use consistent card styling from design system
- Ensure quick scan-ability of key metrics

## Implementation Checklist

- [ ] Phase 1: Create dashboard layout with widget placeholders
- [ ] Phase 1: Add navigation to widget links
- [ ] Phase 2: Implement stats cards with sample data
- [ ] Phase 2: Implement My Tasks widget
- [ ] Phase 2: Implement My Projects widget
- [ ] Phase 2: Implement My Calls widget
- [ ] Phase 2: Implement My Attendance widget
- [ ] Phase 2: Add empty/loading/error states
- [ ] Phase 3: Add Team Overview widget (Manager+)
- [ ] Phase 3: Add System Overview widget (SuperAdmin)
- [ ] Phase 3: Implement check-in/check-out functionality
- [ ] Phase 4: Add refresh animations
- [ ] Phase 4: Add keyboard shortcuts
- [ ] Phase 4: Polish and bug fixes


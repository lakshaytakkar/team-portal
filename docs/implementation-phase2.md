# Phase 2 Implementation Plan: Fix Gaps & Interactions

This document outlines the implementation plan for Phase 2 of the AI-first development workflow.

## Phase 2 Goals

Fix gaps and add interactions:
- Data fetching with sample data
- Empty/loading/error states
- Form validations
- Search functionality
- Filter functionality
- Fix broken links and interactions
- Add missing buttons and actions

## Pages to Enhance

### 1. Dashboard (`/`)
**Tasks**:
- [ ] Implement data fetching for stats cards
- [ ] Implement data fetching for "My Tasks" widget
- [ ] Implement data fetching for "My Projects" widget
- [ ] Implement data fetching for "My Calls" widget
- [ ] Implement data fetching for "My Attendance" widget
- [ ] Add loading states (skeleton loaders)
- [ ] Add empty states for each widget
- [ ] Add error states with retry functionality
- [ ] Implement check-in/check-out functionality
- [ ] Add click handlers for widget links

**Reference**: `docs/page-specs/dashboard.md`, `docs/ux-contracts.md`

### 2. Projects List (`/projects`)
**Tasks**:
- [ ] Implement data fetching (use existing sample data)
- [ ] Add loading state (skeleton cards)
- [ ] Add empty state
- [ ] Add error state with retry
- [ ] Fix search functionality (currently exists but verify)
- [ ] Add filter functionality (status, priority, date range)
- [ ] Fix "New Project" button (currently exists but verify)
- [ ] Ensure all project card links work
- [ ] Add row menu actions (edit, delete)

**Reference**: `docs/page-specs/projects-list.md`

### 3. Tasks List (`/tasks`)
**Tasks**:
- [ ] Implement data fetching (use existing sample data)
- [ ] Add loading state (skeleton rows)
- [ ] Add empty state
- [ ] Add error state with retry
- [ ] Fix search functionality
- [ ] Add filter functionality (status, priority, project, assigned to)
- [ ] Fix expand/collapse functionality (currently exists but verify)
- [ ] Ensure Figma links work
- [ ] Add row menu actions (edit, delete, status update)

**Reference**: `docs/page-specs/tasks-list.md`

### 4. Calls List (`/calls`)
**Tasks**:
- [ ] Create sample data file `lib/data/calls.ts`
- [ ] Implement data fetching
- [ ] Add loading state (skeleton rows)
- [ ] Add empty state
- [ ] Add error state with retry
- [ ] Implement search functionality
- [ ] Add filter functionality (status, date range, assigned to, outcome)
- [ ] Fix "New Call" button
- [ ] Ensure all call row links work
- [ ] Add row menu actions (edit, delete, log outcome)

**Reference**: `docs/page-specs/calls-list.md`

### 5. Call Detail (`/calls/[id]`)
**Tasks**:
- [ ] Implement data fetching by ID
- [ ] Add loading state
- [ ] Add error state (404 if not found)
- [ ] Add edit functionality
- [ ] Add delete functionality with confirmation
- [ ] Add "Log Outcome" quick action
- [ ] Add "Schedule Follow-up" quick action
- [ ] Fix navigation back to list

**Reference**: `docs/page-specs/calls-list.md`

### 6. Create/Edit Call Forms
**Tasks**:
- [ ] Add form validation (required fields, email format, date validation)
- [ ] Add inline error messages
- [ ] Add form submission handler (sample data mutation)
- [ ] Add success toast notification
- [ ] Add error handling
- [ ] Redirect to detail page on success
- [ ] Pre-fill form for edit mode

**Reference**: `docs/page-specs/calls-list.md`, `docs/ux-contracts.md`

### 7. Task Detail (`/tasks/[id]`)
**Tasks**:
- [ ] Implement data fetching by ID
- [ ] Add loading state
- [ ] Add error state (404 if not found)
- [ ] Display task hierarchy (parent, subtasks)
- [ ] Add edit functionality
- [ ] Add delete functionality with confirmation
- [ ] Add status update quick action
- [ ] Add "Add Subtask" functionality
- [ ] Fix navigation back to list

**Reference**: `docs/page-specs/tasks-list.md`

### 8. Create/Edit Task Forms
**Tasks**:
- [ ] Add form validation
- [ ] Add project selector (dropdown)
- [ ] Add parent task selector (for subtasks)
- [ ] Add assigned to selector
- [ ] Add form submission handler
- [ ] Add success toast notification
- [ ] Add error handling
- [ ] Pre-fill form for edit mode

**Reference**: `docs/page-specs/tasks-list.md`

### 9. Project Detail (`/projects/[id]`)
**Tasks**:
- [ ] Review existing implementation
- [ ] Add loading state
- [ ] Add error state
- [ ] Fix edit functionality
- [ ] Fix delete functionality
- [ ] Add "Add Task" functionality
- [ ] Display project tasks list
- [ ] Display team members
- [ ] Add team member assignment

**Reference**: `docs/page-specs/projects-list.md`

### 10. Create/Edit Project Forms
**Tasks**:
- [ ] Add form validation
- [ ] Add team member multi-select
- [ ] Add date validation (end date after start date)
- [ ] Add form submission handler
- [ ] Add success toast notification
- [ ] Add error handling
- [ ] Pre-fill form for edit mode

**Reference**: `docs/page-specs/projects-list.md`

### 11. Attendance (`/attendance`)
**Tasks**:
- [ ] Create sample data file `lib/data/attendance.ts`
- [ ] Implement data fetching for today's status
- [ ] Implement data fetching for this week summary
- [ ] Implement data fetching for recent history
- [ ] Add loading states
- [ ] Add empty states
- [ ] Add error states
- [ ] Implement check-in functionality
- [ ] Implement check-out functionality
- [ ] Add time validation (check-out after check-in)
- [ ] Add success toast notifications

**Reference**: `docs/page-specs/attendance.md`

### 12. Attendance History (`/attendance/history`)
**Tasks**:
- [ ] Implement data fetching with date range filter
- [ ] Add loading state
- [ ] Add empty state
- [ ] Add error state
- [ ] Implement date range filter
- [ ] Add export functionality (CSV) for Manager+
- [ ] Add "Request Correction" functionality

**Reference**: `docs/page-specs/attendance.md`

### 13. Attendance Corrections (`/attendance/corrections`)
**Tasks**:
- [ ] Create sample data for correction requests
- [ ] Implement data fetching
- [ ] Add loading state
- [ ] Add empty state
- [ ] Add error state
- [ ] Implement approve functionality
- [ ] Implement reject functionality
- [ ] Add filter by status
- [ ] Add review notes functionality

**Reference**: `docs/page-specs/attendance.md`

## Common Tasks (Apply to All Pages)

### Data Fetching
- [ ] Use React Query (`@tanstack/react-query`)
- [ ] Create query hooks for each entity
- [ ] Use sample data from `lib/data/*`
- [ ] Implement proper error handling
- [ ] Add query invalidation on mutations

### Loading States
- [ ] Add skeleton loaders matching layout
- [ ] Use shadcn Skeleton component or custom skeletons
- [ ] Disable interactive elements during loading
- [ ] Show loading for at least 300ms

**Reference**: `docs/ux-contracts.md`

### Empty States
- [ ] Create empty state component
- [ ] Use consistent structure (icon, title, description, action)
- [ ] Show action button only if user has permission
- [ ] Match empty state patterns

**Reference**: `docs/ux-contracts.md`

### Error States
- [ ] Add error message display
- [ ] Add retry button
- [ ] Use React Query's error state
- [ ] Show user-friendly error messages
- [ ] Log errors for debugging

**Reference**: `docs/ux-contracts.md`

### Form Validation
- [ ] Validate required fields
- [ ] Validate field formats (email, date, URL)
- [ ] Show inline error messages
- [ ] Prevent submission if validation fails
- [ ] Use validation rules from page specs

**Reference**: `docs/ux-contracts.md`

### Search Functionality
- [ ] Implement debounced search (300ms)
- [ ] Search across relevant fields
- [ ] Show "No results" state
- [ ] Add clear search button
- [ ] Update URL params or state

**Reference**: `docs/ux-contracts.md`

### Filter Functionality
- [ ] Add filter UI (dropdowns, buttons)
- [ ] Update URL params or state
- [ ] Show active filter indicators
- [ ] Add "Clear filters" button
- [ ] Persist filters in URL (optional)

**Reference**: `docs/ux-contracts.md`

### Toast Notifications
- [ ] Add toast component (use shadcn toast or similar)
- [ ] Show success toasts on create/update/delete
- [ ] Show error toasts on failures
- [ ] Auto-dismiss after 3-5 seconds
- [ ] Use appropriate icons and colors

**Reference**: `docs/ux-contracts.md`

## Sample Data Files to Create

### `lib/data/calls.ts`
```typescript
export interface Call {
  id: string
  date: string
  time: string
  contactName: string
  company?: string
  phone?: string
  email?: string
  outcome: CallOutcome
  notes?: string
  nextAction?: string
  nextActionDate?: string
  assignedTo: { id: string; name: string; email?: string }
  status: CallStatus
  createdAt: string
  updatedAt: string
}

export const initialCalls = {
  calls: [
    // Sample call data
  ]
}
```

### `lib/data/attendance.ts`
```typescript
export interface AttendanceRecord {
  id: string
  userId: string
  date: string
  checkInTime: string | null
  checkOutTime: string | null
  status: 'present' | 'absent' | 'late' | 'half-day' | 'leave'
  notes?: string
  createdAt: string
  updatedAt: string
}

export const initialAttendance = {
  records: [
    // Sample attendance data
  ]
}
```

## Acceptance Criteria

Each page is considered "Phase 2 Complete" when:
- [ ] Data fetching works with sample data
- [ ] Loading states are implemented
- [ ] Empty states are implemented
- [ ] Error states are implemented
- [ ] Form validations work
- [ ] Search functionality works (if applicable)
- [ ] Filter functionality works (if applicable)
- [ ] All links and buttons work
- [ ] Toast notifications work
- [ ] No console errors
- [ ] All interactions are smooth

## Next Steps After Phase 2

Once Phase 2 is complete, move to Phase 3:
- Implement detail pages fully
- Add all row-level actions
- Add all top-level actions
- Implement create/edit/delete flows end-to-end
- Add optimistic UI updates


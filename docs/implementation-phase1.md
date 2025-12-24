# Phase 1 Implementation Plan: UI/Layout Shells

This document outlines the implementation plan for Phase 1 of the AI-first development workflow.

## Phase 1 Goals

Build page shells with:
- Consistent layout structure
- Navigation/routing
- Placeholder content
- Basic UI components
- Responsive design

## Pages to Implement

### 1. Dashboard (`/`)
**Status**: Needs enhancement
**Tasks**:
- [ ] Create dashboard layout with widget placeholders
- [ ] Add stats cards row (4-6 cards)
- [ ] Add "My Tasks" widget
- [ ] Add "My Projects" widget
- [ ] Add "My Calls" widget
- [ ] Add "My Attendance" widget
- [ ] Add navigation links to each widget
- [ ] Ensure responsive grid layout

**Reference**: `docs/page-specs/dashboard.md`

### 2. Calls List (`/calls`)
**Status**: Not started
**Tasks**:
- [ ] Create page shell at `app/(dashboard)/calls/page.tsx`
- [ ] Add header with title and "New Call" button
- [ ] Add search bar and filter button
- [ ] Create table structure (columns: Date/Time, Contact, Company, Outcome, Next Action, Assigned To, Status)
- [ ] Add placeholder rows
- [ ] Add navigation/routing
- [ ] Add to sidebar menu

**Reference**: `docs/page-specs/calls-list.md`

### 3. Call Detail (`/calls/[id]`)
**Status**: Not started
**Tasks**:
- [ ] Create page shell at `app/(dashboard)/calls/[id]/page.tsx`
- [ ] Add header with breadcrumbs
- [ ] Create detail sections (Call Info, Notes, Outcomes, Next Actions)
- [ ] Add edit/delete actions (if user has permission)
- [ ] Add navigation back to list

**Reference**: `docs/page-specs/calls-list.md` (detail section)

### 4. Create Call (`/calls/new`)
**Status**: Not started
**Tasks**:
- [ ] Create page shell at `app/(dashboard)/calls/new/page.tsx`
- [ ] Add form structure with all fields
- [ ] Add form validation (basic)
- [ ] Add submit handler (placeholder)
- [ ] Add cancel button with navigation

**Reference**: `docs/page-specs/calls-list.md` (form fields)

### 5. Task Detail (`/tasks/[id]`)
**Status**: Not started
**Tasks**:
- [ ] Create page shell at `app/(dashboard)/tasks/[id]/page.tsx`
- [ ] Add header with breadcrumbs
- [ ] Create detail sections (Task Info, Subtasks, Comments placeholder)
- [ ] Add edit/delete actions (if user has permission)
- [ ] Add status update quick action
- [ ] Add navigation back to list

**Reference**: `docs/page-specs/tasks-list.md` (detail section)

### 6. Create Task (`/tasks/new`)
**Status**: Not started
**Tasks**:
- [ ] Create page shell at `app/(dashboard)/tasks/new/page.tsx`
- [ ] Add form structure with all fields
- [ ] Add project selector
- [ ] Add parent task selector (for subtasks)
- [ ] Add form validation (basic)
- [ ] Add submit handler (placeholder)

**Reference**: `docs/page-specs/tasks-list.md` (form fields)

### 7. Project Detail (`/projects/[id]`)
**Status**: Exists but needs enhancement
**Tasks**:
- [ ] Review existing implementation
- [ ] Ensure all sections are present
- [ ] Add missing actions
- [ ] Improve layout consistency

**Reference**: `docs/page-specs/projects-list.md` (detail section)

### 8. Create Project (`/projects/new`)
**Status**: Not started
**Tasks**:
- [ ] Create page shell at `app/(dashboard)/projects/new/page.tsx`
- [ ] Add form structure with all fields
- [ ] Add team member selector
- [ ] Add form validation (basic)
- [ ] Add submit handler (placeholder)

**Reference**: `docs/page-specs/projects-list.md` (form fields)

### 9. Attendance History (`/attendance/history`)
**Status**: Not started
**Tasks**:
- [ ] Create page shell at `app/(dashboard)/attendance/history/page.tsx`
- [ ] Add header with filters
- [ ] Create table structure
- [ ] Add date range filter
- [ ] Add export button (Manager+)

**Reference**: `docs/page-specs/attendance.md`

### 10. Attendance Corrections (`/attendance/corrections`)
**Status**: Not started
**Tasks**:
- [ ] Create page shell at `app/(dashboard)/attendance/corrections/page.tsx`
- [ ] Add header
- [ ] Create table of pending corrections
- [ ] Add approve/reject actions
- [ ] Add filter by status

**Reference**: `docs/page-specs/attendance.md`

### 11. Developer Portal (`/dev`)
**Status**: Not started
**Tasks**:
- [ ] Create page shell at `app/(dashboard)/dev/page.tsx`
- [ ] Add header
- [ ] Create sections: Stats, Page Inventory, Figma Links, Prompt Library, Stack Grid, Credentials, Sample Data Controls
- [ ] Add navigation to sidebar (dev section)

**Reference**: `docs/dev-portal-spec.md`

## Implementation Order

1. **Calls List** (`/calls`) - New module, start fresh
2. **Dashboard** (`/`) - Enhance existing
3. **Call Detail** (`/calls/[id]`) - Complete calls module
4. **Create Call** (`/calls/new`) - Complete calls module
5. **Task Detail** (`/tasks/[id]`) - Enhance tasks module
6. **Create Task** (`/tasks/new`) - Enhance tasks module
7. **Create Project** (`/projects/new`) - Enhance projects module
8. **Attendance History** (`/attendance/history`) - Enhance attendance module
9. **Attendance Corrections** (`/attendance/corrections`) - Enhance attendance module
10. **Developer Portal** (`/dev`) - Internal tool

## Common Tasks (Apply to All Pages)

### Layout Consistency
- [ ] Use `DashboardLayout` component
- [ ] Ensure breadcrumbs work correctly
- [ ] Match spacing and typography
- [ ] Use consistent card/container styling

### Navigation
- [ ] Add sidebar menu items
- [ ] Ensure all links work
- [ ] Add proper TypeScript types for routes
- [ ] Test navigation flow

### Responsive Design
- [ ] Test on mobile (< 640px)
- [ ] Test on tablet (640px - 1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Ensure touch targets are adequate (44x44px minimum)

### Component Usage
- [ ] Use existing UI components from `components/ui/*`
- [ ] Follow design system patterns
- [ ] Match color palette
- [ ] Use consistent icons (lucide-react)

## Sample Data Strategy

For Phase 1, use sample data from:
- `lib/data/projects.ts` (existing)
- `lib/data/tasks.ts` (existing)
- `lib/data/calls.ts` (to be created)
- `lib/data/attendance.ts` (to be created)

Create sample data files if they don't exist:
- [ ] Create `lib/data/calls.ts` with sample call data
- [ ] Create `lib/data/attendance.ts` with sample attendance data

## Acceptance Criteria

Each page is considered "Phase 1 Complete" when:
- [ ] Page shell exists and renders without errors
- [ ] Navigation works (sidebar, breadcrumbs, links)
- [ ] Layout matches design system
- [ ] Placeholder content is present
- [ ] Responsive design works
- [ ] No console errors
- [ ] TypeScript types are correct

## Next Steps After Phase 1

Once Phase 1 is complete, move to Phase 2:
- Add data fetching (sample data)
- Add empty/loading/error states
- Fix broken links and interactions
- Add form validations
- Implement search/filter functionality


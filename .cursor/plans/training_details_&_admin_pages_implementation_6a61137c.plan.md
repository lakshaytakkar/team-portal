---
name: Training Details & Admin Pages Implementation
overview: Build training details page with full-page video player, comprehensive permission matrix, and user management pages in our brand and layout style.
todos:
  - id: training-types
    content: Extend Training type to support videos array in lib/types/my-workspace.ts
    status: completed
  - id: training-video-player
    content: Create TrainingVideoPlayer component with controls (play, pause, seek, volume, fullscreen)
    status: completed
  - id: training-video-sidebar
    content: Create TrainingVideoSidebar component with video list navigation
    status: completed
  - id: training-detail-page
    content: Replace modal-based training detail page with full-page video layout
    status: completed
  - id: user-types
    content: Create AdminUser type and related types in lib/types/admin.ts
    status: completed
  - id: user-table
    content: Build UsersTable component with columns, sorting, filtering
    status: completed
  - id: user-columns
    content: Create UserColumns component with action handlers
    status: completed
  - id: user-forms
    content: Enhance CreateUserDialog and add EditUserDialog with validation
    status: completed
  - id: user-bulk-actions
    content: Implement bulk actions (delete, suspend, activate) for selected users
    status: completed
  - id: permission-types
    content: Define Permission, ModulePermissionGroup, RolePermissions types
    status: completed
  - id: permission-data
    content: Create permission definitions data structure
    status: completed
  - id: permission-matrix
    content: Build PermissionsMatrix component with role tabs and search
    status: completed
  - id: permission-card
    content: Create PermissionCard component for individual modules
    status: completed
  - id: permission-page
    content: Implement admin/permissions page with full matrix interface
    status: completed
---

# Training De

tails & Admin Pages Implementation Plan

## Overview

This plan covers implementing three major features:

1. **Training Details Page** - Full-page video player view replacing the modal
2. **Permission Matrix Page** - Comprehensive role-based permission management
3. **User Management Page** - Full-featured admin user management interface

## 1. Training Details Page (`/my-training/[id]`)

### Current State

- Modal-based quick detail view using `QuickDetailModal`
- Simple training interface with basic info display
- Training type supports single URL field

### Target State

- Full-page layout with video player (similar to academy course details)
- Video sidebar navigation for video list
- Video player with controls (play, pause, seek, volume, fullscreen)
- Simple flat list of videos (no modules/chapters structure)
- Maintain our brand styling and layout patterns

### Implementation Details

#### Files to Create/Modify

- `app/(dashboard)/my-training/[id]/page.tsx` - Replace modal with full-page layout
- `components/training/TrainingVideoPlayer.tsx` - Video player component
- `components/training/TrainingVideoSidebar.tsx` - Sidebar with video list
- `lib/types/my-workspace.ts` - Extend Training type to support video array

#### Training Data Structure Changes

```typescript
export interface TrainingVideo {
  id: string
  title: string
  url: string
  duration?: number // in minutes
  thumbnailUrl?: string
}

export interface Training {
  // ... existing fields
  videos?: TrainingVideo[] // Array of videos for this training
  // Keep url field for backward compatibility (single video)
}
```



#### Page Layout Structure

- Header bar with close button, training title, and video counter
- Two-column layout:
- Left sidebar (400px): Video list with titles and durations
- Right main area: Video player with controls
- Full-page height layout (no modal)

#### Video Player Features

- Custom video controls overlay
- Play/pause, skip forward/backward (10s)
- Volume control and mute
- Progress bar with seeking
- Fullscreen support
- Time display (current/total)
- Auto-play next video when current ends

#### Design Notes

- Use our existing Card, Button, and UI component styles
- Follow dashboard layout patterns from `components/layouts/DashboardLayout.tsx`
- Match styling from other detail pages (projects, tasks)
- Use `rounded-[14px]` for cards, consistent spacing patterns

### Components Reference

- Video player inspired by: `C:\Development\Under Review\usdrop-v3\src\app\academy\[id]\components\course-video-player.tsx`
- Simplified sidebar (no modules/chapters): `C:\Development\Under Review\usdrop-v3\src\app\academy\[id]\components\course-sidebar.tsx` (simplified)

---

## 2. Permission Matrix Page (`/admin/permissions`)

### Current State

- Empty state placeholder
- No functionality

### Target State

- Comprehensive permission matrix interface
- Role-based permission management
- Searchable permission grid
- Module-based organization
- Permission cards with checkboxes
- Similar to: `C:\Development\Under Review\usdrop-v3\src\app\admin\permissions\components\permissions-matrix.tsx`

### Implementation Details

#### Files to Create/Modify

- `app/(dashboard)/admin/permissions/page.tsx` - Main page
- `components/admin/PermissionsMatrix.tsx` - Main matrix component
- `components/admin/PermissionCard.tsx` - Individual permission module card
- `lib/types/permissions.ts` - Permission type definitions
- `lib/data/permissions.ts` - Permission definitions data

#### Permission Structure

```typescript
export interface Permission {
  key: string // e.g., "projects.create"
  label: string
  description?: string
}

export interface ModulePermissionGroup {
  moduleId: string
  moduleName: string
  permissions: Permission[]
}

export interface RolePermissions {
  [permissionKey: string]: boolean
}
```



#### Features

- Role selector tabs (Executive, Manager, SuperAdmin)
- Permission groups organized by module (Projects, Tasks, HR, etc.)
- Search functionality to filter permissions
- Select all/none for modules
- Visual indicators for selected permissions
- Save/update permissions per role

#### Layout Structure

- Header with title and description
- Role tabs at top
- Search bar for filtering
- Grid of permission cards (2-4 columns responsive)
- Each card shows module name and list of permissions with checkboxes

#### Design Notes

- Use our Card components with consistent styling
- Match admin page header style (primary background bar)
- Use Checkbox component from our UI library
- Responsive grid layout

### Components Reference

- `C:\Development\Under Review\usdrop-v3\src\app\admin\permissions\components\permissions-matrix.tsx`
- `C:\Development\Under Review\usdrop-v3\src\app\admin\permissions\components\permission-card.tsx`

---

## 3. User Management Page (`/admin/users`)

### Current State

- Empty state placeholder with basic CreateUserDialog
- No table or management features

### Target State

- Comprehensive user management interface
- Data table with sorting, filtering, pagination
- User creation/editing forms
- Bulk actions (delete, suspend, activate)
- Role-based filtering tabs
- Similar to: `C:\Development\Under Review\usdrop-v3\src\app\admin\internal-users\page.tsx`

### Implementation Details

#### Files to Create/Modify

- `app/(dashboard)/admin/users/page.tsx` - Main page (replace empty state)
- `components/admin/UsersTable.tsx` - Table component
- `components/admin/UserColumns.tsx` - Table column definitions
- `components/admin/CreateUserDialog.tsx` - Already exists, may need enhancement
- `lib/types/admin.ts` - User management types
- `lib/data/users.ts` - Mock data (or connect to API)

#### User Data Structure

```typescript
export interface AdminUser {
  id: string
  name: string
  email: string
  role: "executive" | "manager" | "superadmin"
  status: "active" | "inactive" | "suspended"
  department?: string
  phoneNumber?: string
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
}
```



#### Features

- Role filter tabs (All, Executive, Manager, SuperAdmin) with counts
- Search by name/email
- Status filtering
- Date range filtering
- Sortable columns (name, email, role, status, updated)
- Row selection for bulk actions
- Actions per user: View details, Edit, Delete, Suspend, Activate
- Create new user button
- Export to CSV
- Pagination

#### Table Columns

- Checkbox (selection)
- Avatar + Name (clickable for quick view)
- Email
- Role (badge)
- Status (badge)
- Department
- Last Updated
- Actions (menu)

#### Dialogs/Modals

- Create/Edit User Dialog (enhance existing)
- Delete Confirmation Dialog
- Suspend Confirmation Dialog
- Quick View Modal (small preview)

#### Design Notes

- Use DataTable component pattern from other pages
- Match styling from projects/tasks pages
- Use primary header bar style
- Use Badge components for role/status
- Use Avatar component for user avatars
- Follow form patterns from other admin forms

### Components Reference

- `C:\Development\Under Review\usdrop-v3\src\app\admin\internal-users\page.tsx` (comprehensive example)
- `C:\Development\Under Review\usdrop-v3\src\app\admin\internal-users\components\internal-users-columns.tsx`

---

## Implementation Order

1. **Training Details Page** (Priority 1 - user requested)

- Extend Training type
- Create video player component
- Create video sidebar component
- Update training detail page

2. **User Management Page** (Priority 2)

- Create types and data structures
- Build table component
- Implement create/edit forms
- Add bulk actions

3. **Permission Matrix Page** (Priority 3)

- Define permission structure
- Build matrix component
- Implement permission cards
- Add role management

## Design Consistency

All pages should:

- Use `DashboardLayout` wrapper
- Follow card styling: `border border-border rounded-[14px]`
- Use consistent spacing: `space-y-5` for page sections
- Header pattern: Primary bar with title/description
- Use existing UI components from `components/ui/`
- Match color scheme and typography from design system
- Follow responsive patterns from existing pages

## Notes

- Training page: Focus on video-only experience, simple flat list
- User management: Comprehensive CRUD operations with proper validation
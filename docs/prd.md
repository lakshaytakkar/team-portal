# Internal Team Portal - PRD Lite

## Context

We're building an internal team portal to streamline project management, task tracking, call management, and attendance for our organization. This portal will serve three primary user roles: SuperAdmin, Manager, and Executive.

## Users & Roles

### SuperAdmin
- **Primary needs**: Full system control, configuration, user/role management, permission matrix setup
- **Key activities**: 
  - Configure organization settings
  - Manage users and roles
  - Set up and verify RLS policies
  - Monitor system health

### Manager
- **Primary needs**: Team oversight, work assignment, approvals, team performance visibility
- **Key activities**:
  - Assign tasks and projects to team members
  - Review and approve attendance corrections
  - View team dashboards (calls, tasks, projects, attendance)
  - Monitor team progress and blockers

### Executive
- **Primary needs**: Focus on personal work items, quick status updates, minimal friction
- **Key activities**:
  - View and manage "My Calls"
  - Track and update "My Tasks"
  - Monitor "My Projects" progress
  - Record and view "My Attendance"

## Modules (MVP)

### 1. Dashboard
- **Purpose**: Central hub showing summary of all key metrics
- **Executive view**: My Tasks summary, My Projects summary, My Calls summary, My Attendance summary
- **Manager view**: Team overview + personal summary
- **SuperAdmin view**: System-wide metrics + configuration shortcuts

### 2. Projects
- **Purpose**: Manage and track project lifecycle
- **Key features**: 
  - Project list (Kanban/List view)
  - Project detail pages
  - Project creation/editing
  - Team assignment
  - Progress tracking

### 3. Tasks
- **Purpose**: Task management with hierarchical structure
- **Key features**:
  - Hierarchical task list (Level 0 → Level 1 → Level 2)
  - Task assignment
  - Status updates
  - Priority management
  - Figma link integration

### 4. Calls
- **Purpose**: Track sales/outreach calls and outcomes
- **Key features**:
  - Call list (My Calls for executives, Team Calls for managers)
  - Call creation/editing
  - Call outcomes tracking
  - Next action items
  - Follow-up scheduling

### 5. Attendance
- **Purpose**: Track employee attendance and time
- **Key features**:
  - Check-in/Check-out
  - Attendance history
  - Attendance corrections (manager approval)
  - Attendance reports

## Key User Journeys

### Executive Journey: Complete a Task
1. Log in → Dashboard
2. See "My Tasks" widget showing 3 high-priority tasks
3. Click "View All" → Tasks page
4. Filter by "In Progress"
5. Click task → Task detail page
6. Update status to "Completed"
7. Add completion notes
8. Save → Redirected to Tasks list

### Manager Journey: Assign Work
1. Log in → Dashboard
2. Navigate to Projects
3. Click project → Project detail
4. Click "Add Task"
5. Fill task form (name, assignee, due date, priority)
6. Save → Task appears in project
7. Assigned executive receives notification (future)

### SuperAdmin Journey: Configure Permissions
1. Log in → Dashboard
2. Navigate to Settings/Admin
3. View Permission Matrix
4. Edit role capabilities
5. Verify RLS policies
6. Test with test user

## Non-Goals (Out of Scope for MVP)

- Email notifications (Phase 2)
- Real-time collaboration features
- Mobile app (web-first)
- Advanced analytics/reporting
- Integration with external tools (Slack, etc.)
- File attachments (Phase 2)
- Comments/threading (Phase 2)
- Calendar integration
- Time tracking beyond attendance

## Success Criteria

### Executive
- Can view all "My" items (Tasks, Projects, Calls, Attendance) in < 2 clicks
- Can update task status in < 3 clicks
- Can log attendance in < 2 clicks
- Dashboard loads in < 2 seconds

### Manager
- Can assign tasks to team members
- Can view team performance metrics
- Can approve attendance corrections
- Can filter/search team data effectively

### SuperAdmin
- Can configure roles and permissions
- Can verify RLS policies are working
- Can manage users efficiently
- System is secure (no unauthorized access)

## Technical Stack

- **Runtime**: Bun
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + RLS)
- **UI Components**: Custom components in `components/ui/*`
- **State Management**: React Query (TanStack Query)
- **Authentication**: Supabase Auth

## Development Approach

1. **Document-first**: All pages and features documented before implementation
2. **4-phase AI workflow**:
   - Phase 1: UI/Layout shells
   - Phase 2: Fix gaps/interactions
   - Phase 3: Details/actions
   - Phase 4: Microinteractions/bug fixes
3. **Sample data first**: Build UI with sample data, then design Supabase schema
4. **RLS last**: After UI is stable, implement permissions and RLS


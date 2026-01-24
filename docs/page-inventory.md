# Page Inventory & Figma Map

This document tracks all pages in the Internal Team Portal, their status, Figma links, and implementation details.

## Status Legend
- **Draft**: Figma design not started
- **Ready**: Figma design complete, ready for implementation
- **In Progress**: Currently being built
- **Built**: Implementation complete (Phase 1)
- **QA**: Ready for testing/QA
- **Done**: Complete through Phase 4

## MVP Pages

### Dashboard Pages

| Route | Page Name | Roles | Owner | Figma Link | Status | Data Dependencies | Actions |
|-------|-----------|-------|-------|------------|--------|-------------------|---------|
| `/` | Dashboard Home | All | TBD | [Link TBD] | Draft | Projects, Tasks, Calls, Attendance | View summaries, Quick actions |

### Projects Module

| Route | Page Name | Roles | Owner | Figma Link | Status | Data Dependencies | Actions |
|-------|-----------|-------|-------|------------|--------|-------------------|---------|
| `/projects` | Projects List | All | TBD | [Link TBD] | Built | Projects | Create, Filter, Search, View detail |
| `/projects/[id]` | Project Detail | All | TBD | [Link TBD] | Built | Project, Tasks, Team | Edit, Delete, Add task, Assign team |
| `/projects/new` | Create Project | Manager, SuperAdmin | TBD | [Link TBD] | Draft | - | Create project form |

### Tasks Module

| Route | Page Name | Roles | Owner | Figma Link | Status | Data Dependencies | Actions |
|-------|-----------|-------|-------|------------|--------|-------------------|---------|
| `/tasks` | Tasks List | All | TBD | [Link TBD] | Built | Tasks | Filter, Search, Expand/collapse, View detail |
| `/tasks/[id]` | Task Detail | All | TBD | [Link TBD] | Draft | Task, Subtasks, Comments | Edit, Update status, Assign, Add subtask |
| `/tasks/new` | Create Task | Manager, SuperAdmin | TBD | [Link TBD] | Draft | Projects | Create task form |

### Calls Module

| Route | Page Name | Roles | Owner | Figma Link | Status | Data Dependencies | Actions |
|-------|-----------|-------|-------|------------|--------|-------------------|---------|
| `/calls` | Calls List | All | TBD | [Link TBD] | Draft | Calls | Create, Filter, Search, View detail |
| `/calls/[id]` | Call Detail | All | TBD | [Link TBD] | Draft | Call, Outcomes, Next actions | Edit, Log outcome, Schedule follow-up |
| `/calls/new` | Create Call | All | TBD | [Link TBD] | Draft | Contacts (future) | Create call form |

### Attendance Module

| Route | Page Name | Roles | Owner | Figma Link | Status | Data Dependencies | Actions |
|-------|-----------|-------|-------|------------|--------|-------------------|---------|
| `/attendance` | Attendance Dashboard | All | TBD | [Link TBD] | Built | Attendance records | Check-in, Check-out, View history |
| `/attendance/history` | Attendance History | All | TBD | [Link TBD] | Draft | Attendance records | Filter, Export, Request correction |
| `/attendance/corrections` | Attendance Corrections | Manager, SuperAdmin | TBD | [Link TBD] | Draft | Correction requests | Approve, Reject, View details |

### Admin/Configuration Pages

| Route | Page Name | Roles | Owner | Figma Link | Status | Data Dependencies | Actions |
|-------|-----------|-------|-------|------------|--------|-------------------|---------|
| `/admin/users` | User Management | SuperAdmin | TBD | [Link TBD] | Draft | Users, Roles | Create, Edit, Assign roles, Deactivate |
| `/admin/permissions` | Permission Matrix | SuperAdmin | TBD | [Link TBD] | Draft | Roles, Permissions | Edit capabilities, Test policies |
| `/admin/settings` | System Settings | SuperAdmin | TBD | [Link TBD] | Draft | Settings | Configure org, Update settings |

### Developer Portal

| Route | Page Name | Roles | Owner | Figma Link | Status | Data Dependencies | Actions |
|-------|-----------|-------|-------|------------|--------|-------------------|---------|
| `/dev` | Developer Portal | All (dev only) | TBD | N/A | Draft | Page inventory, Prompts | View docs, Copy prompts, Access resources |

## Sales Module

| Route | Page Name | Roles | Owner | Figma Link | Status | Data Dependencies | Actions | Notes |
|-------|-----------|-------|-------|------------|--------|-------------------|---------|-------|
| `/sales/pipeline` | Pipeline | Sales (Executive, Manager) | TBD | [Link TBD] | Draft | Pipeline data | View pipeline, Track deals | Role-aware: Executives see "My Pipeline" (view=my), Managers see "Team Pipeline" |
| `/sales/leads` | Leads | Sales (Executive, Manager) | TBD | [Link TBD] | Draft | Leads | Create, Filter, Search, View detail | Role-aware: Executives see "My Leads" (view=my), Managers see "Team Leads" |
| `/sales/deals` | Deals | Sales (Executive, Manager) | TBD | [Link TBD] | Draft | Deals | Create, Filter, Search, View detail | Role-aware: Executives see "My Deals" (view=my), Managers see "Team Deals" |
| `/sales/quotations` | Quotations | Sales (Executive, Manager) | TBD | [Link TBD] | Draft | Quotations | Create, Filter, Search, View detail | Role-aware: Executives see "My Quotations" (view=my), Managers see "Team Quotations" |
| `/sales/automation-logs` | Automation Logs | Sales (Executive, Manager) | TBD | [Link TBD] | Draft | Automation logs | View logs, Filter | Role-aware: Executives see "My Automation Logs" (view=my), Managers see "Team Automation Logs" |

## Recruitment Module

| Route | Page Name | Roles | Owner | Figma Link | Status | Data Dependencies | Actions | Notes |
|-------|-----------|-------|-------|------------|--------|-------------------|---------|-------|
| `/recruitment/candidates` | Candidates | HR/Recruitment (Manager) | TBD | [Link TBD] | Draft | Candidates | Create, Filter, Search, View detail | Role-aware: Supports view=my parameter for personal view |
| `/recruitment/job-postings` | Job Postings | HR/Recruitment (Manager) | TBD | [Link TBD] | Draft | Job postings | Create, Filter, Search, View detail | Role-aware: Supports view=my parameter. `/recruitment/job-listings` redirects here |

## Manager Module

| Route | Page Name | Roles | Owner | Figma Link | Status | Data Dependencies | Actions | Notes |
|-------|-----------|-------|-------|------------|--------|-------------------|---------|-------|
| `/manager/attendance` | Team Attendance | Manager, SuperAdmin | TBD | [Link TBD] | Draft | Attendance records | View team attendance, Approve corrections | Unique functionality - kept separate |
| `/manager/performance` | Team Performance | Manager, SuperAdmin | TBD | [Link TBD] | Draft | Performance data | View team metrics, Reviews | Unique functionality - kept separate |
| `/manager/tasks` | Team Tasks | Manager, SuperAdmin | TBD | N/A | Redirect | - | - | **Redirects to `/tasks`** - Tasks page already shows team view for managers |
| `/manager/projects` | Team Projects | Manager, SuperAdmin | TBD | N/A | Redirect | - | - | **Redirects to `/projects`** - Projects page already shows team view for managers |

## Role-Based Filtering

Several pages now support role-based filtering using URL query parameters:

- **Executives**: Access pages with `?view=my` to see personal data (e.g., `/sales/leads?view=my`)
- **Managers**: Access pages without query parameter to see team data (e.g., `/sales/leads`)
- **SuperAdmins**: Can see all data (implementation pending)

### Consolidated Pages

The following duplicate pages have been merged:

- `/sales/my-pipeline` → `/sales/pipeline?view=my`
- `/sales/my-leads` → `/sales/leads?view=my`
- `/sales/my-deals` → `/sales/deals?view=my`
- `/sales/my-quotations` → `/sales/quotations?view=my`
- `/sales/my-automation-logs` → `/sales/automation-logs?view=my`
- `/recruitment/my-candidates` → `/recruitment/candidates?view=my`
- `/recruitment/my-job-postings` → `/recruitment/job-postings?view=my`
- `/recruitment/job-listings` → `/recruitment/job-postings` (redirect)

## Department Dashboards

The following department dashboard pages exist but are currently placeholder pages and not linked in navigation:

| Route | Page Name | Status | Notes |
|-------|-----------|--------|-------|
| `/departments/hr` | HR Dashboard | Draft | Placeholder - not currently in navigation |
| `/departments/sales` | Sales Dashboard | Draft | Placeholder - not currently in navigation |
| `/departments/recruitment` | Recruitment Dashboard | Draft | Placeholder - not currently in navigation |

These pages could be enhanced in the future to serve as department overview dashboards with key metrics and quick links.

## Notes

- All Figma links should be updated as designs are created
- Owner field should be assigned to team member responsible for implementation
- Status should be updated as work progresses through phases
- Data dependencies should list all entities/tables needed for the page
- Role-aware pages use query parameters (`?view=my`) to toggle between personal and team views
- Duplicate pages have been consolidated to reduce maintenance overhead
- Empty directories (`/hr/my-employees`, `/hr/my-onboarding`) have been removed


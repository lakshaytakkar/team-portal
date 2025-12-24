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

## Notes

- All Figma links should be updated as designs are created
- Owner field should be assigned to team member responsible for implementation
- Status should be updated as work progresses through phases
- Data dependencies should list all entities/tables needed for the page


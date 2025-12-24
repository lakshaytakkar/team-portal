# Documentation Index

This directory contains all documentation for the Internal Team Portal project, following a document-first development approach.

## Overview

This project uses a **4-phase AI-first development workflow**:
1. **Phase 1**: UI/Layout shells
2. **Phase 2**: Fix gaps & interactions
3. **Phase 3**: Details & actions
4. **Phase 4**: Microinteractions & bug fixes

## Documentation Structure

### Core Documents

- **[PRD Lite](prd.md)** - Product requirements document (lite version)
  - Context, users, modules, success criteria
  - Non-goals and technical stack

- **[Page Inventory](page-inventory.md)** - Master list of all pages
  - Routes, roles, Figma links, status tracking
  - Data dependencies and actions

- **[Data Model](data-model.md)** - Supabase database schema
  - Tables, relationships, indexes
  - Views, functions, triggers
  - Migration strategy

- **[Permissions](permissions.md)** - Role-based access control
  - Capability matrix
  - RLS policies
  - UI-level permission checks

- **[UX Contracts](ux-contracts.md)** - Design patterns and standards
  - Loading/empty/error states
  - Form patterns, table patterns
  - Navigation, badges, modals
  - Accessibility guidelines

### Page Specifications

Located in `page-specs/` directory:

- **[Template](page-specs/TEMPLATE.md)** - Copy this for new pages
- **[Dashboard](page-specs/dashboard.md)** - Dashboard home page
- **[Projects List](page-specs/projects-list.md)** - Projects listing page
- **[Tasks List](page-specs/tasks-list.md)** - Tasks listing page
- **[Calls List](page-specs/calls-list.md)** - Calls listing page
- **[Attendance](page-specs/attendance.md)** - Attendance page

### Implementation Plans

- **[Phase 1](implementation-phase1.md)** - UI/Layout shells plan
- **[Phase 2](implementation-phase2.md)** - Fix gaps & interactions plan
- **[Phase 3 & 4](implementation-phase3-4.md)** - Details, actions & polish plan

### Development Resources

- **[Prompt Library](prompt-library.md)** - AI prompts for each phase
  - Copy-paste prompts for Cursor
  - Organized by phase and task type
  - Usage instructions

- **[Developer Portal Spec](dev-portal-spec.md)** - `/dev` route specification
  - Page inventory dashboard
  - Figma links hub
  - Prompt library UI
  - Stack grid and credentials

## Quick Start

### For Developers

1. **Read the PRD** (`prd.md`) to understand the project
2. **Check Page Inventory** (`page-inventory.md`) to see what needs to be built
3. **Review Page Specs** (`page-specs/*.md`) for the page you're working on
4. **Use Prompt Library** (`prompt-library.md`) for AI-assisted development
5. **Follow UX Contracts** (`ux-contracts.md`) for consistent patterns

### For Designers

1. **Update Page Inventory** (`page-inventory.md`) with Figma links
2. **Create Page Specs** (`page-specs/*.md`) for new pages
3. **Reference UX Contracts** (`ux-contracts.md`) for design patterns

### For Product Managers

1. **Review PRD** (`prd.md`) for requirements
2. **Check Page Inventory** (`page-inventory.md`) for status
3. **Update Implementation Plans** as needed

## Workflow

### Creating a New Page

1. **Design**: Create Figma design
2. **Document**: Create page spec using template (`page-specs/TEMPLATE.md`)
3. **Update Inventory**: Add to `page-inventory.md`
4. **Implement Phase 1**: Use prompt from `prompt-library.md`
5. **Implement Phase 2**: Add interactions and states
6. **Implement Phase 3**: Add details and actions
7. **Implement Phase 4**: Polish and bug fixes
8. **Update Status**: Mark as "Done" in `page-inventory.md`

### Updating Documentation

- **Page Specs**: Update when requirements change
- **Page Inventory**: Update status as work progresses
- **Data Model**: Update when schema changes
- **Permissions**: Update when access rules change

## Key Concepts

### Roles

- **Executive**: Standard user, focuses on own work
- **Manager**: Can manage team members' work
- **SuperAdmin**: Full system access

### Modules (MVP)

1. **Dashboard**: Central hub
2. **Projects**: Project management
3. **Tasks**: Task management
4. **Calls**: Call tracking
5. **Attendance**: Attendance tracking

### Tech Stack

- **Runtime**: Bun
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + RLS)
- **State**: React Query (TanStack Query)

## File Naming Conventions

- **Page Specs**: `[page-name].md` (e.g., `dashboard.md`, `calls-list.md`)
- **Implementation Plans**: `implementation-phase[N].md`
- **Other Docs**: `[topic].md` (e.g., `prd.md`, `permissions.md`)

## Status Tracking

Pages are tracked in `page-inventory.md` with status:
- **Draft**: Figma design not started
- **Ready**: Figma design complete
- **In Progress**: Currently being built
- **Built**: Phase 1 complete
- **QA**: Ready for testing
- **Done**: Complete through Phase 4

## Contributing

When adding or updating documentation:

1. Follow existing patterns and structure
2. Use clear, concise language
3. Include examples where helpful
4. Update related documents if needed
5. Keep documentation up-to-date with code

## Questions?

Refer to:
- **PRD** for product questions
- **Page Specs** for page-specific questions
- **UX Contracts** for design pattern questions
- **Prompt Library** for development questions


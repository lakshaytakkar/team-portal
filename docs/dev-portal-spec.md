# Developer Portal Specification

The `/dev` route will serve as an internal developer resource portal, accessible to all team members during development. This portal centralizes documentation, prompts, Figma links, and development resources.

## Route

- **Path**: `/dev`
- **Access**: All authenticated users (can be restricted to dev environment only)
- **Layout**: Uses DashboardLayout (same as other dashboard pages)

## Purpose

1. **Centralized Documentation**: Quick access to all project docs
2. **Figma Links Hub**: All design links in one place
3. **Prompt Library**: Copy-paste prompts for AI-assisted development
4. **Stack Reference**: Technology stack logos and versions
5. **Credentials Guide**: Environment variable references (no secrets)
6. **Page Status Tracker**: Visual dashboard of implementation status
7. **Sample Data Controls**: Dev-only tools to reset/seed sample data

## Page Sections

### 1. Header
- **Title**: "Developer Portal"
- **Description**: "Internal development resources and documentation"
- **Breadcrumbs**: Home > Dev

### 2. Quick Stats Cards
- **Total Pages**: Count of pages in inventory
- **Pages Built**: Count of pages with status "Built" or "Done"
- **Pages In Progress**: Count of pages with status "In Progress"
- **Figma Designs Ready**: Count of pages with Figma links

### 3. Page Inventory Dashboard

#### Table View
Columns:
- **Page Name**: Link to page spec
- **Route**: Clickable route (opens in new tab)
- **Status**: Badge (Draft/Ready/In Progress/Built/QA/Done)
- **Figma Link**: External link icon
- **Owner**: Assigned developer
- **Last Updated**: Date

#### Filters
- Filter by status
- Filter by module (Dashboard, Projects, Tasks, Calls, Attendance, Admin)
- Search by page name

#### Actions
- "View Page Spec" button → Opens page spec in new tab
- "View Figma" button → Opens Figma design
- "Mark as Built" button (for quick status updates)

### 4. Figma Links Hub

#### Grouped by Module
- **Dashboard**: Links to dashboard designs
- **Projects**: Links to project-related designs
- **Tasks**: Links to task-related designs
- **Calls**: Links to call-related designs
- **Attendance**: Links to attendance designs
- **Admin**: Links to admin/configuration designs

Each link shows:
- Page name
- Figma icon + link
- Status badge
- Last updated date

### 5. Prompt Library Section

#### Grouped by Phase
- **Phase 1: UI/Layout Shells**
  - Create Page Shell
  - Implement Navigation
  - Create Component from Design System

- **Phase 2: Fix Gaps & Interactions**
  - Add Empty State
  - Add Loading State
  - Add Error Handling
  - Fix Broken Links
  - Add Form Validation
  - Implement Search
  - Implement Filtering

- **Phase 3: Details & Actions**
  - Create Detail Page
  - Implement Create Form
  - Implement Edit Form
  - Implement Delete Action
  - Add Row-Level Actions
  - Implement Status Update

- **Phase 4: Microinteractions & Bug Fixes**
  - Add Loading Skeletons
  - Add Toast Notifications
  - Add Hover Effects
  - Add Keyboard Shortcuts
  - Fix Accessibility Issues
  - Optimize Performance
  - Fix Edge Cases

#### Prompt Card Structure
Each prompt card shows:
- **Title**: Prompt name
- **Phase**: Phase number and name
- **Copy Button**: Copies prompt to clipboard
- **Preview**: Collapsible preview of prompt text
- **Usage**: Brief usage instructions

### 6. Stack Grid

#### Technology Logos
Display logos from `public/logos/*` in a grid:
- **Bun**: Runtime
- **Next.js**: Framework
- **TypeScript**: Language
- **Tailwind CSS**: Styling
- **Supabase**: Database
- **React Query**: State management
- **Lucide React**: Icons

Each logo card shows:
- Logo image
- Technology name
- Version (from package.json)
- Link to documentation

### 7. Credentials Reference

#### Environment Variables
List all required environment variables (no actual values):
- **NEXT_PUBLIC_SUPABASE_URL**: Supabase project URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Supabase anonymous key
- **SUPABASE_SERVICE_ROLE_KEY**: Service role key (server-side only)
- **NEXT_PUBLIC_APP_URL**: Application URL

Each variable shows:
- Variable name
- Description
- Where to configure (e.g., ".env.local", Vercel dashboard)
- Required/Optional
- Example format (no actual secrets)

#### Supabase Setup
- Link to Supabase dashboard
- Instructions for creating project
- RLS policy setup guide link

### 8. Sample Data Controls (Dev Only)

#### Actions
- **Reset Sample Data**: Reloads sample data from `lib/data/*`
- **Seed Projects**: Creates sample projects
- **Seed Tasks**: Creates sample tasks
- **Seed Calls**: Creates sample calls
- **Seed Attendance**: Creates sample attendance records
- **Clear All**: Clears all sample data

#### Warnings
- Show warning banner: "These actions only affect sample data, not production database"
- Require confirmation for destructive actions

### 9. Documentation Links

#### Quick Links
- **PRD**: Link to `docs/prd.md`
- **Page Inventory**: Link to `docs/page-inventory.md`
- **Data Model**: Link to `docs/data-model.md`
- **Permissions**: Link to `docs/permissions.md`
- **UX Contracts**: Link to `docs/ux-contracts.md`
- **Prompt Library**: Link to `docs/prompt-library.md`

Each link opens in new tab and shows:
- Document name
- Brief description
- Last updated date (if available)

### 10. Implementation Status Chart

#### Visual Progress
- Progress bar showing overall completion
- Breakdown by module (Projects: X%, Tasks: Y%, etc.)
- Breakdown by phase (Phase 1: X%, Phase 2: Y%, etc.)

#### Charts (Optional)
- Pie chart: Status distribution
- Bar chart: Pages by module
- Timeline: Recent updates

## Data Sources

### Page Inventory Data
Read from `docs/page-inventory.md` (parse markdown table) or maintain as JSON:
```typescript
// lib/data/dev-portal.ts
export const pageInventory = [
  {
    route: '/',
    name: 'Dashboard Home',
    roles: ['executive', 'manager', 'superadmin'],
    status: 'built',
    figmaLink: 'https://figma.com/...',
    owner: 'Developer Name',
    lastUpdated: '2024-01-15'
  },
  // ...
]
```

### Prompt Library Data
Read from `docs/prompt-library.md` (parse markdown sections) or maintain as JSON:
```typescript
export const prompts = [
  {
    title: 'Create Page Shell',
    phase: 1,
    phaseName: 'UI/Layout Shells',
    content: '...',
    usage: '...'
  },
  // ...
]
```

### Stack Data
Read from `package.json` for versions:
```typescript
export const stack = [
  {
    name: 'Bun',
    logo: '/logos/bun.svg',
    version: '1.x.x',
    docsUrl: 'https://bun.sh/docs'
  },
  // ...
]
```

## Implementation Plan

### Phase 1: Basic Structure
- [ ] Create `/dev` route and page shell
- [ ] Add to sidebar navigation (dev section)
- [ ] Create layout with sections
- [ ] Add quick stats cards

### Phase 2: Core Features
- [ ] Implement page inventory table
- [ ] Add Figma links hub
- [ ] Create prompt library section with copy functionality
- [ ] Add stack grid with logos

### Phase 3: Advanced Features
- [ ] Add credentials reference section
- [ ] Implement sample data controls
- [ ] Add documentation links
- [ ] Create status charts/visualizations

### Phase 4: Polish
- [ ] Add search/filter for page inventory
- [ ] Add keyboard shortcuts
- [ ] Improve responsive design
- [ ] Add loading states
- [ ] Add error handling

## Design Notes

- Use consistent card-based layout
- Match design system colors and spacing
- Use icons from lucide-react
- Make it scannable (clear sections, good spacing)
- Consider dark mode support (future)

## Access Control

- **Development**: Accessible to all authenticated users
- **Production**: Can be restricted to specific roles or disabled
- **Environment Check**: Can check `process.env.NODE_ENV` to show/hide dev tools

## Future Enhancements

- **Git Integration**: Show recent commits, branch info
- **Performance Metrics**: Page load times, bundle sizes
- **Test Coverage**: Link to test reports
- **API Documentation**: Auto-generated API docs
- **Component Library**: Visual component showcase
- **Design Tokens**: Display design system tokens


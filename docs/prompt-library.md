# Prompt Library for AI-Assisted Development

This document contains atomic, reusable prompts for each phase of the AI-first development workflow. Copy these prompts into Cursor when working on specific tasks.

## Phase 1: UI/Layout Shells

### Prompt: Create Page Shell
```
Create a new page at [ROUTE] following our design system. Use the existing layout components from `components/layouts/DashboardLayout.tsx` and UI components from `components/ui/*`. 

Requirements:
- Match the layout structure from [FIGMA_LINK] or similar pages
- Use consistent spacing and typography from `app/globals.css`
- Include proper TypeScript types
- Add placeholder content for data sections
- Ensure responsive design (mobile-friendly)
- Follow Next.js App Router conventions

Reference similar pages:
- [SIMILAR_PAGE_ROUTE] for layout structure
- [SIMILAR_PAGE_ROUTE] for component patterns
```

### Prompt: Implement Navigation
```
Add navigation links and routing for [PAGE_NAME]. Ensure:
- Sidebar menu item is added/updated in `components/layouts/Sidebar.tsx`
- Breadcrumbs work correctly in `components/layouts/Topbar.tsx`
- All internal links use Next.js `Link` component
- Active state is highlighted in sidebar
- Route matches the page spec in `docs/page-specs/[PAGE_SPEC].md`
```

### Prompt: Create Component from Design System
```
Create a reusable component [COMPONENT_NAME] based on the design system. Requirements:
- Use Tailwind classes matching our color palette (see `app/globals.css`)
- Follow existing component patterns from `components/ui/*`
- Include TypeScript props interface
- Make it accessible (keyboard navigation, ARIA labels)
- Support variants if needed (size, color, etc.)
- Add to `components/ui/[component-name].tsx`

Reference existing components:
- [SIMILAR_COMPONENT] for structure
- [SIMILAR_COMPONENT] for styling patterns
```

## Phase 2: Fix Gaps & Interactions

### Prompt: Add Empty State
```
Add empty state component to [PAGE_ROUTE]. Requirements:
- Show when data array is empty or null
- Include icon (use lucide-react icons)
- Display helpful message from page spec
- Show call-to-action button if user has permission to create
- Match empty state patterns from existing pages

Reference: `docs/page-specs/[PAGE_SPEC].md` for empty state requirements
```

### Prompt: Add Loading State
```
Implement loading state for [PAGE_ROUTE]. Requirements:
- Show skeleton loader matching the layout structure
- Disable all interactive elements during loading
- Use React Query's `isLoading` state
- Match loading patterns from [SIMILAR_PAGE]
- Consider using shadcn skeleton component if available
```

### Prompt: Add Error Handling
```
Add error handling to [PAGE_ROUTE]. Requirements:
- Show error message when data fetch fails
- Include retry button
- Use React Query's `error` state
- Display user-friendly error message
- Log error details for debugging
- Match error handling patterns from existing pages
```

### Prompt: Fix Broken Links
```
Audit and fix all broken links on [PAGE_ROUTE]. Requirements:
- Check all `href` and `Link` components
- Ensure routes match actual page routes
- Fix any 404s or incorrect navigation
- Add proper error boundaries if needed
- Test all navigation paths
```

### Prompt: Add Form Validation
```
Add form validation to [FORM_NAME] on [PAGE_ROUTE]. Requirements:
- Validate all required fields
- Show inline error messages
- Prevent submission if validation fails
- Use validation rules from `docs/page-specs/[PAGE_SPEC].md`
- Match validation patterns from existing forms
- Consider using react-hook-form or similar
```

### Prompt: Implement Search Functionality
```
Add search functionality to [PAGE_ROUTE]. Requirements:
- Search input in header/toolbar
- Filter results in real-time (debounced)
- Search across relevant fields (name, description, etc.)
- Show "No results" state
- Clear search button
- Match search patterns from [SIMILAR_PAGE]
```

### Prompt: Implement Filtering
```
Add filtering to [PAGE_ROUTE]. Requirements:
- Filter dropdown/buttons for [FILTER_OPTIONS]
- Update URL params or state when filter changes
- Show active filter indicators
- Clear filters button
- Match filtering patterns from existing pages
- Use filter options from page spec
```

## Phase 3: Details & Actions

### Prompt: Create Detail Page
```
Create detail page for [ENTITY] at [ROUTE]/[id]. Requirements:
- Fetch data by ID (use sample data for now)
- Display all fields from entity type
- Show related data (e.g., project tasks, call outcomes)
- Include edit/delete actions if user has permission
- Add breadcrumb navigation
- Match detail page patterns from [SIMILAR_DETAIL_PAGE]

Reference: `docs/page-specs/[DETAIL_PAGE_SPEC].md`
```

### Prompt: Implement Create Form
```
Create form for adding new [ENTITY] on [PAGE_ROUTE]. Requirements:
- Modal or separate page (specify which)
- Include all fields from `docs/page-specs/[PAGE_SPEC].md`
- Form validation (required fields, formats)
- Submit handler (use sample data mutation for now)
- Success toast notification
- Redirect or refresh list on success
- Match form patterns from existing forms
```

### Prompt: Implement Edit Form
```
Add edit functionality for [ENTITY] on [DETAIL_PAGE_ROUTE]. Requirements:
- Pre-fill form with existing data
- Update handler (use sample data mutation for now)
- Optimistic UI update
- Success toast notification
- Handle errors gracefully
- Match edit patterns from existing pages
```

### Prompt: Implement Delete Action
```
Add delete functionality for [ENTITY]. Requirements:
- Delete button in row menu or detail page
- Confirmation dialog before deletion
- Delete handler (use sample data mutation for now)
- Optimistic UI update
- Success toast notification
- Redirect or refresh list on success
- Match delete patterns from existing pages
```

### Prompt: Add Row-Level Actions
```
Add row-level actions menu to [TABLE/LIST] on [PAGE_ROUTE]. Requirements:
- Actions dropdown (use MoreVertical icon)
- Include: View, Edit, Delete (based on permissions)
- Show actions based on user role (check `docs/permissions.md`)
- Use existing dropdown/menu component patterns
- Handle click events properly (prevent navigation when clicking menu)
```

### Prompt: Implement Status Update
```
Add quick status update functionality for [ENTITY]. Requirements:
- Status badge/dropdown in table row
- Update on change (optimistic UI)
- Show loading state during update
- Success/error toast
- Match status update patterns from existing pages
- Use status options from entity type definition
```

## Phase 4: Microinteractions & Bug Fixes

### Prompt: Add Loading Skeletons
```
Replace loading spinners with skeleton loaders on [PAGE_ROUTE]. Requirements:
- Match exact layout structure
- Use shadcn skeleton component or custom skeletons
- Show placeholders for all content areas
- Smooth fade-in when data loads
- Match skeleton patterns from existing pages
```

### Prompt: Add Toast Notifications
```
Add toast notifications for [ACTIONS] on [PAGE_ROUTE]. Requirements:
- Success toast on create/update/delete
- Error toast on failures
- Use shadcn toast component or similar
- Appropriate icons and colors
- Auto-dismiss after 3-5 seconds
- Match toast patterns from existing pages
```

### Prompt: Add Hover Effects
```
Add hover effects and transitions to [COMPONENT/PAGE]. Requirements:
- Smooth color transitions on buttons/cards
- Scale/transform effects on interactive elements
- Use Tailwind transition classes
- Match hover patterns from existing components
- Ensure accessibility (not required for functionality)
```

### Prompt: Add Keyboard Shortcuts
```
Add keyboard shortcuts to [PAGE_ROUTE]. Requirements:
- [SHORTCUT]: [ACTION] (e.g., Ctrl+K for search, Enter to submit)
- Show shortcuts in tooltip or help menu
- Prevent conflicts with browser shortcuts
- Use `useEffect` with keyboard event listeners
- Match keyboard shortcut patterns from existing pages
```

### Prompt: Fix Accessibility Issues
```
Audit and fix accessibility issues on [PAGE_ROUTE]. Requirements:
- Add ARIA labels to interactive elements
- Ensure keyboard navigation works
- Check color contrast ratios
- Add focus indicators
- Test with screen reader
- Match accessibility patterns from existing pages
```

### Prompt: Optimize Performance
```
Optimize performance for [PAGE_ROUTE]. Requirements:
- Add React.memo where appropriate
- Debounce search/filter inputs
- Lazy load heavy components
- Optimize re-renders
- Check React DevTools Profiler
- Match performance patterns from existing pages
```

### Prompt: Fix Edge Cases
```
Fix edge cases and bugs on [PAGE_ROUTE]. Requirements:
- Handle null/undefined data gracefully
- Fix date formatting edge cases
- Handle empty arrays properly
- Fix pagination edge cases
- Handle network errors
- Test with various data scenarios
- Reference bug reports or issues
```

## General Prompts

### Prompt: Refactor Component
```
Refactor [COMPONENT_NAME] to improve code quality. Requirements:
- Extract reusable logic into hooks
- Break down into smaller components if needed
- Improve TypeScript types
- Add proper error handling
- Improve readability and maintainability
- Keep functionality identical
```

### Prompt: Update Types
```
Update TypeScript types for [ENTITY] to match the data model in `docs/data-model.md`. Requirements:
- Add new fields
- Update field types
- Ensure types match Supabase schema (when implemented)
- Update all usages of the type
- Add JSDoc comments for complex types
```

### Prompt: Add Sample Data
```
Add sample data for [ENTITY] in `lib/data/[entity].ts`. Requirements:
- Create realistic sample data
- Match the TypeScript interface
- Include various statuses/priorities
- Add relationships (e.g., tasks linked to projects)
- Use consistent IDs and dates
- Reference existing sample data files for patterns
```

## Usage Instructions

1. Copy the relevant prompt for your current phase/task
2. Replace placeholders in brackets `[PLACEHOLDER]` with actual values:
   - `[ROUTE]` → actual route (e.g., `/calls`)
   - `[PAGE_NAME]` → page name (e.g., "Calls List")
   - `[FIGMA_LINK]` → Figma design link
   - `[ENTITY]` → entity name (e.g., "Call", "Task", "Project")
   - `[PAGE_SPEC]` → page spec filename (e.g., `calls-list.md`)
3. Add any additional context or requirements
4. Paste into Cursor and execute

## Prompt Best Practices

- Be specific about file paths and component names
- Reference existing code patterns when possible
- Include acceptance criteria
- Mention related documentation files
- Specify which phase you're in
- Include error handling requirements


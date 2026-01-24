export interface Prompt {
  id: string
  title: string
  phase: 1 | 2 | 3 | 4
  phaseName: string
  content: string
  usage: string
  category?: string
}

export const prompts: Prompt[] = [
  {
    id: "prompt-1-1",
    title: "Create Page Shell",
    phase: 1,
    phaseName: "UI/Layout Shells",
    category: "Page Creation",
    content: `Create a new page at [ROUTE] following our design system. Use the existing layout components from \`components/layouts/DashboardLayout.tsx\` and UI components from \`components/ui/*\`. 

Requirements:
- Match the layout structure from [FIGMA_LINK] or similar pages
- Use consistent spacing and typography from \`app/globals.css\`
- Include proper TypeScript types
- Add placeholder content for data sections
- Ensure responsive design (mobile-friendly)
- Follow Next.js App Router conventions

Reference similar pages:
- [SIMILAR_PAGE_ROUTE] for layout structure
- [SIMILAR_PAGE_ROUTE] for component patterns`,
    usage: "Replace [ROUTE], [FIGMA_LINK], and [SIMILAR_PAGE_ROUTE] placeholders with actual values",
  },
  {
    id: "prompt-1-2",
    title: "Implement Navigation",
    phase: 1,
    phaseName: "UI/Layout Shells",
    category: "Navigation",
    content: `Add navigation links and routing for [PAGE_NAME]. Ensure:
- Sidebar menu item is added/updated in \`components/layouts/Sidebar.tsx\`
- Breadcrumbs work correctly in \`components/layouts/Topbar.tsx\`
- All internal links use Next.js \`Link\` component
- Active state is highlighted in sidebar
- Route matches the page spec in \`docs/page-specs/[PAGE_SPEC].md\``,
    usage: "Replace [PAGE_NAME] and [PAGE_SPEC] with actual values",
  },
  {
    id: "prompt-2-1",
    title: "Add Empty State",
    phase: 2,
    phaseName: "Fix Gaps & Interactions",
    category: "States",
    content: `Add empty state component to [PAGE_ROUTE]. Requirements:
- Show when data array is empty or null
- Include icon (use lucide-react icons)
- Display helpful message from page spec
- Show call-to-action button if user has permission to create
- Match empty state patterns from existing pages

Reference: \`docs/page-specs/[PAGE_SPEC].md\` for empty state requirements`,
    usage: "Replace [PAGE_ROUTE] and [PAGE_SPEC] with actual values",
  },
  {
    id: "prompt-2-2",
    title: "Add Loading State",
    phase: 2,
    phaseName: "Fix Gaps & Interactions",
    category: "States",
    content: `Implement loading state for [PAGE_ROUTE]. Requirements:
- Show skeleton loader matching the layout structure
- Disable all interactive elements during loading
- Use React Query's \`isLoading\` state
- Match loading patterns from [SIMILAR_PAGE]
- Consider using shadcn skeleton component if available`,
    usage: "Replace [PAGE_ROUTE] and [SIMILAR_PAGE] with actual values",
  },
  {
    id: "prompt-3-1",
    title: "Create Detail Page",
    phase: 3,
    phaseName: "Details & Actions",
    category: "Pages",
    content: `Create detail page for [ENTITY] at [ROUTE]/[id]. Requirements:
- Fetch data by ID (use sample data for now)
- Display all fields from entity type
- Show related data (e.g., project tasks, call outcomes)
- Include edit/delete actions if user has permission
- Add breadcrumb navigation
- Match detail page patterns from [SIMILAR_DETAIL_PAGE]

Reference: \`docs/page-specs/[DETAIL_PAGE_SPEC].md\``,
    usage: "Replace [ENTITY], [ROUTE], [SIMILAR_DETAIL_PAGE], and [DETAIL_PAGE_SPEC] with actual values",
  },
  {
    id: "prompt-4-1",
    title: "Add Loading Skeletons",
    phase: 4,
    phaseName: "Microinteractions & Bug Fixes",
    category: "Polish",
    content: `Replace loading spinners with skeleton loaders on [PAGE_ROUTE]. Requirements:
- Match exact layout structure
- Use shadcn skeleton component or custom skeletons
- Show placeholders for all content areas
- Smooth fade-in when data loads
- Match skeleton patterns from existing pages`,
    usage: "Replace [PAGE_ROUTE] with actual route",
  },
]


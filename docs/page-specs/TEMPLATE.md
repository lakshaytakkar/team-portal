# Page Spec Template

Use this template for each page in the portal. Copy this file and rename it to match the route (e.g., `projects-list.md`, `task-detail.md`).

## Page Information

- **Route**: `/example`
- **Page Name**: Example Page
- **Roles**: Executive, Manager, SuperAdmin
- **Purpose**: Brief description of what this page does

## Layout Sections

### Header
- Title: "Example Page"
- Breadcrumbs: Home > Section > Example Page
- Actions: [List top-level actions here]

### Main Content
- Section 1: [Description]
- Section 2: [Description]

### Footer/Sidebar
- [Any additional sections]

## Data Requirements

### Entities Needed
- `entity1`: [Description]
- `entity2`: [Description]

### API Endpoints (Future)
- `GET /api/example`: Fetch list
- `POST /api/example`: Create new
- `PUT /api/example/[id]`: Update
- `DELETE /api/example/[id]`: Delete

### Sample Data Structure
```typescript
interface ExampleData {
  id: string
  name: string
  // ... other fields
}
```

## Top-Level Actions

| Action | Button/Link Location | Roles | Description | Validation |
|--------|---------------------|-------|-------------|------------|
| Create New | Header button | Manager, SuperAdmin | Opens create modal/form | - |
| Filter | Top bar | All | Opens filter dropdown | - |
| Search | Top bar | All | Search input | Min 2 chars |

## Row-Level Actions

| Action | Location | Roles | Description | Validation |
|--------|----------|-------|-------------|------------|
| Edit | Row menu | Manager, SuperAdmin | Opens edit form | - |
| Delete | Row menu | SuperAdmin | Deletes item | Confirmation required |
| View Detail | Row click | All | Navigate to detail page | - |

## Form Fields (if applicable)

| Field | Label | Type | Required | Default | Validation | Permissions |
|-------|-------|------|----------|---------|------------|-------------|
| name | Name | text | Yes | - | Min 3 chars, max 100 | All |
| status | Status | select | Yes | "active" | Must be valid enum | Manager+ |
| assignedTo | Assigned To | select | No | Current user | Must be valid user ID | Manager+ |

## States

### Loading State
- Show skeleton loader matching layout
- Disable all actions
- Show "Loading..." message

### Empty State
- Icon: [Icon name]
- Title: "No items yet"
- Description: "Get started by creating your first item"
- Action: "Create New" button (if user has permission)

### Error State
- Show error message: "Failed to load data. Please try again."
- Retry button
- Contact support link (optional)

### Success State
- Toast notification: "Item created successfully"
- Redirect or refresh list

## Permissions & Access Control

### View Access
- **Executive**: Can view own items only
- **Manager**: Can view team items + own items
- **SuperAdmin**: Can view all items

### Create Access
- **Executive**: No (unless specified)
- **Manager**: Yes
- **SuperAdmin**: Yes

### Edit Access
- **Executive**: Own items only
- **Manager**: Team items + own items
- **SuperAdmin**: All items

### Delete Access
- **Executive**: No
- **Manager**: No (unless specified)
- **SuperAdmin**: Yes

## Navigation

### From This Page
- Click item → `/example/[id]` (detail page)
- Click "Create" → `/example/new` (create page)

### To This Page
- From Dashboard → Click "View All" widget
- From Sidebar → Click "Example" menu item

## Analytics Events (Optional)

- `page_view`: When page loads
- `create_clicked`: When create button clicked
- `item_clicked`: When item row clicked
- `filter_applied`: When filter is applied

## Design Notes

- Use existing UI components from `components/ui/*`
- Follow design system colors and spacing
- Ensure responsive design (mobile-friendly)
- Accessibility: Keyboard navigation, ARIA labels

## Implementation Checklist

- [ ] Phase 1: Create page shell with layout
- [ ] Phase 1: Add navigation/routing
- [ ] Phase 2: Implement data fetching (sample data)
- [ ] Phase 2: Add empty/loading/error states
- [ ] Phase 2: Fix broken links and interactions
- [ ] Phase 3: Implement detail page
- [ ] Phase 3: Add row-level actions
- [ ] Phase 3: Add top-level actions
- [ ] Phase 4: Add microinteractions
- [ ] Phase 4: Bug fixes and polish
- [ ] Phase 4: Accessibility audit


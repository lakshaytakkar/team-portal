# Actions, Filters, and Exports Integration Guide

This guide explains how to integrate row-level actions, topbar actions, filters, sorting, and exports into any page in the HR Portal.

## Overview

All page implementations follow a consistent pattern:

1. **Import required utilities and components**
2. **Use the `usePageActions` hook** for actions and filters
3. **Integrate `TopbarActions` component** for page-level actions
4. **Integrate `RowActionsMenu` component** for entity-level actions
5. **Integrate `FilterPanel` component** for filtering
6. **Integrate `ExportButton` component** for data export
7. **Apply filtering and sorting logic** to data

## Step-by-Step Integration

### 1. Import Required Components and Utilities

```typescript
import { usePageActions } from '@/lib/hooks/usePageActions'
import { TopbarActions } from '@/components/actions/TopbarActions'
import { RowActionsMenu } from '@/components/actions/RowActionsMenu'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { ExportButton } from '@/components/exports/ExportButton'
import { exportToCSV, projectColumns } from '@/lib/utils/exports'
import { useUser } from '@/lib/hooks/useUser'
import { useMemo, useState } from 'react'
```

### 2. Set Up Page Actions Hook

```typescript
export default function YourPage() {
  const { user } = useUser()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  
  const {
    filters,
    availableFilters,
    handleFilterChange,
    clearFilters,
    sortConfig,
    handleSortChange,
    topbarActions,
    getActionsForEntity,
    userRole,
    currentUserId,
  } = usePageActions({
    entityType: 'project', // or 'task', 'call', 'attendance', etc.
    onAction: (actionId, entity) => {
      if (actionId === 'create-project') {
        setIsDrawerOpen(true)
      } else if (actionId === 'edit' && entity) {
        setSelectedProject(entity)
        setIsDrawerOpen(true)
      } else if (actionId === 'delete' && entity) {
        // Handle delete
      }
      // ... handle other actions
    },
    onFilterChange: (newFilters) => {
      // Filters are automatically stored in state
      // Apply filters to your data query
    },
    hasSelectedItems: selectedItems.length > 0,
  })
```

### 3. Apply Filters and Sorting to Data

```typescript
const filteredAndSortedData = useMemo(() => {
  let result = data || []

  // Apply filters
  if (filters.status && Array.isArray(filters.status)) {
    result = result.filter(item => filters.status.includes(item.status))
  }
  
  if (filters.priority && Array.isArray(filters.priority)) {
    result = result.filter(item => filters.priority.includes(item.priority))
  }
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    result = result.filter(item =>
      item.name.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower)
    )
  }
  
  if (filters.startDate && filters.startDate.from) {
    result = result.filter(item => {
      const itemDate = new Date(item.startDate)
      return itemDate >= filters.startDate.from!
    })
  }

  // Apply sorting
  if (sortConfig) {
    result = [...result].sort((a, b) => {
      const aVal = a[sortConfig.field]
      const bVal = b[sortConfig.field]
      const modifier = sortConfig.direction === 'asc' ? 1 : -1
      
      if (aVal < bVal) return -1 * modifier
      if (aVal > bVal) return 1 * modifier
      return 0
    })
  }

  return result
}, [data, filters, sortConfig])
```

### 4. Integrate Topbar Actions

Replace your existing action buttons with:

```typescript
<div className="flex items-center justify-between">
  <h1 className="text-xl font-semibold">Your Page Title</h1>
  <TopbarActions
    primary={topbarActions.primary}
    secondary={topbarActions.secondary}
  />
</div>
```

### 5. Integrate Filter Panel

Add the filter panel above your data display:

```typescript
<FilterPanel
  filters={availableFilters}
  values={filters}
  onChange={handleFilterChange}
  onClear={clearFilters}
  collapsible={true}
  defaultOpen={false}
/>
```

### 6. Integrate Row Actions Menu

In your entity cards/rows, add the actions menu:

```typescript
function EntityCard({ entity }: { entity: YourEntityType }) {
  const actions = getActionsForEntity(entity)
  
  return (
    <Card>
      {/* Your card content */}
      <RowActionsMenu
        actions={actions}
        entityName={entity.name}
      />
    </Card>
  )
}
```

### 7. Integrate Export Button

Add export button to secondary actions or in the filter panel area:

```typescript
<ExportButton
  data={filteredAndSortedData}
  columns={projectColumns} // or taskColumns, callColumns, etc.
  filename="projects"
  userRole={userRole}
  page={pathname}
  variant="outline"
  size="icon"
/>
```

Or integrate it into the TopbarActions by adding it to secondary actions manually:

```typescript
const exportAction = {
  id: 'export',
  type: 'export' as const,
  label: 'Export to CSV',
  onClick: async () => {
    await exportToCSV(
      filteredAndSortedData,
      projectColumns,
      generateExportFilename(pathname, 'projects')
    )
  },
}
```

## Page-Specific Examples

### Projects Page

- **Entity Type**: `'project'`
- **Columns**: `projectColumns` from `@/lib/utils/exports`
- **Filters**: Status, Priority, Owner, Date Range, Search
- **Sort Options**: Name, Status, Priority, Due Date, Progress, Created Date

### Tasks Page

- **Entity Type**: `'task'`
- **Columns**: `taskColumns` from `@/lib/utils/exports`
- **Filters**: Status, Priority, Assigned To, Project, Due Date Range, Search
- **Sort Options**: Name, Status, Priority, Due Date, Assigned To, Last Updated

### Calls Page

- **Entity Type**: `'call'`
- **Columns**: `callColumns` from `@/lib/utils/exports`
- **Filters**: Status, Outcome, Assigned To, Date Range, Company, Search
- **Sort Options**: Date/Time, Status, Outcome, Contact Name, Company

### Attendance Page

- **Entity Type**: `'attendance'`
- **Columns**: `attendanceColumns` from `@/lib/utils/exports`
- **Filters**: Date Range (required), Status, User, Department, Search
- **Sort Options**: Date, User Name, Status, Check In Time

## Common Patterns

### Handling Create Actions

```typescript
onAction: (actionId, entity) => {
  if (actionId === 'create-project') {
    setIsDrawerOpen(true)
    setSelectedProject(null) // Clear selection for create
  }
}
```

### Handling Edit Actions

```typescript
onAction: (actionId, entity) => {
  if (actionId === 'edit' && entity) {
    setSelectedProject(entity)
    setIsDrawerOpen(true)
  }
}
```

### Handling Delete Actions

Delete actions with confirmation are handled automatically by `RowActionsMenu` component, but you need to implement the actual delete:

```typescript
onAction: async (actionId, entity) => {
  if (actionId === 'delete' && entity) {
    // Delete is confirmed by RowActionsMenu
    try {
      await deleteEntity(entity.id)
      toast.success('Entity deleted successfully')
      refetch()
    } catch (error) {
      toast.error('Failed to delete entity')
    }
  }
}
```

### Custom Action Handlers

For actions that need custom logic:

```typescript
// In usePageActions hook usage
onAction: (actionId, entity) => {
  if (actionId === 'custom-action' && entity) {
    // Your custom logic here
  }
}

// Or override actions after getting them
const customActions = getActionsForEntity(entity).map(action => {
  if (action.id === 'custom-action') {
    return {
      ...action,
      onClick: async () => {
        // Custom implementation
        await customActionHandler(entity)
        action.onClick()
      },
    }
  }
  return action
})
```

## Testing

1. **Test permission-based visibility**: Verify actions/filters show/hide based on user role
2. **Test filter combinations**: Ensure multiple filters work together
3. **Test sorting**: Verify all sort options work correctly
4. **Test exports**: Verify CSV exports contain correct data
5. **Test actions**: Verify all row-level and topbar actions work correctly

## Notes

- All permission checks are handled automatically by the utility functions
- Filter state is managed by the `usePageActions` hook
- Export functionality respects current filters and sorting
- Row actions are contextual based on entity ownership and user role
- Topbar actions are contextual based on page and user role


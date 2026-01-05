# Faire Wholesale Multi-Store Manager - Improvement Plan

## Executive Summary

This plan transforms the Faire Wholesale section from basic CRUD pages into a comprehensive multi-store management platform with a dashboard, improved UX, pagination, and better interconnectivity.

---

## Phase 1: Dashboard & Navigation (Priority: HIGH)

### 1.1 Create Main Dashboard Page
**Location:** `app/(dashboard)/faire-wholesale/page.tsx` (currently redirects, make it the dashboard)

**KPI Cards (4-column responsive grid):**
| Card | Icon | Color | Data |
|------|------|-------|------|
| Total Orders | ShoppingCart | Primary | Count this month |
| Revenue | DollarSign | Green | Sum this month |
| Pending Shipments | Truck | Yellow | Orders awaiting shipment |
| Low Stock Alerts | AlertTriangle | Red | Products below threshold |

**Sections:**
1. **Store Selector** - Dropdown to filter all dashboard data by store (or "All Stores")
2. **Orders by State** - Horizontal progress bars showing NEW, PROCESSING, IN_TRANSIT, DELIVERED, CANCELED
3. **Products by Status** - FOR_SALE vs SALES_PAUSED vs DISCONTINUED breakdown
4. **Quick Actions** - Buttons: View Orders, View Products, Sync All Stores, Export Data
5. **Recent Orders** - Last 5 orders with status badges and quick links
6. **Store Performance** - Mini cards for each store showing orders/revenue this month

### 1.2 Update Sidebar Navigation
Add dashboard as first item, reorganize:
```
Faire Wholesale
├── Dashboard (NEW)
├── Orders
├── Products
├── Shipments
├── Retailers
├── Stores
└── Suppliers
```

---

## Phase 2: Pagination & Data Tables (Priority: CRITICAL)

### 2.1 Implement Server-Side Pagination
**Affected files:**
- `lib/actions/faire.ts` - Add pagination params to all list functions
- All list pages in `faire-wholesale/*/page.tsx`

**Pattern to implement:**
```typescript
interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
```

**Functions to update:**
- `getFaireOrders()` → Add limit/offset to Supabase query
- `getFaireProducts()` → Add limit/offset
- `getFaireRetailers()` → Add limit/offset
- `getFaireSuppliers()` → Add limit/offset
- `getFaireShipments()` → Add limit/offset

### 2.2 Add TanStack React Table
**Implementation per page:**
- Use `useReactTable` with `getPaginationRowModel()`
- Default page size: 25 items
- Page size options: [10, 25, 50, 100]
- Show "Showing X to Y of Z results"

### 2.3 Add Column Sorting
**Sortable columns per page:**
| Page | Sortable Columns |
|------|------------------|
| Orders | Date, Display ID, Store, Customer, Total, State |
| Products | Name, Store, Supplier, Sale State, Stock |
| Retailers | Name, Orders Count, Revenue, Last Order |
| Suppliers | Name, Store, Status, Products Count |
| Shipments | Ship Date, Carrier, Status, Order |

---

## Phase 3: Filter Improvements (Priority: HIGH)

### 3.1 URL-Based Filter Persistence
**Pattern:**
```typescript
// Use Next.js useSearchParams
const searchParams = useSearchParams()
const router = useRouter()

const updateFilters = (key: string, value: string) => {
  const params = new URLSearchParams(searchParams)
  if (value === 'all') params.delete(key)
  else params.set(key, value)
  router.push(`?${params.toString()}`)
}
```

**Filters to persist:**
- `storeId` - Selected store
- `state` - Order/product state
- `q` - Search query
- `page` - Current page
- `sort` - Sort column
- `order` - Sort direction

### 3.2 Advanced Filters
**Orders page additions:**
- Date range picker (from/to)
- Retailer filter (connect from retailers page)
- Revenue range (min/max)

**Products page additions:**
- Stock level filter (in stock, low stock, out of stock)
- Supplier filter
- Price range

### 3.3 Saved Filter Presets
- "My Filters" dropdown with common presets
- Save current filter as preset
- Store in localStorage or user preferences

---

## Phase 4: Interconnectivity (Priority: HIGH)

### 4.1 Cross-Page Links
| From | To | Implementation |
|------|-----|----------------|
| Order Items | Product Detail | Add `productId` link in OrderItemsTable |
| Order Detail | Retailer Page | Link retailer name (create retailer detail page) |
| Retailers List | Orders (filtered) | Fix `?retailerId` filter on orders page |
| Products List | Supplier Detail | Link supplier name in table |
| Supplier Detail | Products (filtered) | Already exists, verify working |
| Shipments | Carrier Website | Add external link using `trackingUrl` |

### 4.2 Create Retailer Detail Page
**Location:** `app/(dashboard)/faire-wholesale/retailers/[id]/page.tsx`

**Sections:**
- Retailer info (name, location, contact)
- Order history table (filtered to this retailer)
- Revenue stats (total, this month, average order)
- First/last order dates

### 4.3 Breadcrumb Navigation
Add breadcrumbs to all detail pages:
```
Faire Wholesale > Orders > #ORD-12345
Faire Wholesale > Products > Widget Pro
Faire Wholesale > Retailers > ABC Store
```

---

## Phase 5: Layout & Styling Fixes (Priority: MEDIUM)

### 5.1 Responsive Grid Fixes
**KPI Cards:**
```tsx
// Current (broken on tablet)
className="grid grid-cols-1 md:grid-cols-5 gap-4"

// Fixed
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4"
```

### 5.2 Filter Toolbar Responsiveness
```tsx
// Wrap filters on mobile
<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
  <Input className="w-full sm:w-64" />
  <div className="flex gap-2 w-full sm:w-auto">
    <Select className="flex-1 sm:w-40" />
    <Select className="flex-1 sm:w-40" />
  </div>
</div>
```

### 5.3 Consistent Card Styling
- All cards: `rounded-[14px] border border-border`
- KPI card height: `min-h-[100px]`
- Card padding: `p-4` for KPIs, `p-5` for content cards
- Gap between cards: `gap-4`

### 5.4 Text Truncation with Tooltips
```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="truncate max-w-[200px]">{text}</span>
    </TooltipTrigger>
    <TooltipContent>{text}</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## Phase 6: Multi-Store Features (Priority: MEDIUM)

### 6.1 Global Store Selector
- Add store selector to dashboard header
- Remember last selected store in localStorage
- "All Stores" option for aggregate views
- Store badges on all list items

### 6.2 Store Comparison View
**New page:** `app/(dashboard)/faire-wholesale/compare/page.tsx`
- Side-by-side store metrics
- Revenue comparison chart
- Order volume comparison
- Top products per store

### 6.3 Store Health Indicators
Add to stores list and dashboard:
- Sync status (last synced, errors)
- Token expiration warning
- Low stock alerts per store
- Pending orders count

---

## Phase 7: Data Export & Bulk Actions (Priority: MEDIUM)

### 7.1 Export Functionality
**Export formats:** CSV, Excel (xlsx)
**Exportable data:**
- Orders list (with items)
- Products list (with variants)
- Retailers list
- Revenue reports

### 7.2 Bulk Actions
**Orders:**
- Select multiple → Export selected
- Select multiple → Mark as shipped (future)

**Products:**
- Select multiple → Update sale state
- Select multiple → Export selected

### 7.3 Sync Actions
- "Sync Now" button per store (enable it!)
- "Sync All Stores" on dashboard
- Show sync progress indicator
- Display last sync time prominently

---

## Phase 8: Performance & Polish (Priority: LOW)

### 8.1 Loading States
- Skeleton loaders matching content layout
- Progressive loading for large tables
- Optimistic updates for mutations

### 8.2 Error Handling
- Graceful error states per section
- Retry buttons on failed queries
- Toast notifications for actions

### 8.3 Empty States
- Contextual messages based on filters
- "Add" or "Sync" CTAs in empty states
- Helpful illustrations

---

## Implementation Order

### Sprint 1 (Week 1-2): Foundation
1. Dashboard page with KPIs
2. Server-side pagination for all list pages
3. URL-based filter persistence

### Sprint 2 (Week 3-4): Data Tables
4. TanStack React Table integration
5. Column sorting
6. Advanced filters (date range, etc.)

### Sprint 3 (Week 5-6): Interconnectivity
7. Cross-page links (order items → products)
8. Retailer detail page
9. Breadcrumb navigation

### Sprint 4 (Week 7-8): Multi-Store & Polish
10. Global store selector
11. Store comparison view
12. Export functionality
13. Responsive fixes
14. Loading/error states

---

## Files to Create

| File | Purpose |
|------|---------|
| `app/(dashboard)/faire-wholesale/page.tsx` | Dashboard (replace redirect) |
| `app/(dashboard)/faire-wholesale/compare/page.tsx` | Store comparison |
| `app/(dashboard)/faire-wholesale/retailers/[id]/page.tsx` | Retailer detail |
| `components/faire/DashboardKPIs.tsx` | KPI cards component |
| `components/faire/OrdersByStateChart.tsx` | Status distribution |
| `components/faire/StoreSelector.tsx` | Global store picker |
| `components/faire/ExportButton.tsx` | Export functionality |
| `components/ui/data-table-pagination.tsx` | Reusable pagination |
| `lib/hooks/usePagination.ts` | Pagination hook |
| `lib/hooks/useUrlFilters.ts` | URL filter sync hook |

## Files to Modify

| File | Changes |
|------|---------|
| `lib/actions/faire.ts` | Add pagination to all list functions |
| `lib/types/faire.ts` | Add PaginationParams, PaginatedResponse types |
| `app/(dashboard)/faire-wholesale/orders/page.tsx` | Pagination, sorting, retailer filter |
| `app/(dashboard)/faire-wholesale/products/page.tsx` | Pagination, sorting, stock filter |
| `app/(dashboard)/faire-wholesale/retailers/page.tsx` | Pagination, sorting, link to orders |
| `app/(dashboard)/faire-wholesale/suppliers/page.tsx` | Pagination, sorting |
| `app/(dashboard)/faire-wholesale/shipments/page.tsx` | Pagination, full sorting |
| `app/(dashboard)/faire-wholesale/stores/page.tsx` | Enable sync button, health indicators |
| `lib/utils/sidebar-config.ts` | Add Dashboard to navigation |

---

## Estimated Effort

| Phase | Effort | Priority |
|-------|--------|----------|
| Phase 1: Dashboard | 8-12 hours | HIGH |
| Phase 2: Pagination | 12-16 hours | CRITICAL |
| Phase 3: Filters | 6-8 hours | HIGH |
| Phase 4: Interconnectivity | 8-10 hours | HIGH |
| Phase 5: Layout Fixes | 4-6 hours | MEDIUM |
| Phase 6: Multi-Store | 8-12 hours | MEDIUM |
| Phase 7: Export/Bulk | 6-8 hours | MEDIUM |
| Phase 8: Polish | 4-6 hours | LOW |

**Total: 56-78 hours**

---

## Success Metrics

1. **Performance:** Pages load in <2s with 10,000+ records
2. **Usability:** All filters persist across page reloads
3. **Navigation:** Can reach any related item in ≤2 clicks
4. **Mobile:** All pages usable on 375px width screens
5. **Data:** Dashboard shows real-time store health

# Calls List Page Spec

## Page Information

- **Route**: `/calls`
- **Page Name**: Calls List
- **Roles**: Executive, Manager, SuperAdmin
- **Purpose**: View and manage sales/outreach calls. Executives see "My Calls", Managers see team calls, SuperAdmin sees all.

## Layout Sections

### Header
- Title: "My Calls" (Executive) / "Team Calls" (Manager) / "All Calls" (SuperAdmin)
- Breadcrumbs: Home > Calls
- Actions: "New Call" button (top right)

### Main Content
- **Filters Bar**: Status, Date range, Assigned to (Manager+)
- **Search Bar**: Search by contact name, company, notes
- **Calls Table/List**: 
  - Columns: Date/Time, Contact, Company, Outcome, Next Action, Assigned To, Status
  - Sortable by date, status
  - Pagination or infinite scroll

## Data Requirements

### Entities Needed
- `calls`: Call records
- `users`: For assigned_to field
- `contacts`: (Future - for now, just text fields)

### Sample Data Structure
```typescript
interface Call {
  id: string
  date: string // ISO date
  time: string // HH:mm format
  contactName: string
  company?: string
  phone?: string
  email?: string
  outcome: CallOutcome
  notes?: string
  nextAction?: string
  nextActionDate?: string
  assignedTo: User
  status: CallStatus
  createdAt: string
  updatedAt: string
}

type CallOutcome = "connected" | "voicemail" | "no-answer" | "busy" | "callback-requested" | "not-interested" | "interested" | "meeting-scheduled"
type CallStatus = "scheduled" | "completed" | "cancelled" | "rescheduled"
```

## Top-Level Actions

| Action | Button/Link Location | Roles | Description | Validation |
|--------|---------------------|-------|-------------|------------|
| New Call | Header button | All | Opens create call modal/form | - |
| Filter | Filter bar | All | Apply filters | - |
| Search | Search bar | All | Search calls | Min 2 chars |
| Export | Actions menu | Manager, SuperAdmin | Export to CSV | - |

## Row-Level Actions

| Action | Location | Roles | Description | Validation |
|--------|----------|-------|-------------|------------|
| View Detail | Row click | All | Navigate to `/calls/[id]` | - |
| Edit | Row menu | All (own calls) / Manager+ (team calls) | Opens edit form | - |
| Delete | Row menu | All (own calls) / Manager+ (team calls) | Deletes call | Confirmation required |
| Log Outcome | Quick action | All | Quick outcome update | - |
| Schedule Follow-up | Quick action | All | Set next action date | - |

## Form Fields (Create/Edit Call)

| Field | Label | Type | Required | Default | Validation | Permissions |
|-------|-------|------|----------|---------|------------|-------------|
| date | Date | date | Yes | Today | Valid date | All |
| time | Time | time | Yes | Current time | Valid time | All |
| contactName | Contact Name | text | Yes | - | Min 2 chars | All |
| company | Company | text | No | - | Max 100 chars | All |
| phone | Phone | tel | No | - | Valid phone format | All |
| email | Email | email | No | - | Valid email | All |
| assignedTo | Assigned To | select | Yes | Current user | Valid user ID | Manager+ (can assign to others) |
| status | Status | select | Yes | "scheduled" | Valid enum | All |
| notes | Notes | textarea | No | - | Max 1000 chars | All |

## States

### Loading State
- Show skeleton table rows
- Disable all actions
- Show "Loading calls..." message

### Empty State
- Icon: Phone icon
- Title: "No calls yet"
- Description: "Start tracking your outreach by creating your first call"
- Action: "New Call" button

### Error State
- Show error message: "Failed to load calls. Please try again."
- Retry button

### Success State
- Toast notification: "Call created successfully" / "Call updated successfully"
- Refresh list or navigate to detail

## Permissions & Access Control

### View Access
- **Executive**: Can view own calls only (`assignedTo = currentUser`)
- **Manager**: Can view team calls + own calls (`assignedTo IN teamMembers OR assignedTo = currentUser`)
- **SuperAdmin**: Can view all calls

### Create Access
- **Executive**: Can create calls (assigned to self only)
- **Manager**: Can create calls (can assign to team members)
- **SuperAdmin**: Can create calls (can assign to anyone)

### Edit Access
- **Executive**: Own calls only
- **Manager**: Team calls + own calls
- **SuperAdmin**: All calls

### Delete Access
- **Executive**: Own calls only
- **Manager**: Team calls + own calls
- **SuperAdmin**: All calls

## Navigation

### From This Page
- Click call row → `/calls/[id]` (detail page)
- Click "New Call" → Opens modal or navigate to `/calls/new`

### To This Page
- From Dashboard → Click "View All" in Calls widget
- From Sidebar → Click "Calls" menu item

## Analytics Events

- `calls_list_viewed`: When page loads
- `call_created`: When call is created
- `call_updated`: When call is updated
- `call_deleted`: When call is deleted
- `filter_applied`: When filter is applied
- `export_clicked`: When export button clicked

## Design Notes

- Use table component from `components/ui/table`
- Make rows clickable for better UX
- Show status badges with color coding
- Date/time should be human-readable (e.g., "Today 2:30 PM", "Yesterday 10:00 AM")
- Consider calendar view option (future)

## Implementation Checklist

- [ ] Phase 1: Create page shell with header and table placeholder
- [ ] Phase 1: Add navigation/routing
- [ ] Phase 2: Implement data fetching (sample data)
- [ ] Phase 2: Add empty/loading/error states
- [ ] Phase 2: Add search functionality
- [ ] Phase 2: Add filter functionality
- [ ] Phase 3: Implement create call modal/form
- [ ] Phase 3: Implement call detail page
- [ ] Phase 3: Add row-level actions (edit, delete)
- [ ] Phase 3: Add quick actions (log outcome, schedule follow-up)
- [ ] Phase 4: Add microinteractions (hover effects, transitions)
- [ ] Phase 4: Add keyboard shortcuts
- [ ] Phase 4: Bug fixes and polish


# Attendance Page Spec

## Page Information

- **Route**: `/attendance`
- **Page Name**: Attendance Dashboard
- **Roles**: Executive, Manager, SuperAdmin
- **Purpose**: Track attendance with check-in/check-out functionality. Executives see own attendance, Managers see team attendance, SuperAdmin sees all.

## Layout Sections

### Header
- Title: "My Attendance" (Executive) / "Team Attendance" (Manager) / "All Attendance" (SuperAdmin)
- Breadcrumbs: Home > Attendance
- Actions: None (or "View History" link)

### Main Content
- **Today's Status Card**: 
  - Current status (Checked In / Not Checked In)
  - Check-in time (if checked in)
  - Check-out time (if checked out)
  - Check-in/Check-out buttons
- **This Week Summary**: 
  - Days worked this week
  - Total hours (if tracking hours)
  - Attendance streak
- **Recent History Table**: Last 7-14 days of attendance

## Data Requirements

### Entities Needed
- `attendance`: Attendance records
- `users`: For user information

### Sample Data Structure
```typescript
interface AttendanceRecord {
  id: string
  userId: string
  date: string // YYYY-MM-DD
  checkInTime: string | null // ISO timestamp
  checkOutTime: string | null // ISO timestamp
  status: 'present' | 'absent' | 'late' | 'half-day' | 'leave'
  notes?: string
  createdAt: string
  updatedAt: string
}
```

## Top-Level Actions

| Action | Button/Link Location | Roles | Description | Validation |
|--------|---------------------|-------|-------------|------------|
| Check In | Today's Status card | All | Record check-in time | Not already checked in today |
| Check Out | Today's Status card | All | Record check-out time | Must be checked in |
| View History | Header link | All | Navigate to `/attendance/history` | - |
| Request Correction | History row | All | Request attendance correction | - |

## Row-Level Actions

| Action | Location | Roles | Description | Validation |
|--------|----------|-------|-------------|------------|
| View Details | History row click | All | View full day details | - |
| Request Correction | History row menu | All (own) | Request correction for date | - |
| Approve Correction | Corrections page | Manager, SuperAdmin | Approve correction request | - |

## Form Fields (Check-in/Check-out)

| Field | Label | Type | Required | Default | Validation | Permissions |
|-------|-------|------|----------|---------|------------|-------------|
| checkInTime | Check In Time | datetime-local | Yes (for check-in) | Current time | Valid datetime | All |
| checkOutTime | Check Out Time | datetime-local | Yes (for check-out) | Current time | After check-in time | All |
| notes | Notes | textarea | No | - | Max 500 chars | All |

## States

### Loading State
- Show skeleton for status card
- Show skeleton rows for history table
- Disable check-in/out buttons

### Empty State
- Show "No attendance records yet" message
- Show check-in button prominently

### Error State
- Show error message: "Failed to load attendance. Please try again."
- Retry button

### Checked In State
- Show check-out button prominently
- Display check-in time
- Show elapsed time (optional)

### Checked Out State
- Show check-in button (for next day)
- Display check-in and check-out times
- Show total hours worked

## Permissions & Access Control

### View Access
- **Executive**: Can view own attendance only
- **Manager**: Can view team attendance + own attendance
- **SuperAdmin**: Can view all attendance

### Check-in/Check-out Access
- **All Roles**: Can check in/out for themselves only
- **SuperAdmin**: Can check in/out for others (future)

### Correction Access
- **All Roles**: Can request corrections for own attendance
- **Manager, SuperAdmin**: Can approve corrections

## Navigation

### From This Page
- Click "View History" → `/attendance/history`
- Click history row → View details (modal or detail page)
- Click "Request Correction" → Opens correction request form

### To This Page
- From Dashboard → Click "View All" in Attendance widget
- From Sidebar → Click "Attendance" menu item

## Analytics Events

- `attendance_viewed`: When page loads
- `check_in_clicked`: When check-in button clicked
- `check_out_clicked`: When check-out button clicked
- `correction_requested`: When correction is requested

## Design Notes

- Large, prominent check-in/out buttons
- Clear visual indication of current status
- Use color coding (green=present, red=absent, yellow=late)
- Show time in user's local timezone
- Mobile-friendly (important for check-in on the go)

## Implementation Checklist

- [x] Phase 1: Page shell created (already exists)
- [ ] Phase 2: Implement check-in functionality
- [ ] Phase 2: Implement check-out functionality
- [ ] Phase 2: Add today's status card
- [ ] Phase 2: Add this week summary
- [ ] Phase 2: Add recent history table
- [ ] Phase 2: Add empty/loading/error states
- [ ] Phase 3: Implement attendance history page
- [ ] Phase 3: Implement correction request flow
- [ ] Phase 3: Add manager approval flow
- [ ] Phase 4: Add time tracking (hours worked)
- [ ] Phase 4: Add streak counter
- [ ] Phase 4: Bug fixes and polish


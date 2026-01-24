# Phase 3 & 4 Implementation Plan: Details, Actions & Polish

This document outlines the implementation plans for Phase 3 (Details & Actions) and Phase 4 (Microinteractions & Bug Fixes) of the AI-first development workflow.

## Phase 3 Goals

Complete detail pages and actions:
- Full detail page implementations
- All row-level actions working
- All top-level actions working
- Create/edit/delete flows end-to-end
- Optimistic UI updates
- Related data displays

## Phase 4 Goals

Polish and bug fixes:
- Microinteractions and animations
- Loading skeletons
- Toast notifications
- Keyboard shortcuts
- Accessibility improvements
- Performance optimizations
- Edge case handling
- Final bug fixes

## Phase 3: Details & Actions

### 1. Detail Pages Enhancement

#### Call Detail (`/calls/[id]`)
**Tasks**:
- [ ] Display all call information
- [ ] Show call outcomes history
- [ ] Display next actions
- [ ] Show related tasks (if linked)
- [ ] Add edit modal/form
- [ ] Add delete with confirmation
- [ ] Add "Log Outcome" quick action
- [ ] Add "Schedule Follow-up" quick action
- [ ] Add notes section
- [ ] Add activity timeline (optional)

**Reference**: `docs/page-specs/calls-list.md`

#### Task Detail (`/tasks/[id]`)
**Tasks**:
- [ ] Display all task information
- [ ] Show task hierarchy (parent, subtasks)
- [ ] Display related project
- [ ] Show assigned user details
- [ ] Add edit modal/form
- [ ] Add delete with confirmation
- [ ] Add status update quick action
- [ ] Add "Add Subtask" functionality
- [ ] Add comments section (placeholder)
- [ ] Show Figma link prominently
- [ ] Display due date prominently

**Reference**: `docs/page-specs/tasks-list.md`

#### Project Detail (`/projects/[id]`)
**Tasks**:
- [ ] Display all project information
- [ ] Show project tasks list (linked)
- [ ] Display team members with avatars
- [ ] Show project progress visualization
- [ ] Add edit modal/form
- [ ] Add delete with confirmation
- [ ] Add "Add Task" functionality
- [ ] Add team member assignment
- [ ] Show project timeline (start, due dates)
- [ ] Display project statistics

**Reference**: `docs/page-specs/projects-list.md`

### 2. Row-Level Actions

#### Table Row Menus
**Tasks**:
- [ ] Add MoreVertical icon to all table rows
- [ ] Create dropdown menu component
- [ ] Add "View" action (navigate to detail)
- [ ] Add "Edit" action (open edit form)
- [ ] Add "Delete" action (with confirmation)
- [ ] Add quick actions (status update, etc.)
- [ ] Show actions based on permissions
- [ ] Handle click events properly (prevent navigation)

**Reference**: `docs/permissions.md`

#### Quick Actions
**Tasks**:
- [ ] Status update dropdown in table rows
- [ ] Priority update dropdown
- [ ] Assign to quick selector
- [ ] Due date quick picker
- [ ] Optimistic UI updates
- [ ] Success toast notifications

### 3. Top-Level Actions

#### Create Flows
**Tasks**:
- [ ] "New Project" → Create project form
- [ ] "New Task" → Create task form
- [ ] "New Call" → Create call form
- [ ] All forms with validation
- [ ] Success handling (toast + redirect)
- [ ] Error handling

#### Bulk Actions
**Tasks**:
- [ ] Add checkbox column to tables
- [ ] Add bulk action toolbar
- [ ] Bulk status update
- [ ] Bulk delete (with confirmation)
- [ ] Bulk assign (Manager+)

### 4. Optimistic UI Updates

**Tasks**:
- [ ] Update UI immediately on actions
- [ ] Rollback on error
- [ ] Show loading state during update
- [ ] Use React Query's optimistic updates
- [ ] Handle race conditions

**Example Pattern**:
```typescript
useMutation({
  mutationFn: updateTask,
  onMutate: async (newTask) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['tasks'])
    // Snapshot previous value
    const previousTasks = queryClient.getQueryData(['tasks'])
    // Optimistically update
    queryClient.setQueryData(['tasks'], (old) => {
      // Update logic
    })
    return { previousTasks }
  },
  onError: (err, newTask, context) => {
    // Rollback on error
    queryClient.setQueryData(['tasks'], context.previousTasks)
  },
  onSettled: () => {
    // Refetch to ensure consistency
    queryClient.invalidateQueries(['tasks'])
  },
})
```

### 5. Related Data Displays

**Tasks**:
- [ ] Show project tasks on project detail page
- [ ] Show task subtasks on task detail page
- [ ] Show call outcomes on call detail page
- [ ] Show related calls on contact view (future)
- [ ] Link tasks to projects
- [ ] Link calls to tasks (if applicable)

## Phase 4: Microinteractions & Bug Fixes

### 1. Loading Skeletons

**Tasks**:
- [ ] Replace all loading spinners with skeletons
- [ ] Match exact layout structure
- [ ] Use shadcn Skeleton component
- [ ] Smooth fade-in when data loads
- [ ] Skeleton for cards, tables, forms

**Reference**: `docs/ux-contracts.md`

### 2. Toast Notifications

**Tasks**:
- [ ] Implement toast system (use shadcn toast or similar)
- [ ] Success toasts for all create/update/delete actions
- [ ] Error toasts for failures
- [ ] Info toasts for important messages
- [ ] Appropriate icons and colors
- [ ] Auto-dismiss (3-5 seconds)
- [ ] Stack multiple toasts
- [ ] Position: top-right

**Reference**: `docs/ux-contracts.md`

### 3. Hover Effects & Transitions

**Tasks**:
- [ ] Add hover effects to cards (scale, border color)
- [ ] Add hover effects to buttons
- [ ] Add hover effects to table rows
- [ ] Smooth color transitions
- [ ] Use Tailwind transition classes
- [ ] Duration: 200-300ms

**Reference**: `docs/ux-contracts.md`

### 4. Keyboard Shortcuts

**Tasks**:
- [ ] Ctrl/Cmd + K: Open search
- [ ] Enter: Submit forms
- [ ] Escape: Close modals/dropdowns
- [ ] Arrow keys: Navigate lists/tables
- [ ] Show shortcuts in tooltips or help menu
- [ ] Prevent conflicts with browser shortcuts

**Reference**: `docs/ux-contracts.md`

### 5. Accessibility Improvements

**Tasks**:
- [ ] Add ARIA labels to all interactive elements
- [ ] Ensure keyboard navigation works
- [ ] Check color contrast ratios
- [ ] Add focus indicators
- [ ] Test with screen reader
- [ ] Add skip links
- [ ] Ensure form labels are associated

**Reference**: `docs/ux-contracts.md`

### 6. Performance Optimizations

**Tasks**:
- [ ] Add React.memo where appropriate
- [ ] Debounce search/filter inputs
- [ ] Lazy load heavy components
- [ ] Optimize re-renders
- [ ] Check React DevTools Profiler
- [ ] Code split routes
- [ ] Optimize images (if any)

### 7. Edge Case Handling

**Tasks**:
- [ ] Handle null/undefined data gracefully
- [ ] Fix date formatting edge cases
- [ ] Handle empty arrays properly
- [ ] Fix pagination edge cases
- [ ] Handle network errors
- [ ] Handle offline state (optional)
- [ ] Test with various data scenarios

### 8. Bug Fixes

**Common Bugs to Check**:
- [ ] Form validation edge cases
- [ ] Date/time handling
- [ ] Timezone issues
- [ ] Permission checks
- [ ] Navigation issues
- [ ] State management issues
- [ ] Memory leaks
- [ ] Console errors/warnings

### 9. Final Polish

**Tasks**:
- [ ] Consistent spacing throughout
- [ ] Consistent typography
- [ ] Consistent colors
- [ ] Consistent icons
- [ ] Smooth animations
- [ ] Professional feel
- [ ] Mobile responsiveness
- [ ] Cross-browser testing

## Implementation Checklist

### Phase 3 Checklist
- [ ] All detail pages fully implemented
- [ ] All row-level actions working
- [ ] All top-level actions working
- [ ] Create flows complete
- [ ] Edit flows complete
- [ ] Delete flows complete
- [ ] Optimistic UI updates implemented
- [ ] Related data displays working

### Phase 4 Checklist
- [ ] Loading skeletons implemented
- [ ] Toast notifications implemented
- [ ] Hover effects added
- [ ] Keyboard shortcuts added
- [ ] Accessibility improvements done
- [ ] Performance optimizations done
- [ ] Edge cases handled
- [ ] Bugs fixed
- [ ] Final polish complete

## Testing Strategy

### Manual Testing
- [ ] Test all user flows
- [ ] Test all permissions
- [ ] Test on different screen sizes
- [ ] Test with different data scenarios
- [ ] Test error cases
- [ ] Test edge cases

### Automated Testing (Future)
- [ ] Unit tests for utilities
- [ ] Integration tests for flows
- [ ] E2E tests for critical paths

## Acceptance Criteria

### Phase 3 Complete
- [ ] All detail pages are fully functional
- [ ] All actions work end-to-end
- [ ] Optimistic UI updates work
- [ ] Related data displays correctly
- [ ] No broken flows

### Phase 4 Complete
- [ ] All microinteractions are smooth
- [ ] Loading states are polished
- [ ] Toast notifications work
- [ ] Accessibility is improved
- [ ] Performance is optimized
- [ ] All bugs are fixed
- [ ] Code is production-ready

## Next Steps After Phase 4

Once Phase 4 is complete:
1. **Supabase Integration**: Replace sample data with Supabase queries
2. **RLS Implementation**: Implement Row Level Security policies
3. **Authentication**: Integrate Supabase Auth
4. **Production Deployment**: Deploy to production
5. **Monitoring**: Set up error tracking and analytics
6. **Documentation**: Update user documentation


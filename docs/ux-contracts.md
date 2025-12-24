# UX Contracts & Design Patterns

This document defines the standard UX patterns, components, and behaviors used throughout the Internal Team Portal. These are the "contracts" that ensure consistency across all pages.

## Loading States

### Page Loading
- **Pattern**: Skeleton loaders matching the layout structure
- **Duration**: Show skeleton for at least 300ms (even if data loads faster)
- **Implementation**: Use shadcn Skeleton component or custom skeletons
- **Example**: Dashboard widgets show skeleton cards, tables show skeleton rows

### Button Loading
- **Pattern**: Disable button + show spinner icon + change text to "Loading..." or "Saving..."
- **Duration**: Until API call completes
- **Implementation**: Use `disabled` prop + loading icon from lucide-react
- **Example**: "Create Project" button shows spinner and "Creating..." text

### Inline Loading
- **Pattern**: Small spinner next to content being loaded
- **Use case**: Loading additional data without blocking the page
- **Example**: Loading task subtasks when expanding a row

## Empty States

### Standard Empty State Structure
```
[Icon]
[Title: "No [items] yet"]
[Description: Helpful message about what to do]
[Action Button: "Create [Item]" (if user has permission)]
```

### Empty State Examples
- **Tasks**: "No tasks yet. Get started by creating your first task."
- **Projects**: "No projects found. Create a new project to begin."
- **Calls**: "No calls recorded. Log your first call to get started."
- **Search Results**: "No results found. Try adjusting your search or filters."

### Implementation
- Use consistent spacing (py-12, px-4)
- Center content vertically and horizontally
- Use muted text color for description
- Show action button only if user has create permission

## Error States

### Page Error
- **Pattern**: Error message + retry button + support link (optional)
- **Message**: "Failed to load [data]. Please try again."
- **Action**: "Retry" button that refetches data
- **Implementation**: Use React Query's `error` state + error boundary

### Form Error
- **Pattern**: Inline error messages below fields
- **Message**: Specific error (e.g., "This field is required", "Invalid email format")
- **Visual**: Red text, small font size
- **Implementation**: Show on blur or submit

### Toast Error
- **Pattern**: Toast notification with error icon
- **Message**: Brief, actionable error message
- **Duration**: 5 seconds (longer than success toasts)
- **Action**: Dismiss button

## Success States

### Toast Success
- **Pattern**: Toast notification with success icon
- **Message**: Brief confirmation (e.g., "Project created successfully")
- **Duration**: 3 seconds
- **Action**: Auto-dismiss

### Inline Success
- **Pattern**: Green checkmark + success message
- **Use case**: Form submission success (before redirect)
- **Example**: "Task updated successfully" message above form

## Form Patterns

### Form Layout
- **Spacing**: Consistent vertical spacing (gap-4 or gap-6)
- **Labels**: Above inputs, left-aligned, medium font weight
- **Required Fields**: Asterisk (*) + "required" in label or placeholder
- **Help Text**: Below input, muted color, small font size

### Form Validation
- **Trigger**: On blur (for individual fields) + on submit (for all fields)
- **Messages**: Inline, below field, red text
- **Prevent Submit**: Disable submit button if validation fails

### Form Actions
- **Primary Action**: Right-aligned, primary color button
- **Secondary Action**: "Cancel" button, left of primary action
- **Loading State**: Disable all buttons, show spinner on primary button

## Table Patterns

### Table Structure
- **Header**: Sticky header, bold text, muted background
- **Rows**: Hover effect (bg-muted/30), clickable for navigation
- **Spacing**: Consistent padding (px-4, py-3)
- **Borders**: Subtle borders between rows

### Table Actions
- **Row Menu**: MoreVertical icon, right-aligned
- **Bulk Actions**: Checkbox column + toolbar above table
- **Sorting**: Clickable column headers with sort indicators

### Table States
- **Empty**: Show empty state component instead of table
- **Loading**: Show skeleton rows
- **Error**: Show error message above table

## Card Patterns

### Card Structure
- **Border**: Subtle border (border-[#DFE1E7])
- **Padding**: Consistent (p-4 or p-5)
- **Rounded**: rounded-2xl (matching design system)
- **Hover**: Border color change or shadow increase

### Card Content
- **Header**: Title + optional actions (right-aligned)
- **Body**: Main content
- **Footer**: Actions or metadata (optional)

## Navigation Patterns

### Breadcrumbs
- **Format**: Home > Section > Page
- **Last Item**: Not clickable (current page)
- **Spacing**: Slash or chevron separator
- **Location**: Below topbar, above page title

### Sidebar Navigation
- **Active State**: Background color + left border indicator
- **Hover State**: Background color change
- **Icons**: Left of label, consistent size
- **Groups**: Collapsible sections for related items

### Topbar Actions
- **Primary Action**: Prominent button (e.g., "New Project")
- **Secondary Actions**: Icon buttons (Search, Filter, etc.)
- **Alignment**: Right-aligned

## Badge Patterns

### Status Badges
- **Colors**: Match status (green=completed, blue=in-progress, yellow=warning, red=blocked)
- **Size**: Small (h-6, px-2.5)
- **Shape**: Rounded (rounded-2xl)
- **Text**: Uppercase or Title Case

### Priority Badges
- **Colors**: Match priority (low=muted, medium=secondary, high=yellow, urgent=red)
- **Same styling as status badges**

## Avatar Patterns

### Avatar Display
- **Size**: Consistent sizes (h-6 w-6 for lists, h-8 w-8 for headers, h-10 w-10 for profiles)
- **Fallback**: User initials, muted background
- **Border**: White border for overlapping avatars
- **Stacking**: Negative margin (-ml-2) for overlapping

## Modal/Dialog Patterns

### Modal Structure
- **Overlay**: Dark backdrop with opacity
- **Content**: Centered, max-width (e.g., max-w-2xl)
- **Header**: Title + close button (X icon)
- **Body**: Scrollable content
- **Footer**: Actions (Cancel + Primary action)

### Modal Behavior
- **Open**: Smooth fade-in animation
- **Close**: Click overlay or X button or Escape key
- **Focus**: Trap focus inside modal
- **Scroll**: Lock body scroll when open

## Toast/Notification Patterns

### Toast Position
- **Default**: Top-right
- **Stacking**: New toasts appear below existing ones
- **Max Visible**: 3-4 toasts at once

### Toast Structure
- **Icon**: Left side (success=check, error=X, info=info)
- **Message**: Brief, actionable text
- **Action**: Optional action button (e.g., "Undo")
- **Dismiss**: X button on right

## Search Patterns

### Search Input
- **Icon**: Search icon on left
- **Placeholder**: "Search [items]..."
- **Debounce**: 300ms delay before search
- **Clear**: X button appears when text entered

### Search Results
- **Highlight**: Highlight matching text
- **Empty**: Show "No results" message
- **Loading**: Show spinner in input or results area

## Filter Patterns

### Filter UI
- **Location**: Above table/list, right of search
- **Trigger**: Button with Filter icon + badge showing active count
- **Panel**: Dropdown or sidebar with filter options
- **Active State**: Show active filters as chips/tags
- **Clear**: "Clear all" button

## Pagination Patterns

### Pagination UI
- **Location**: Below table/list
- **Controls**: Previous, Page numbers, Next
- **Info**: "Showing X-Y of Z items"
- **Page Size**: Dropdown to change items per page

## Date/Time Patterns

### Date Display
- **Format**: Human-readable (e.g., "Today", "Yesterday", "Jan 15, 2024")
- **Time**: 12-hour format with AM/PM (e.g., "2:30 PM")
- **Relative**: Use relative time for recent dates (e.g., "2 hours ago")

### Date Input
- **Type**: HTML5 date input or date picker component
- **Format**: YYYY-MM-DD for storage, display format for users
- **Validation**: Ensure valid date, not in past (if applicable)

## Responsive Patterns

### Breakpoints
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md-lg)
- **Desktop**: > 1024px (xl+)

### Mobile Adaptations
- **Sidebar**: Collapsible/hamburger menu
- **Tables**: Stack cards instead of table
- **Modals**: Full-screen on mobile
- **Actions**: Bottom sheet for mobile

## Accessibility Patterns

### Keyboard Navigation
- **Tab Order**: Logical flow through interactive elements
- **Enter/Space**: Activate buttons/links
- **Escape**: Close modals/dropdowns
- **Arrow Keys**: Navigate lists/tables

### ARIA Labels
- **Buttons**: Descriptive labels (e.g., "Edit project" not just "Edit")
- **Icons**: Hidden text or aria-label
- **Forms**: Associate labels with inputs
- **Status**: Use aria-live regions for dynamic content

### Focus Management
- **Visible Focus**: Clear focus indicators (ring)
- **Focus Trap**: In modals
- **Focus Return**: Return focus after closing modal

## Color Usage

### Primary Actions
- **Color**: #897EFA (purple from design system)
- **Hover**: Slightly darker shade
- **Text**: White

### Success
- **Color**: #40C4AA (green)
- **Use**: Success states, completed status

### Warning
- **Color**: #FFBD4C (yellow/orange)
- **Use**: Warnings, in-review status

### Error/Danger
- **Color**: Red (from design system)
- **Use**: Errors, blocked status, delete actions

### Neutral
- **Color**: #666D80 (gray)
- **Use**: Secondary text, borders, inactive states

## Spacing System

### Consistent Spacing
- **xs**: 0.5rem (gap-2)
- **sm**: 1rem (gap-4)
- **md**: 1.5rem (gap-6)
- **lg**: 2rem (gap-8)
- **xl**: 3rem (gap-12)

### Component Spacing
- **Card Padding**: p-4 or p-5
- **Section Gap**: space-y-5 or space-y-6
- **Form Gap**: gap-4 or gap-6

## Animation Patterns

### Transitions
- **Duration**: 200-300ms for most transitions
- **Easing**: ease-in-out
- **Properties**: opacity, transform, colors

### Hover Effects
- **Scale**: transform scale(1.02) for cards
- **Color**: Smooth color transitions
- **Shadow**: Increase shadow on hover

### Page Transitions
- **Fade**: Fade in/out for page changes
- **Duration**: 200ms

## Implementation Checklist

When implementing a new page, ensure:
- [ ] Loading states match these patterns
- [ ] Empty states follow the structure
- [ ] Error handling uses these patterns
- [ ] Forms follow the form patterns
- [ ] Tables use the table patterns
- [ ] Navigation is consistent
- [ ] Responsive design works on all breakpoints
- [ ] Accessibility requirements are met
- [ ] Colors match the design system
- [ ] Spacing is consistent


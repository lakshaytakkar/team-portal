# Tasks Detail Page Spec

## Page Information

- **Route**: `/tasks/[id]`
- **Page Name**: Task Detail
- **Roles**: Executive, Manager, SuperAdmin
- **Purpose**: View and manage individual tasks with full details, subtasks, and attachments

## Layout Sections

### Header
- Breadcrumbs: Home > Tasks > [Task Name]
- Navigation: Previous/Next task buttons (if available)
- Back button to tasks list

### Quick Tile
- Thumbnail: Assigned user avatar or task icon
- Title: Task name
- Subtitle: Task description (if available)
- Status badge
- Metadata:
  - Priority badge
  - Progress bar with percentage
  - Due date
  - Assigned to (if assigned)
- Actions: Edit button (opens edit dialog)

### Tabs

#### Overview Tab
- Description
- Status badge
- Priority badge
- Progress bar
- Due date
- Figma link (if available)

#### Subtasks Tab
- List of all subtasks (children tasks)
- Each subtask shows:
  - Name and description
  - Status and priority badges
  - Assigned user (if assigned)
  - Due date (if set)
  - Figma link (if available)
- "Create Subtask" button/form
  - Name (required)
  - Description (optional)
  - Status (default: "not-started")
  - Priority (default: "medium")
  - Assign To (optional)
  - Due Date (optional)
- Empty state when no subtasks exist

#### Attachments Tab
- Upload area (drag & drop or click to browse)
- File validation:
  - Max size: 25MB
  - Allowed types: PDF, DOC, DOCX, XLS, XLSX, ZIP
- List of existing attachments
  - File name
  - File size
  - Upload date
  - Download button
  - Delete button
- Empty state when no attachments exist

## Data Requirements

### Entities Needed
- `tasks`: Task record with hierarchical structure (via `getTaskTreeById`)
- `task_attachments`: Attachment records for the task
- `profiles`: User profiles for assigned users
- `projects`: Project information (if task is linked to a project)

### Server Actions
- `getTaskTreeById(id)`: Fetch task with all subtasks (hierarchical)
- `getTasks()`: Fetch all tasks for navigation
- `getTaskAttachments(taskId)`: Fetch attachments for task
- `createTaskAttachment()`: Create attachment record
- `uploadTaskAttachment()`: Upload file to storage
- `deleteTaskAttachment()`: Delete attachment
- `createTask()`: Create new subtask (with parentId)
- `updateTask()`: Update task (via EditTaskDialog)

## Permissions

### View Access
- **Executive**: Can only view tasks assigned to themselves
- **Manager**: Can view tasks assigned to themselves or team members
- **SuperAdmin**: Can view all tasks

### Edit Access
- **Executive**: Can only edit tasks assigned to themselves
- **Manager**: Can edit tasks assigned to themselves or team members
- **SuperAdmin**: Can edit all tasks

### Attachment Access
- Same permission rules as task view/edit access
- Users must be able to view the task to see attachments
- Users must be able to edit the task to upload/delete attachments

### Subtask Creation
- Same permission rules as task edit access
- Cannot create subtasks if task is already at maximum depth (level 2)
- Subtasks inherit permission checks from parent task

## URL Parameters

- `?tab=overview` - Show Overview tab (default)
- `?tab=subtasks` - Show Subtasks tab
- `?tab=attachments` - Show Attachments tab

Tab state is preserved in URL for bookmarking and sharing.

## Error Handling

- 404: Task not found or user not authorized
- Loading states: Skeletons while fetching data
- Error states: Retry button on fetch failures
- Validation errors: Toast notifications for form validation
- Permission errors: Clear error messages when access denied

## Related Components

- `DetailPageHeader`: Breadcrumbs and navigation
- `DetailQuickTile`: Task summary card
- `DetailTabs`: Tab navigation
- `TaskSubtasksTab`: Subtasks management
- `TaskAttachmentsTab`: Attachments management
- `EditTaskDialog`: Task editing form


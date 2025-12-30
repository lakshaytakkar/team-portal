-- Migration: Add task automations (triggers and functions)
-- Purpose: Automatically sync parent task status and send notifications

-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

-- Function: Sync parent task status when subtask status changes
CREATE OR REPLACE FUNCTION sync_parent_task_status()
RETURNS TRIGGER AS $$
DECLARE
  parent_task_id UUID;
  parent_level INTEGER;
  sibling_statuses TEXT[];
  new_parent_status TEXT;
BEGIN
  -- Only process if status actually changed and task has a parent
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.parent_id IS NOT NULL THEN
    parent_task_id := NEW.parent_id;
    
    -- Get all siblings (tasks with same parent)
    SELECT ARRAY_AGG(status) INTO sibling_statuses
    FROM tasks
    WHERE parent_id = parent_task_id
      AND deleted_at IS NULL;
    
    -- Calculate parent status based on sibling statuses
    -- Rule 1: If all subtasks completed → parent = "completed"
    IF array_length(sibling_statuses, 1) > 0 AND 
       array_length(array_remove(sibling_statuses, 'completed'), 1) IS NULL THEN
      new_parent_status := 'completed';
    -- Rule 2: If any subtask "blocked" → parent = "blocked"
    ELSIF 'blocked' = ANY(sibling_statuses) THEN
      new_parent_status := 'blocked';
    -- Rule 3: If any subtask "in-progress" → parent = "in-progress"
    ELSIF 'in-progress' = ANY(sibling_statuses) THEN
      new_parent_status := 'in-progress';
    -- Rule 4: If all subtasks "not-started" → parent = "not-started"
    ELSIF array_length(sibling_statuses, 1) > 0 AND 
          array_length(array_remove(sibling_statuses, 'not-started'), 1) IS NULL THEN
      new_parent_status := 'not-started';
    -- Rule 5: Mixed states → parent = "in-progress"
    ELSE
      new_parent_status := 'in-progress';
    END IF;
    
    -- Update parent task status if changed
    UPDATE tasks
    SET status = new_parent_status,
        updated_at = NOW()
    WHERE id = parent_task_id
      AND status != new_parent_status
      AND deleted_at IS NULL;
    
    -- Recursively sync grandparent if parent was updated
    -- (This will be handled by the trigger on the parent update)
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Notify on task assignment change
CREATE OR REPLACE FUNCTION notify_task_assignment()
RETURNS TRIGGER AS $$
DECLARE
  task_name TEXT;
  assignee_name TEXT;
BEGIN
  -- Handle both INSERT and UPDATE cases
  -- For INSERT: OLD is NULL, so we check NEW.assigned_to_id
  -- For UPDATE: We check if assigned_to_id changed
  IF (TG_OP = 'INSERT' AND NEW.assigned_to_id IS NOT NULL) OR
     (TG_OP = 'UPDATE' AND OLD.assigned_to_id IS DISTINCT FROM NEW.assigned_to_id AND NEW.assigned_to_id IS NOT NULL) THEN
    -- Get task name
    task_name := NEW.name;
    
    -- Get assignee name (optional, for future use)
    SELECT full_name INTO assignee_name FROM profiles WHERE id = NEW.assigned_to_id;
    
    -- Create notification for assignee
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.assigned_to_id,
      'task_assigned',
      'New Task Assigned',
      'You have been assigned to task: ' || COALESCE(task_name, 'Untitled Task'),
      jsonb_build_object(
        'task_id', NEW.id,
        'task_name', task_name
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Check task due dates and create notifications
CREATE OR REPLACE FUNCTION check_task_due_dates()
RETURNS void AS $$
DECLARE
  task_record RECORD;
  days_until_due INTEGER;
BEGIN
  -- Find tasks due in 1-3 days that are not completed
  FOR task_record IN
    SELECT t.id, t.name, t.due_date, t.assigned_to_id
    FROM tasks t
    WHERE t.due_date IS NOT NULL
      AND t.status != 'completed'
      AND t.due_date >= CURRENT_DATE
      AND t.due_date <= CURRENT_DATE + INTERVAL '3 days'
      AND t.deleted_at IS NULL
      AND t.assigned_to_id IS NOT NULL
  LOOP
    days_until_due := task_record.due_date - CURRENT_DATE;
    
    -- Only notify if due in 1 or 3 days (to avoid duplicate notifications)
    IF days_until_due IN (1, 3) THEN
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (
        task_record.assigned_to_id,
        'task_due_soon',
        'Task Due Soon',
        'Task "' || task_record.name || '" is due ' || 
        CASE 
          WHEN days_until_due = 1 THEN 'tomorrow'
          ELSE 'in ' || days_until_due || ' days'
        END,
        jsonb_build_object(
          'task_id', task_record.id,
          'task_name', task_record.name,
          'due_date', task_record.due_date,
          'days_until_due', days_until_due
        )
      )
      ON CONFLICT DO NOTHING; -- Prevent duplicate notifications
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DATABASE TRIGGERS
-- ============================================================================

-- Trigger: Auto-sync parent status on subtask update
DROP TRIGGER IF EXISTS sync_parent_status_on_subtask_update ON tasks;
CREATE TRIGGER sync_parent_status_on_subtask_update
  AFTER UPDATE OF status ON tasks
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.parent_id IS NOT NULL)
  EXECUTE FUNCTION sync_parent_task_status();

-- Trigger: Notify on assignment change (UPDATE)
DROP TRIGGER IF EXISTS notify_on_task_assignment ON tasks;
CREATE TRIGGER notify_on_task_assignment
  AFTER UPDATE OF assigned_to_id ON tasks
  FOR EACH ROW
  WHEN (OLD.assigned_to_id IS DISTINCT FROM NEW.assigned_to_id AND NEW.assigned_to_id IS NOT NULL)
  EXECUTE FUNCTION notify_task_assignment();

-- Trigger: Notify on task creation with assignment (INSERT)
-- Note: WHEN clause not supported for INSERT triggers, so check is done in function
DROP TRIGGER IF EXISTS notify_on_task_creation ON tasks;
CREATE TRIGGER notify_on_task_creation
  AFTER INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_task_assignment();

-- Trigger: Notify on task completion
DROP TRIGGER IF EXISTS notify_on_task_completion ON tasks;
CREATE TRIGGER notify_on_task_completion
  AFTER UPDATE OF status ON tasks
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed')
  EXECUTE FUNCTION notify_task_completion();

-- Function: Notify on task completion
CREATE OR REPLACE FUNCTION notify_task_completion()
RETURNS TRIGGER AS $$
DECLARE
  task_name TEXT;
  assignee_name TEXT;
  creator_id UUID;
BEGIN
  -- Get task details
  SELECT name, created_by INTO task_name, creator_id FROM tasks WHERE id = NEW.id;
  
  -- Get assignee name if exists
  IF NEW.assigned_to_id IS NOT NULL THEN
    SELECT full_name INTO assignee_name FROM profiles WHERE id = NEW.assigned_to_id;
  END IF;
  
  -- Notify creator if different from assignee
  IF creator_id IS NOT NULL AND creator_id != NEW.assigned_to_id THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      creator_id,
      'task_completed',
      'Task Completed',
      'Task "' || COALESCE(task_name, 'Untitled Task') || '" has been completed',
      jsonb_build_object(
        'task_id', NEW.id,
        'task_name', task_name,
        'completed_by', NEW.assigned_to_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON FUNCTION sync_parent_task_status() IS 'Automatically syncs parent task status when subtask status changes';
COMMENT ON FUNCTION notify_task_assignment() IS 'Creates notification when task is assigned to a user';
COMMENT ON FUNCTION check_task_due_dates() IS 'Checks tasks due soon and creates notifications';
COMMENT ON FUNCTION notify_task_completion() IS 'Creates notification when task is completed';


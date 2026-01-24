-- Migration: Setup task cron jobs
-- Purpose: Schedule automated tasks for task management

-- ============================================================================
-- CRON JOBS SETUP
-- ============================================================================

-- Note: This requires the pg_cron extension to be enabled
-- Run: CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Daily Overdue Task Check (9 AM daily)
-- Calls the process-overdue-tasks edge function
-- Note: pg_cron can't directly call edge functions, so we'll use a database function
-- that can be called by pg_cron, which then triggers the edge function via HTTP

-- Function to call edge function for overdue tasks
CREATE OR REPLACE FUNCTION call_process_overdue_tasks_edge_function()
RETURNS void AS $$
BEGIN
  -- This would call the edge function via HTTP
  -- For now, we'll use the check_task_due_dates function which creates notifications
  -- The actual edge function can be called via Supabase cron or external scheduler
  PERFORM check_task_due_dates();
END;
$$ LANGUAGE plpgsql;

-- Schedule daily overdue task check (9 AM UTC)
-- Note: Adjust timezone as needed
SELECT cron.schedule(
  'daily-overdue-task-check',
  '0 9 * * *', -- 9 AM daily
  $$SELECT call_process_overdue_tasks_edge_function();$$
);

-- Daily Task Summary (6 PM daily)
-- Generates daily summary for managers
CREATE OR REPLACE FUNCTION generate_daily_task_summary()
RETURNS void AS $$
DECLARE
  manager_record RECORD;
  summary_data JSONB;
BEGIN
  -- For each manager, create a summary of their team's tasks
  FOR manager_record IN
    SELECT DISTINCT p.id, p.full_name, p.email
    FROM profiles p
    WHERE p.role = 'manager'
      AND p.is_active = true
  LOOP
    -- Get team task summary
    SELECT jsonb_build_object(
      'total_tasks', COUNT(*),
      'completed_tasks', COUNT(*) FILTER (WHERE status = 'completed'),
      'in_progress_tasks', COUNT(*) FILTER (WHERE status = 'in-progress'),
      'overdue_tasks', COUNT(*) FILTER (
        WHERE due_date < CURRENT_DATE AND status != 'completed'
      )
    ) INTO summary_data
    FROM tasks t
    JOIN profiles emp ON t.assigned_to_id = emp.id
    WHERE emp.manager_id = manager_record.id
      AND t.deleted_at IS NULL;
    
    -- Create notification for manager
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      manager_record.id,
      'task_status_changed', -- Using existing type
      'Daily Task Summary',
      'Your team has ' || (summary_data->>'total_tasks') || ' active tasks',
      summary_data
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule daily task summary (6 PM UTC)
SELECT cron.schedule(
  'daily-task-summary',
  '0 18 * * *', -- 6 PM daily
  $$SELECT generate_daily_task_summary();$$
);

-- Weekly Analytics (Monday 8 AM)
-- Calculates weekly task metrics
CREATE OR REPLACE FUNCTION generate_weekly_task_analytics()
RETURNS void AS $$
BEGIN
  -- This function would calculate weekly analytics
  -- The actual analytics calculation is done by the edge function
  -- This cron job can trigger the edge function or store results
  -- For now, we'll just log that it ran
  RAISE NOTICE 'Weekly analytics calculation triggered';
END;
$$ LANGUAGE plpgsql;

-- Schedule weekly analytics (Monday 8 AM UTC)
SELECT cron.schedule(
  'weekly-task-analytics',
  '0 8 * * 1', -- Monday 8 AM
  $$SELECT generate_weekly_task_analytics();$$
);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON FUNCTION call_process_overdue_tasks_edge_function() IS 'Calls the process-overdue-tasks edge function (placeholder for HTTP call)';
COMMENT ON FUNCTION generate_daily_task_summary() IS 'Generates daily task summary for managers';
COMMENT ON FUNCTION generate_weekly_task_analytics() IS 'Triggers weekly task analytics calculation';

-- Note: To verify cron jobs are scheduled:
-- SELECT * FROM cron.job;
-- 
-- To unschedule a job:
-- SELECT cron.unschedule('job-name');
-- 
-- To manually run a job:
-- SELECT cron.schedule('job-name', 'schedule', 'command');


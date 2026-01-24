-- Add multi-round evaluation support
-- Level 1: Department Senior Evaluation (Technical/Functional)
-- Level 2: Final Decision (HR/Management)

-- Add evaluation_round enum type
DO $$ BEGIN
    CREATE TYPE evaluation_round AS ENUM ('level_1', 'level_2');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to evaluations table
ALTER TABLE evaluations
ADD COLUMN IF NOT EXISTS evaluation_round evaluation_round DEFAULT 'level_1',
ADD COLUMN IF NOT EXISTS evaluator_title TEXT,
ADD COLUMN IF NOT EXISTS department_fit_score INTEGER CHECK (department_fit_score >= 1 AND department_fit_score <= 10),
ADD COLUMN IF NOT EXISTS leadership_score INTEGER CHECK (leadership_score >= 1 AND leadership_score <= 10),
ADD COLUMN IF NOT EXISTS is_final_decision BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS final_status TEXT CHECK (final_status IN ('selected', 'rejected', 'on_hold', 'pending'));

-- Remove unique constraint on interview_id if exists (to allow multiple evaluations per interview)
DO $$ BEGIN
    ALTER TABLE evaluations DROP CONSTRAINT IF EXISTS evaluations_interview_id_key;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Add unique constraint for interview_id + evaluation_round combination
DO $$ BEGIN
    ALTER TABLE evaluations ADD CONSTRAINT evaluations_interview_round_unique UNIQUE (interview_id, evaluation_round);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add index for faster queries by round
CREATE INDEX IF NOT EXISTS idx_evaluations_round ON evaluations(evaluation_round);
CREATE INDEX IF NOT EXISTS idx_evaluations_final_decision ON evaluations(is_final_decision) WHERE is_final_decision = TRUE;

-- Comment on columns
COMMENT ON COLUMN evaluations.evaluation_round IS 'Level 1 = Department Senior, Level 2 = Final Decision';
COMMENT ON COLUMN evaluations.evaluator_title IS 'Title/designation of the evaluator (e.g., Senior Engineer, HR Manager)';
COMMENT ON COLUMN evaluations.department_fit_score IS 'Score for department/team fit (1-10)';
COMMENT ON COLUMN evaluations.leadership_score IS 'Score for leadership potential (1-10)';
COMMENT ON COLUMN evaluations.is_final_decision IS 'True if this is the final hiring decision';
COMMENT ON COLUMN evaluations.final_status IS 'Final hiring status: selected, rejected, on_hold, pending';

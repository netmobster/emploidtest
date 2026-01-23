-- Add role definition fields to jobs table for the Chat Gate feature
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS pay_min integer,
  ADD COLUMN IF NOT EXISTS pay_max integer,
  ADD COLUMN IF NOT EXISTS work_mode text DEFAULT 'remote',
  ADD COLUMN IF NOT EXISTS location_text text,
  ADD COLUMN IF NOT EXISTS reporting_to text,
  ADD COLUMN IF NOT EXISTS mission_statement text,
  ADD COLUMN IF NOT EXISTS big_rocks jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS daily_stack text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS vibe_mode text DEFAULT 'async-autonomous',
  ADD COLUMN IF NOT EXISTS is_complete boolean DEFAULT false;

-- Add check constraint for work_mode
ALTER TABLE jobs
  ADD CONSTRAINT jobs_work_mode_check 
  CHECK (work_mode IN ('remote', 'hybrid', 'on-site'));

-- Add check constraint for vibe_mode
ALTER TABLE jobs
  ADD CONSTRAINT jobs_vibe_mode_check 
  CHECK (vibe_mode IN ('async-autonomous', 'high-collaboration'));

-- Create index for filtering incomplete jobs
CREATE INDEX IF NOT EXISTS idx_jobs_is_complete ON jobs(is_complete);
CREATE INDEX IF NOT EXISTS idx_jobs_user_complete ON jobs(user_id, is_complete);
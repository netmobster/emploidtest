-- Add work history and LinkedIn sync tracking to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS work_history jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS linkedin_synced_at timestamp with time zone DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.work_history IS 'Array of work positions from LinkedIn: [{title, company, duration, description}]';
COMMENT ON COLUMN public.profiles.linkedin_synced_at IS 'Timestamp of last LinkedIn profile sync';
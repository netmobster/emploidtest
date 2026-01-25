-- Create role_status enum
CREATE TYPE public.role_status AS ENUM ('active', 'filled', 'unfilled');

-- Add status and hired_candidate_id to jobs table
ALTER TABLE public.jobs 
  ADD COLUMN IF NOT EXISTS status public.role_status DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS hired_candidate_id uuid REFERENCES auth.users(id);

-- Create hires analytics table
CREATE TABLE public.hires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  employer_id uuid NOT NULL,
  candidate_id uuid NOT NULL,
  match_id uuid REFERENCES public.matches(id),
  hired_at timestamp with time zone NOT NULL DEFAULT now(),
  source text DEFAULT 'emploid',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create role_closures table for tracking unfilled reasons
CREATE TABLE public.role_closures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  employer_id uuid NOT NULL,
  reason text NOT NULL,
  notes text,
  closed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.hires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_closures ENABLE ROW LEVEL SECURITY;

-- Hires RLS policies
CREATE POLICY "Super admins can view all hires"
  ON public.hires FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Employers can view their own hires"
  ON public.hires FOR SELECT
  USING (auth.uid() = employer_id);

CREATE POLICY "Employers can create hires for their jobs"
  ON public.hires FOR INSERT
  WITH CHECK (auth.uid() = employer_id);

-- Role closures RLS policies
CREATE POLICY "Super admins can view all role closures"
  ON public.role_closures FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Employers can view their own closures"
  ON public.role_closures FOR SELECT
  USING (auth.uid() = employer_id);

CREATE POLICY "Employers can create role closures"
  ON public.role_closures FOR INSERT
  WITH CHECK (auth.uid() = employer_id);

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_hires_hired_at ON public.hires (hired_at);
CREATE INDEX IF NOT EXISTS idx_hires_employer_id ON public.hires (employer_id);
CREATE INDEX IF NOT EXISTS idx_role_closures_reason ON public.role_closures (reason);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs (status);
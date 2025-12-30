-- Create jobs table for employer-posted jobs
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  role_id TEXT NOT NULL,
  city_id TEXT NOT NULL,
  description TEXT,
  salary TEXT,
  type TEXT DEFAULT 'Full-time',
  remote BOOLEAN DEFAULT false,
  requirements TEXT[],
  benefits TEXT[],
  skills_preferences JSONB,
  culture_preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read jobs (candidates need to see them)
CREATE POLICY "Anyone can view jobs" 
ON public.jobs 
FOR SELECT 
USING (true);

-- Allow anyone to insert jobs (for now, since we don't have auth)
CREATE POLICY "Anyone can create jobs" 
ON public.jobs 
FOR INSERT 
WITH CHECK (true);
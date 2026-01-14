-- Create hiring_team_members table
CREATE TABLE public.hiring_team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  avatar_url TEXT,
  linkedin_url TEXT,
  email TEXT,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hiring_team_members ENABLE ROW LEVEL SECURITY;

-- Employers can manage their own team
CREATE POLICY "Employers can manage their team" ON public.hiring_team_members
  FOR ALL USING (auth.uid() = employer_id);

-- Matched candidates can view hiring team
CREATE POLICY "Matched candidates can view hiring team" ON public.hiring_team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.employer_id = hiring_team_members.employer_id
      AND matches.candidate_id = auth.uid()
      AND matches.status = 'active'
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_hiring_team_updated_at
  BEFORE UPDATE ON public.hiring_team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add hiring_manager_id to jobs table
ALTER TABLE public.jobs 
ADD COLUMN hiring_manager_id UUID REFERENCES public.hiring_team_members(id) ON DELETE SET NULL;
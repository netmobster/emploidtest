-- Create table for storing interview insights (quiz responses)
CREATE TABLE public.interview_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL,
  employer_id UUID NOT NULL,
  questions JSONB NOT NULL,
  responses JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interview_insights ENABLE ROW LEVEL SECURITY;

-- Policies for interview insights
CREATE POLICY "Match participants can view interview insights"
ON public.interview_insights
FOR SELECT
USING (
  auth.uid() = employer_id OR auth.uid() = candidate_id
);

CREATE POLICY "Employers can create interview insights requests"
ON public.interview_insights
FOR INSERT
WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Candidates can update their own insights"
ON public.interview_insights
FOR UPDATE
USING (auth.uid() = candidate_id);

-- Create table for pending quiz requests (before candidate completes)
CREATE TABLE public.quiz_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL,
  employer_id UUID NOT NULL,
  employer_name TEXT NOT NULL,
  questions JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_requests ENABLE ROW LEVEL SECURITY;

-- Policies for quiz requests
CREATE POLICY "Match participants can view quiz requests"
ON public.quiz_requests
FOR SELECT
USING (
  auth.uid() = employer_id OR auth.uid() = candidate_id
);

CREATE POLICY "Employers can create quiz requests"
ON public.quiz_requests
FOR INSERT
WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Participants can update quiz requests"
ON public.quiz_requests
FOR UPDATE
USING (auth.uid() = employer_id OR auth.uid() = candidate_id);

CREATE POLICY "Employers can delete quiz requests"
ON public.quiz_requests
FOR DELETE
USING (auth.uid() = employer_id);
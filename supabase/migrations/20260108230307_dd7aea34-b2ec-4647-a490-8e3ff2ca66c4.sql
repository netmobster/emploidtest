-- Add synergy_scores column to store quiz results as JSONB
ALTER TABLE public.profiles 
ADD COLUMN synergy_scores jsonb DEFAULT NULL;

-- Add has_completed_synergy_quiz boolean to track completion
ALTER TABLE public.profiles 
ADD COLUMN has_completed_synergy_quiz boolean DEFAULT false;
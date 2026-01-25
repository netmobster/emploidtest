-- Add team_environment field for Employer Onboarding V2 Step 3
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS team_environment text;
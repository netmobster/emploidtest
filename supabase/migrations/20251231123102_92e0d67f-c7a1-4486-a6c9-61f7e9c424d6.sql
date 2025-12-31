-- Add culture_preferences column to profiles table for employers
ALTER TABLE public.profiles ADD COLUMN culture_preferences jsonb DEFAULT NULL;

-- Add has_completed_culture_game flag to track onboarding
ALTER TABLE public.profiles ADD COLUMN has_completed_culture_game boolean DEFAULT false;
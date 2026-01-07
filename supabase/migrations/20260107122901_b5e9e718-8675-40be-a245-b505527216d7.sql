-- Add profile completion tracking columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_completed_extended_profile boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_completed_work_love_language boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_completed_manager_profile boolean DEFAULT false;
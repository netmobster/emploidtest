-- Add has_completed_profile column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_completed_profile boolean DEFAULT false;
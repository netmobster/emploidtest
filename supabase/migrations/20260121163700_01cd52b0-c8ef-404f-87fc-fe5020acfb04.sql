-- Add calendly_url column to profiles for storing employer's Calendly scheduling link
ALTER TABLE public.profiles ADD COLUMN calendly_url TEXT;
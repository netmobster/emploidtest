-- Set default for user_type to prevent trigger failures
ALTER TABLE public.profiles 
ALTER COLUMN user_type SET DEFAULT 'candidate';
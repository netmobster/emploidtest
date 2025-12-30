-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  company_name TEXT,
  bio TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('employer', 'candidate')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles are viewable by everyone (for job listings and candidate profiles)
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, user_type)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'user_type', 'candidate')
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add user_id column to jobs table
ALTER TABLE public.jobs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old insert policy and create new one requiring auth
DROP POLICY IF EXISTS "Anyone can create jobs" ON public.jobs;

CREATE POLICY "Authenticated employers can create jobs" 
ON public.jobs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update/delete their own jobs
CREATE POLICY "Users can update their own jobs" 
ON public.jobs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs" 
ON public.jobs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create saved_jobs table for candidates to save favorites
CREATE TABLE public.saved_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- Enable RLS on saved_jobs
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- Users can view their own saved jobs
CREATE POLICY "Users can view their own saved jobs" 
ON public.saved_jobs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can save jobs
CREATE POLICY "Users can save jobs" 
ON public.saved_jobs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can unsave jobs
CREATE POLICY "Users can unsave jobs" 
ON public.saved_jobs 
FOR DELETE 
USING (auth.uid() = user_id);
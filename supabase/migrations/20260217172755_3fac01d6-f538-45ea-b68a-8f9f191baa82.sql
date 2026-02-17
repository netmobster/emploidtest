-- Fix #1: Replace overly permissive public SELECT policy on profiles
-- with authenticated-only access
DROP POLICY "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);
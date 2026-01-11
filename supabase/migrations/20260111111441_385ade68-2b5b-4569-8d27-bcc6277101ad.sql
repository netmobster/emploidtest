-- Allow authenticated users to insert matches (for testing purposes)
CREATE POLICY "Authenticated users can create matches"
ON public.matches
FOR INSERT
WITH CHECK (auth.uid() = employer_id OR auth.uid() = candidate_id);
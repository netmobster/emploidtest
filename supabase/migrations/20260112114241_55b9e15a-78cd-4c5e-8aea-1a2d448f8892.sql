-- Add DELETE policy for matches table to enable chat deletion
CREATE POLICY "Users can delete their own matches"
ON public.matches FOR DELETE
USING (auth.uid() = employer_id OR auth.uid() = candidate_id);
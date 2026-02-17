-- Bug #3: Add RLS UPDATE policy on messages table so match participants can update read_at
CREATE POLICY "Match participants can update read_at"
ON public.messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = messages.match_id
    AND (matches.employer_id = auth.uid() OR matches.candidate_id = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = messages.match_id
    AND (matches.employer_id = auth.uid() OR matches.candidate_id = auth.uid())
  )
);
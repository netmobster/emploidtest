-- Create swipes table to track all swipe actions
CREATE TABLE public.swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID NOT NULL,
  swiped_id UUID NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('like', 'pass', 'super_like')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(swiper_id, swiped_id, job_id)
);

-- Create matches table for mutual likes
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL,
  candidate_id UUID NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  matched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employer_id, candidate_id, job_id)
);

-- Create messages table for chat between matched users
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Enable RLS on all tables
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for swipes
CREATE POLICY "Users can insert their own swipes"
ON public.swipes FOR INSERT
WITH CHECK (auth.uid() = swiper_id);

CREATE POLICY "Users can view their own swipes"
ON public.swipes FOR SELECT
USING (auth.uid() = swiper_id OR auth.uid() = swiped_id);

-- RLS policies for matches
CREATE POLICY "Users can view their own matches"
ON public.matches FOR SELECT
USING (auth.uid() = employer_id OR auth.uid() = candidate_id);

-- RLS policies for messages
CREATE POLICY "Users can view messages in their matches"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.matches
    WHERE matches.id = messages.match_id
    AND (matches.employer_id = auth.uid() OR matches.candidate_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their matches"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.matches
    WHERE matches.id = messages.match_id
    AND (matches.employer_id = auth.uid() OR matches.candidate_id = auth.uid())
  )
);

-- Create the match detection trigger function
CREATE OR REPLACE FUNCTION public.check_for_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  other_swipe RECORD;
  swiper_type TEXT;
  other_type TEXT;
BEGIN
  -- Only check if this is a 'like' or 'super_like'
  IF NEW.direction NOT IN ('like', 'super_like') THEN
    RETURN NEW;
  END IF;
  
  -- Check if the other person has already liked back
  SELECT * INTO other_swipe FROM public.swipes
  WHERE swiper_id = NEW.swiped_id
    AND swiped_id = NEW.swiper_id
    AND (job_id = NEW.job_id OR (job_id IS NULL AND NEW.job_id IS NULL))
    AND direction IN ('like', 'super_like');
  
  IF FOUND THEN
    -- Determine who is employer and who is candidate
    SELECT user_type INTO swiper_type FROM public.profiles WHERE user_id = NEW.swiper_id;
    SELECT user_type INTO other_type FROM public.profiles WHERE user_id = NEW.swiped_id;
    
    -- Create match (employer first, candidate second)
    IF swiper_type = 'employer' THEN
      INSERT INTO public.matches (employer_id, candidate_id, job_id)
      VALUES (NEW.swiper_id, NEW.swiped_id, NEW.job_id)
      ON CONFLICT DO NOTHING;
    ELSE
      INSERT INTO public.matches (employer_id, candidate_id, job_id)
      VALUES (NEW.swiped_id, NEW.swiper_id, NEW.job_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to check for matches on swipe
CREATE TRIGGER on_swipe_check_match
AFTER INSERT ON public.swipes
FOR EACH ROW
EXECUTE FUNCTION public.check_for_match();
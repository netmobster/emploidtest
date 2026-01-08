-- Add status column to matches for unmatch functionality
ALTER TABLE matches ADD COLUMN status TEXT DEFAULT 'active';

-- Create blocked_users table
CREATE TABLE public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Enable RLS on blocked_users
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- RLS policies for blocked_users
CREATE POLICY "Users can view their own blocks"
ON public.blocked_users FOR SELECT
USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block others"
ON public.blocked_users FOR INSERT
WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock"
ON public.blocked_users FOR DELETE
USING (auth.uid() = blocker_id);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Allow system to insert notifications (for triggers)
CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Add RLS policy for matches UPDATE (for unmatching)
CREATE POLICY "Users can update their own matches"
ON public.matches FOR UPDATE
USING ((auth.uid() = employer_id) OR (auth.uid() = candidate_id));

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to notify on new message
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_id UUID;
  sender_name TEXT;
  match_record RECORD;
BEGIN
  -- Get the match to find the recipient
  SELECT * INTO match_record FROM matches WHERE id = NEW.match_id;
  
  -- Determine recipient (the one who didn't send)
  IF match_record.employer_id = NEW.sender_id THEN
    recipient_id := match_record.candidate_id;
  ELSE
    recipient_id := match_record.employer_id;
  END IF;
  
  -- Get sender name
  SELECT full_name INTO sender_name FROM profiles WHERE user_id = NEW.sender_id;
  
  -- Create notification
  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (
    recipient_id,
    'new_message',
    'New message from ' || COALESCE(sender_name, 'Someone'),
    LEFT(NEW.content, 100),
    jsonb_build_object('match_id', NEW.match_id, 'sender_id', NEW.sender_id)
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new messages
CREATE TRIGGER on_new_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_message();

-- Create function to notify on new match
CREATE OR REPLACE FUNCTION public.notify_new_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  employer_name TEXT;
  candidate_name TEXT;
BEGIN
  -- Get names
  SELECT full_name INTO employer_name FROM profiles WHERE user_id = NEW.employer_id;
  SELECT full_name INTO candidate_name FROM profiles WHERE user_id = NEW.candidate_id;
  
  -- Notify employer
  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (
    NEW.employer_id,
    'new_match',
    'New match!',
    'You matched with ' || COALESCE(candidate_name, 'a candidate'),
    jsonb_build_object('match_id', NEW.id, 'other_user_id', NEW.candidate_id)
  );
  
  -- Notify candidate
  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (
    NEW.candidate_id,
    'new_match',
    'New match!',
    'You matched with ' || COALESCE(employer_name, 'an employer'),
    jsonb_build_object('match_id', NEW.id, 'other_user_id', NEW.employer_id)
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new matches
CREATE TRIGGER on_new_match
AFTER INSERT ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_match();
-- Create notifications table if it doesn't exist (for storing notification history)
-- The table already exists based on the types file, so we skip creation

-- Create function to insert notification and potentially trigger email
CREATE OR REPLACE FUNCTION public.notify_on_match()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for employer
  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    NEW.employer_id,
    'new_match',
    'New Match!',
    'You have a new match with a candidate.',
    jsonb_build_object('match_id', NEW.id, 'candidate_id', NEW.candidate_id)
  );
  
  -- Insert notification for candidate
  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    NEW.candidate_id,
    'new_match',
    'New Match!',
    'You have a new match with an employer.',
    jsonb_build_object('match_id', NEW.id, 'employer_id', NEW.employer_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to notify on new message
CREATE OR REPLACE FUNCTION public.notify_on_message()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id UUID;
  match_record RECORD;
  sender_name TEXT;
BEGIN
  -- Get match record
  SELECT * INTO match_record FROM public.matches WHERE id = NEW.match_id;
  
  -- Determine recipient (opposite of sender)
  IF match_record.employer_id = NEW.sender_id THEN
    recipient_id := match_record.candidate_id;
  ELSE
    recipient_id := match_record.employer_id;
  END IF;
  
  -- Get sender name
  SELECT full_name INTO sender_name FROM public.profiles WHERE user_id = NEW.sender_id;
  
  -- Insert notification for recipient
  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    recipient_id,
    'new_message',
    'New Message',
    COALESCE(sender_name, 'Someone') || ' sent you a message: ' || LEFT(NEW.content, 50),
    jsonb_build_object('match_id', NEW.match_id, 'sender_id', NEW.sender_id, 'message_id', NEW.id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers
DROP TRIGGER IF EXISTS on_new_match_notify ON public.matches;
CREATE TRIGGER on_new_match_notify
  AFTER INSERT ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_match();

DROP TRIGGER IF EXISTS on_new_message_notify ON public.messages;
CREATE TRIGGER on_new_message_notify
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_message();
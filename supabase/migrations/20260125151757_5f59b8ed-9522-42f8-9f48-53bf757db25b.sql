-- Add location and work mode fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS work_mode text DEFAULT 'remote',
ADD COLUMN IF NOT EXISTS location_tier text DEFAULT 'global',
ADD COLUMN IF NOT EXISTS geographic_restriction text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS city_hub text;

-- Add location and work mode fields to jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS geographic_restriction text DEFAULT 'none';

-- Add first_message_sent flag to matches for ChatSeeds visibility
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS first_message_sent boolean DEFAULT false;

-- Create function to update first_message_sent when first message is sent
CREATE OR REPLACE FUNCTION public.update_first_message_flag()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the match to mark that first message has been sent
  UPDATE public.matches 
  SET first_message_sent = true 
  WHERE id = NEW.match_id AND first_message_sent = false;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_first_message_sent ON public.messages;

CREATE TRIGGER on_first_message_sent
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_first_message_flag();
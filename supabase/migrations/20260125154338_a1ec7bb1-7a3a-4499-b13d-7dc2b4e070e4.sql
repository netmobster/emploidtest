-- Create user_onboarding_status table for 3-stage onboarding
CREATE TABLE public.user_onboarding_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  has_seen_philosophy boolean DEFAULT false,
  has_completed_walkthrough boolean DEFAULT false,
  has_completed_dashboard_tour boolean DEFAULT false,
  philosophy_seen_at timestamp with time zone,
  walkthrough_completed_at timestamp with time zone,
  dashboard_tour_completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_onboarding_status ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own onboarding status
CREATE POLICY "Users can view their own onboarding status"
  ON public.user_onboarding_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding status"
  ON public.user_onboarding_status FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding status"
  ON public.user_onboarding_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add is_public_demo_mode to admin_settings (different from test_mode)
INSERT INTO admin_settings (setting_key, setting_value)
VALUES ('is_public_demo_mode', '{"enabled": true}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_user_onboarding_status_user_id 
  ON public.user_onboarding_status (user_id);
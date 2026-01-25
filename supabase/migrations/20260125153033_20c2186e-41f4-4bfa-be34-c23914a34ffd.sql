-- Add verification fields to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_verified_identity boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS linked_provider_id text,
  ADD COLUMN IF NOT EXISTS is_domain_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_domain text,
  ADD COLUMN IF NOT EXISTS verified_work_email text;

-- Create unique index for linked_provider_id (prevent duplicate LinkedIn bindings)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_linked_provider_id 
  ON public.profiles (linked_provider_id) 
  WHERE linked_provider_id IS NOT NULL;

-- Initialize admin_settings with test_mode OFF
INSERT INTO admin_settings (setting_key, setting_value)
VALUES 
  ('test_mode', '{"enabled": false}'::jsonb)
ON CONFLICT (setting_key) DO UPDATE SET setting_value = '{"enabled": false}'::jsonb;
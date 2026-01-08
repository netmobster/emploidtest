-- Drop the overly permissive policy and create a more restrictive one
DROP POLICY "System can create notifications" ON public.notifications;

-- Notifications are only created by triggers (SECURITY DEFINER functions), 
-- so regular users don't need INSERT permission
-- The triggers run with elevated permissions and can insert directly
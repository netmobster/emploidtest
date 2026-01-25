-- Create user_feedback table for bug reports and feature requests
CREATE TABLE public.user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bug_report', 'feature_request', 'general')),
  subject TEXT NOT NULL,
  details TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT
);

-- Enable RLS
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Users can create their own feedback
CREATE POLICY "Users can create their own feedback"
  ON public.user_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
  ON public.user_feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Super admins can view all feedback
CREATE POLICY "Super admins can view all feedback"
  ON public.user_feedback FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'));

-- Super admins can update feedback
CREATE POLICY "Super admins can update feedback"
  ON public.user_feedback FOR UPDATE
  USING (has_role(auth.uid(), 'super_admin'));
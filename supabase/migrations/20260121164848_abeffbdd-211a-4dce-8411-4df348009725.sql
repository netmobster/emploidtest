-- Add last_login_at to profiles for tracking login sessions
ALTER TABLE public.profiles ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;

-- Add previous_login_at to calculate "since last visit" metrics
ALTER TABLE public.profiles ADD COLUMN previous_login_at TIMESTAMP WITH TIME ZONE;

-- Create shortlists table for per-job candidate tracking
CREATE TABLE public.shortlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employer_id, job_id, candidate_id)
);

-- Enable RLS on shortlists
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;

-- Employers can manage their own shortlists
CREATE POLICY "Employers can manage their shortlists"
  ON public.shortlists
  FOR ALL
  USING (auth.uid() = employer_id)
  WITH CHECK (auth.uid() = employer_id);

-- Create quick_question_templates table
CREATE TABLE public.quick_question_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID,  -- NULL for system defaults
  question_text TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on quick_question_templates
ALTER TABLE public.quick_question_templates ENABLE ROW LEVEL SECURITY;

-- Everyone can view default templates
CREATE POLICY "Anyone can view default templates"
  ON public.quick_question_templates
  FOR SELECT
  USING (is_default = true OR auth.uid() = employer_id);

-- Employers can manage their own templates
CREATE POLICY "Employers can manage their templates"
  ON public.quick_question_templates
  FOR ALL
  USING (auth.uid() = employer_id)
  WITH CHECK (auth.uid() = employer_id);

-- Create document_requests table
CREATE TABLE public.document_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL,
  document_type TEXT NOT NULL,  -- 'resume', 'portfolio', 'cover_letter', 'other'
  custom_label TEXT,  -- For 'other' type
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'uploaded', 'declined'
  file_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on document_requests
ALTER TABLE public.document_requests ENABLE ROW LEVEL SECURITY;

-- Match participants can view document requests
CREATE POLICY "Match participants can view document requests"
  ON public.document_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = document_requests.match_id
      AND (matches.employer_id = auth.uid() OR matches.candidate_id = auth.uid())
    )
  );

-- Requesters can create document requests
CREATE POLICY "Users can create document requests"
  ON public.document_requests
  FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Match participants can update document requests (for uploading/declining)
CREATE POLICY "Match participants can update document requests"
  ON public.document_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = document_requests.match_id
      AND (matches.employer_id = auth.uid() OR matches.candidate_id = auth.uid())
    )
  );

-- Create chat_card_preferences table
CREATE TABLE public.chat_card_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID NOT NULL,
  field_key TEXT NOT NULL,  -- 'salary_expectations', 'notice_period', 'skills', etc.
  is_pinned BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employer_id, field_key)
);

-- Enable RLS on chat_card_preferences
ALTER TABLE public.chat_card_preferences ENABLE ROW LEVEL SECURITY;

-- Employers can manage their card preferences
CREATE POLICY "Employers can manage their card preferences"
  ON public.chat_card_preferences
  FOR ALL
  USING (auth.uid() = employer_id)
  WITH CHECK (auth.uid() = employer_id);

-- Create internal_notes table for private employer notes on candidates
CREATE TABLE public.internal_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on internal_notes
ALTER TABLE public.internal_notes ENABLE ROW LEVEL SECURITY;

-- Only employers can see their own notes
CREATE POLICY "Employers can manage their internal notes"
  ON public.internal_notes
  FOR ALL
  USING (auth.uid() = employer_id)
  WITH CHECK (auth.uid() = employer_id);

-- Insert default quick question templates
INSERT INTO public.quick_question_templates (question_text, is_default, display_order) VALUES
  ('What is your current notice period?', true, 1),
  ('What are your salary expectations for this role?', true, 2),
  ('Are you open to hybrid or on-site work?', true, 3),
  ('When would you be available to start?', true, 4),
  ('Do you have any questions about the role or company?', true, 5);

-- Add trigger for updated_at on new tables
CREATE TRIGGER update_quick_question_templates_updated_at
  BEFORE UPDATE ON public.quick_question_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_requests_updated_at
  BEFORE UPDATE ON public.document_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_internal_notes_updated_at
  BEFORE UPDATE ON public.internal_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
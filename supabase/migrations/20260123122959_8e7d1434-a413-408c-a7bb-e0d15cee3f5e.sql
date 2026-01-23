-- Table for custom question packs created by employers
CREATE TABLE public.custom_question_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for questions within custom packs
CREATE TABLE public.custom_pack_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pack_id UUID NOT NULL REFERENCES public.custom_question_packs(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for tracking quiz analytics (which packs/questions get engagement)
CREATE TABLE public.quiz_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_request_id UUID NOT NULL REFERENCES public.quiz_requests(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL,
  candidate_id UUID NOT NULL,
  pack_id TEXT NOT NULL, -- Can be default pack id (e.g. "vibe-check") or custom pack UUID
  is_custom_pack BOOLEAN DEFAULT false,
  questions_sent INTEGER NOT NULL DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  response_time_seconds INTEGER, -- Time from quiz sent to completed
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_question_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_pack_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for custom_question_packs
CREATE POLICY "Employers can manage their own packs"
ON public.custom_question_packs
FOR ALL
USING (auth.uid() = employer_id)
WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can view their packs"
ON public.custom_question_packs
FOR SELECT
USING (auth.uid() = employer_id);

-- RLS policies for custom_pack_questions
CREATE POLICY "Employers can manage questions in their packs"
ON public.custom_pack_questions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM custom_question_packs 
    WHERE id = custom_pack_questions.pack_id 
    AND employer_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM custom_question_packs 
    WHERE id = custom_pack_questions.pack_id 
    AND employer_id = auth.uid()
  )
);

CREATE POLICY "Employers can view questions in their packs"
ON public.custom_pack_questions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM custom_question_packs 
    WHERE id = custom_pack_questions.pack_id 
    AND employer_id = auth.uid()
  )
);

-- RLS policies for quiz_analytics
CREATE POLICY "Employers can view their own analytics"
ON public.quiz_analytics
FOR SELECT
USING (auth.uid() = employer_id);

CREATE POLICY "System can insert analytics"
ON public.quiz_analytics
FOR INSERT
WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "System can update analytics"
ON public.quiz_analytics
FOR UPDATE
USING (auth.uid() = employer_id);

-- Add trigger for updated_at
CREATE TRIGGER update_custom_question_packs_updated_at
BEFORE UPDATE ON public.custom_question_packs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_custom_question_packs_employer ON public.custom_question_packs(employer_id);
CREATE INDEX idx_custom_pack_questions_pack ON public.custom_pack_questions(pack_id);
CREATE INDEX idx_quiz_analytics_employer ON public.quiz_analytics(employer_id);
CREATE INDEX idx_quiz_analytics_pack ON public.quiz_analytics(pack_id);
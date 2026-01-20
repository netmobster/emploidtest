-- Employer availability slots (weekly recurring)
CREATE TABLE interview_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employer_id, day_of_week, start_time)
);

-- Scheduled interviews
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  employer_id UUID NOT NULL,
  candidate_id UUID NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'rescheduled')),
  notes TEXT,
  meeting_link TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE interview_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Policies for interview_availability
CREATE POLICY "Users can manage their own availability"
  ON interview_availability FOR ALL
  USING (employer_id = auth.uid());

CREATE POLICY "Candidates can view employer availability for their matches"
  ON interview_availability FOR SELECT
  USING (employer_id IN (
    SELECT employer_id FROM matches 
    WHERE candidate_id = auth.uid() AND status = 'active'
  ));

-- Policies for interviews
CREATE POLICY "Participants can view their interviews"
  ON interviews FOR SELECT
  USING (employer_id = auth.uid() OR candidate_id = auth.uid());

CREATE POLICY "Participants can insert interviews"
  ON interviews FOR INSERT
  WITH CHECK (employer_id = auth.uid() OR candidate_id = auth.uid());

CREATE POLICY "Participants can update their interviews"
  ON interviews FOR UPDATE
  USING (employer_id = auth.uid() OR candidate_id = auth.uid());

-- Enable realtime for interviews
ALTER PUBLICATION supabase_realtime ADD TABLE interviews;

-- Update timestamp trigger for interviews
CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
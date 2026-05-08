
-- Add missing columns to street_team_applications
ALTER TABLE public.street_team_applications 
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS availability TEXT,
  ADD COLUMN IF NOT EXISTS skills TEXT[];

-- Make user_id nullable so public (non-logged-in) users can apply
ALTER TABLE public.street_team_applications ALTER COLUMN user_id DROP NOT NULL;

-- Add missing columns to street_team_tasks
ALTER TABLE public.street_team_tasks 
  ADD COLUMN IF NOT EXISTS task_type TEXT NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS location TEXT;

-- Add missing columns to street_team_rewards
ALTER TABLE public.street_team_rewards 
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT true;

-- Update RLS: allow anonymous inserts for applications (public form)
DROP POLICY IF EXISTS "Anyone can submit application" ON public.street_team_applications;
CREATE POLICY "Anyone can submit application" ON public.street_team_applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

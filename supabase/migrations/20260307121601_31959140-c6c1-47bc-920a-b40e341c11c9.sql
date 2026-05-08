ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS amendment_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_complete boolean NOT NULL DEFAULT false;

CREATE TABLE public.session_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating integer NOT NULL,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(booking_id, user_id)
);
ALTER TABLE public.session_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create own ratings" ON public.session_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users and family can view ratings" ON public.session_ratings FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'family'));

CREATE TABLE public.vehicle_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name text NOT NULL,
  registration_number text NOT NULL,
  visit_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.vehicle_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can register vehicle" ON public.vehicle_registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Family can view vehicles" ON public.vehicle_registrations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'family'));
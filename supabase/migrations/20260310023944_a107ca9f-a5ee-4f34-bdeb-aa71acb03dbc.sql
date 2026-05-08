
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact message" ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Family can view contact messages" ON public.contact_messages
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'family'::app_role));

CREATE POLICY "Family can update contact messages" ON public.contact_messages
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'family'::app_role));

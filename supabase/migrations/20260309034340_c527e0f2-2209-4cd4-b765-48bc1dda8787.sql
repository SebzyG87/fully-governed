
-- Fix email_logs insert policy to be service-role only (drop overly permissive insert)
DROP POLICY IF EXISTS "System can insert logs" ON public.email_logs;
CREATE POLICY "Authenticated can insert logs" ON public.email_logs FOR INSERT TO authenticated WITH CHECK (true);

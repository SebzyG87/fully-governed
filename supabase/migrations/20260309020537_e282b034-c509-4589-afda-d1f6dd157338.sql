-- Create quote_requests table for Request a Quote form
CREATE TABLE public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  service text NOT NULL,
  description text,
  timeline text,
  budget text,
  referral_source text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a quote request
CREATE POLICY "Anyone can submit quote requests"
ON public.quote_requests
FOR INSERT
WITH CHECK (true);

-- Only family can view all quote requests
CREATE POLICY "Family can view quote requests"
ON public.quote_requests
FOR SELECT
USING (has_role(auth.uid(), 'family'::app_role));

-- Family can update quote requests (status changes)
CREATE POLICY "Family can update quote requests"
ON public.quote_requests
FOR UPDATE
USING (has_role(auth.uid(), 'family'::app_role));

-- Update trigger
CREATE TRIGGER update_quote_requests_updated_at
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
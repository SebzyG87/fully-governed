-- Create redemption codes table for Physical-to-Digital bridge
CREATE TABLE IF NOT EXISTS public.redemption_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    track_id UUID NOT NULL REFERENCES public.music_tracks(id) ON DELETE CASCADE,
    redeemed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    redeemed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.redemption_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can read (needed for validation during redemption)
CREATE POLICY "Anyone can view redemption codes"
    ON public.redemption_codes FOR SELECT
    USING (true);

-- Only authenticated users can update (to redeem)
CREATE POLICY "Authenticated users can redeem codes"
    ON public.redemption_codes FOR UPDATE
    USING (auth.uid() IS NOT NULL);

-- Only admins can insert (via restricted app role or RLS override, simplified for now)
CREATE POLICY "Admins can insert codes"
    ON public.redemption_codes FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));

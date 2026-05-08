
-- Add new profile columns
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS tiktok text,
  ADD COLUMN IF NOT EXISTS spotify text,
  ADD COLUMN IF NOT EXISTS twitter text,
  ADD COLUMN IF NOT EXISTS artist_role text DEFAULT 'artist',
  ADD COLUMN IF NOT EXISTS in_building boolean DEFAULT false;

-- Engineers table for booking form
CREATE TABLE public.engineers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  speciality text,
  availability text DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.engineers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Engineers viewable by everyone" ON public.engineers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Family can manage engineers" ON public.engineers FOR ALL TO authenticated USING (has_role(auth.uid(), 'family'));

-- Collabo board posts
CREATE TABLE public.collabo_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  post_type text NOT NULL DEFAULT 'collab',
  genre text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.collabo_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts viewable by everyone" ON public.collabo_posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON public.collabo_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.collabo_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Family can manage all posts" ON public.collabo_posts FOR DELETE TO authenticated USING (has_role(auth.uid(), 'family'));

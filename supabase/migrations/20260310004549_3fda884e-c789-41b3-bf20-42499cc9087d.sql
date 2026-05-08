
-- Missing tables per Section 26

-- NFT editions metadata per track
CREATE TABLE public.nft_editions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL,
  edition_number INTEGER NOT NULL,
  total_copies INTEGER NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  price NUMERIC NOT NULL DEFAULT 0,
  buyer_id UUID,
  purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.nft_editions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "NFT editions viewable by everyone" ON public.nft_editions FOR SELECT TO public USING (true);
CREATE POLICY "Family can manage nft editions" ON public.nft_editions FOR ALL TO public USING (has_role(auth.uid(), 'family'));

-- Artist music uploads
CREATE TABLE public.music_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  genre TEXT,
  file_url TEXT,
  cover_url TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  is_nft BOOLEAN NOT NULL DEFAULT false,
  nft_copy_limit INTEGER,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published tracks viewable by everyone" ON public.music_tracks FOR SELECT TO public USING (status = 'published' OR auth.uid() = user_id OR has_role(auth.uid(), 'family'));
CREATE POLICY "Users can create tracks" ON public.music_tracks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tracks" ON public.music_tracks FOR UPDATE TO public USING (auth.uid() = user_id);
CREATE POLICY "Family can manage tracks" ON public.music_tracks FOR ALL TO public USING (has_role(auth.uid(), 'family'));

-- All music/product purchases
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'track',
  item_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own purchases" ON public.purchases FOR SELECT TO public USING (auth.uid() = buyer_id OR has_role(auth.uid(), 'family'));
CREATE POLICY "Users can create purchases" ON public.purchases FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Family can manage purchases" ON public.purchases FOR ALL TO public USING (has_role(auth.uid(), 'family'));

-- Approved street team members with role
CREATE TABLE public.street_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  points INTEGER NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'bronze',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.street_team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view own record" ON public.street_team_members FOR SELECT TO public USING (auth.uid() = user_id OR has_role(auth.uid(), 'family'));
CREATE POLICY "Family can manage members" ON public.street_team_members FOR ALL TO public USING (has_role(auth.uid(), 'family'));

-- Help article changelog / version history
CREATE TABLE public.help_article_changelog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.help_articles(id) ON DELETE CASCADE,
  changed_by UUID,
  change_summary TEXT,
  previous_content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.help_article_changelog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Family can view changelog" ON public.help_article_changelog FOR SELECT TO public USING (has_role(auth.uid(), 'family'));
CREATE POLICY "Family can insert changelog" ON public.help_article_changelog FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'family'));

-- Add foreign key from nft_editions to music_tracks
ALTER TABLE public.nft_editions ADD CONSTRAINT nft_editions_track_id_fkey FOREIGN KEY (track_id) REFERENCES public.music_tracks(id) ON DELETE CASCADE;

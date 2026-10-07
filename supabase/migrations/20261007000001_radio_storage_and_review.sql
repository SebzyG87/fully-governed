-- Storage for submitted music and artwork, with uploads confined to each user's folder.
INSERT INTO storage.buckets (id, name, public)
VALUES ('tracks', 'tracks', true), ('covers', 'covers', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Users can upload own track files" ON storage.objects;
CREATE POLICY "Users can upload own track files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'tracks' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own track files" ON storage.objects;
CREATE POLICY "Users can delete own track files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'tracks' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can upload own cover files" ON storage.objects;
CREATE POLICY "Users can upload own cover files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'covers' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own cover files" ON storage.objects;
CREATE POLICY "Users can delete own cover files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'covers' AND (storage.foldername(name))[1] = auth.uid()::text);

-- A client can submit a track, but only a family/admin account can publish it.
DROP POLICY IF EXISTS "Users can create tracks" ON public.music_tracks;
CREATE POLICY "Users can create tracks for review"
ON public.music_tracks FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND status <> 'published');

DROP POLICY IF EXISTS "Users can update own tracks" ON public.music_tracks;
CREATE POLICY "Users can update own unpublished tracks"
ON public.music_tracks FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND status <> 'published');

ALTER TABLE public.music_tracks
  ADD COLUMN IF NOT EXISTS release_type TEXT NOT NULL DEFAULT 'Single';

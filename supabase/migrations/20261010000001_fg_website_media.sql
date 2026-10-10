-- Public website media overrides managed by studio admins.
CREATE TABLE IF NOT EXISTS public.fg_site_media (
  slot_key TEXT PRIMARY KEY CHECK (slot_key ~ '^[a-z0-9][a-z0-9._-]{1,119}$'),
  label TEXT NOT NULL,
  public_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.fg_site_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fg_site_media_public_read" ON public.fg_site_media;
CREATE POLICY "fg_site_media_public_read" ON public.fg_site_media
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "fg_site_media_manager_write" ON public.fg_site_media;
CREATE POLICY "fg_site_media_manager_write" ON public.fg_site_media
  FOR ALL TO authenticated
  USING (public.fg_is_manager_or_above())
  WITH CHECK (public.fg_is_manager_or_above());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'website-media',
  'website-media',
  true,
  31457280,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "website_media_public_read" ON storage.objects;
CREATE POLICY "website_media_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'website-media');

DROP POLICY IF EXISTS "website_media_manager_insert" ON storage.objects;
CREATE POLICY "website_media_manager_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'website-media' AND public.fg_is_manager_or_above());

DROP POLICY IF EXISTS "website_media_manager_update" ON storage.objects;
CREATE POLICY "website_media_manager_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'website-media' AND public.fg_is_manager_or_above())
  WITH CHECK (bucket_id = 'website-media' AND public.fg_is_manager_or_above());

DROP POLICY IF EXISTS "website_media_manager_delete" ON storage.objects;
CREATE POLICY "website_media_manager_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'website-media' AND public.fg_is_manager_or_above());

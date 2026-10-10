CREATE TABLE IF NOT EXISTS public.fg_room_gallery_content (
  room_key TEXT PRIMARY KEY CHECK (room_key IN ('recording', 'multi-use', 'content')),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 1 AND 500),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.fg_room_gallery_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fg_room_gallery_content_public_read" ON public.fg_room_gallery_content;
CREATE POLICY "fg_room_gallery_content_public_read" ON public.fg_room_gallery_content
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "fg_room_gallery_content_manager_write" ON public.fg_room_gallery_content;
CREATE POLICY "fg_room_gallery_content_manager_write" ON public.fg_room_gallery_content
  FOR ALL TO authenticated
  USING (public.fg_is_manager_or_above())
  WITH CHECK (public.fg_is_manager_or_above());

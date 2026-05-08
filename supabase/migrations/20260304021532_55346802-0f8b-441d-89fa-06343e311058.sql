
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS no_overlap;
DROP EXTENSION IF EXISTS btree_gist CASCADE;
CREATE EXTENSION IF NOT EXISTS btree_gist SCHEMA extensions;
ALTER TABLE public.bookings ADD CONSTRAINT no_overlap EXCLUDE USING gist (
  room_id WITH =,
  tstzrange(start_time, end_time) WITH &&
) WHERE (status = 'confirmed');

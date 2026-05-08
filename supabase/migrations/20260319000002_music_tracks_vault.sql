-- Add vault/exclusive fields to music_tracks
alter table music_tracks
  add column if not exists is_exclusive boolean default false,
  add column if not exists tier_required text default 'free'; -- 'free' | 'member' | 'gold' | 'platinum'

-- Create index for exclusive track queries
create index if not exists idx_music_tracks_exclusive on music_tracks(is_exclusive, tier_required, status);

-- Fully Governed operating-system completion tables
-- Adds durable producer, task, time tracking, ban, and campaign brief support.

create table if not exists public.fg_producer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  slug text not null unique,
  display_name text not null,
  role_title text not null,
  bio text,
  avatar_url text,
  skills text[] not null default '{}',
  services jsonb not null default '[]'::jsonb,
  rate_cards jsonb not null default '[]'::jsonb,
  availability jsonb not null default '{}'::jsonb,
  portfolio jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fg_producer_profiles enable row level security;

create table if not exists public.fg_staff_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  assigned_to_name text,
  assigned_user_id uuid references auth.users(id) on delete set null,
  assigned_role text not null default 'staff',
  linked_booking_id uuid references public.bookings(id) on delete set null,
  linked_room_id uuid references public.rooms(id) on delete set null,
  linked_label text,
  task_category text not null default 'general' check (task_category in (
    'general', 'staff', 'producer', 'cleaner', 'daily_checklist',
    'session_preparation', 'session_breakdown'
  )),
  checklist jsonb not null default '[]'::jsonb,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'to_do' check (status in ('to_do', 'in_progress', 'blocked', 'complete')),
  due_at timestamptz,
  due_label text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  completed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fg_staff_tasks enable row level security;

create table if not exists public.fg_staff_shifts (
  id uuid primary key default gen_random_uuid(),
  staff_user_id uuid not null references auth.users(id) on delete cascade,
  staff_role text not null default 'staff',
  clock_in_at timestamptz not null default now(),
  clock_out_at timestamptz,
  duration_seconds integer generated always as (
    case when clock_out_at is null then null
    else greatest(0, extract(epoch from (clock_out_at - clock_in_at))::integer)
    end
  ) stored,
  activity_log jsonb not null default '[]'::jsonb,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  review_status text not null default 'pending' check (review_status in ('pending', 'approved', 'queried')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fg_staff_shifts enable row level security;

create table if not exists public.fg_ban_registry (
  id uuid primary key default gen_random_uuid(),
  person_name text not null,
  person_type text not null default 'client' check (person_type in ('client', 'guest', 'group', 'staff', 'unknown')),
  linked_user_id uuid references auth.users(id) on delete set null,
  linked_incident_id uuid references public.fg_incidents(id) on delete set null,
  risk_status text not null default 'amber' check (risk_status in ('green', 'amber', 'red')),
  ban_status text not null default 'watch' check (ban_status in ('watch', 'banned', 'appeal', 'lifted')),
  review_status text not null default 'pending_review' check (review_status in ('pending_review', 'approved', 'rejected', 'needs_more_info')),
  reason text not null,
  required_action text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  expires_at timestamptz,
  audit_trail jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fg_ban_registry enable row level security;

create table if not exists public.fg_campaign_briefs (
  id uuid primary key default gen_random_uuid(),
  brief_type text not null check (brief_type in (
    'artist_development', 'creative_services', 'business_growth', 'campaign_brief'
  )),
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  project_name text,
  goal text not null,
  audience text,
  budget_range text,
  timeline text,
  platforms text[] not null default '{}',
  services text[] not null default '{}',
  creative_notes text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'quoted', 'approved', 'rejected', 'archived')),
  submitted_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fg_campaign_briefs enable row level security;

create trigger update_fg_producer_profiles_updated_at
  before update on public.fg_producer_profiles
  for each row execute function public.update_updated_at_column();

create trigger update_fg_staff_tasks_updated_at
  before update on public.fg_staff_tasks
  for each row execute function public.update_updated_at_column();

create trigger update_fg_staff_shifts_updated_at
  before update on public.fg_staff_shifts
  for each row execute function public.update_updated_at_column();

create trigger update_fg_ban_registry_updated_at
  before update on public.fg_ban_registry
  for each row execute function public.update_updated_at_column();

create trigger update_fg_campaign_briefs_updated_at
  before update on public.fg_campaign_briefs
  for each row execute function public.update_updated_at_column();

create policy "fg_producers_public_read" on public.fg_producer_profiles
  for select using (is_active = true or public.has_role(auth.uid(), 'creator_admin'));

create policy "fg_producers_admin_manage" on public.fg_producer_profiles
  for all using (public.has_role(auth.uid(), 'creator_admin'))
  with check (public.has_role(auth.uid(), 'creator_admin'));

create policy "fg_staff_tasks_select" on public.fg_staff_tasks
  for select using (
    public.has_role(auth.uid(), 'creator_admin')
    or assigned_user_id = auth.uid()
    or created_by = auth.uid()
  );

create policy "fg_staff_tasks_insert" on public.fg_staff_tasks
  for insert with check (auth.uid() is not null);

create policy "fg_staff_tasks_update" on public.fg_staff_tasks
  for update using (
    public.has_role(auth.uid(), 'creator_admin')
    or assigned_user_id = auth.uid()
    or created_by = auth.uid()
  );

create policy "fg_staff_shifts_select" on public.fg_staff_shifts
  for select using (public.has_role(auth.uid(), 'creator_admin') or staff_user_id = auth.uid());

create policy "fg_staff_shifts_insert_self" on public.fg_staff_shifts
  for insert with check (staff_user_id = auth.uid());

create policy "fg_staff_shifts_update_self" on public.fg_staff_shifts
  for update using (public.has_role(auth.uid(), 'creator_admin') or staff_user_id = auth.uid());

create policy "fg_ban_registry_staff_read" on public.fg_ban_registry
  for select using (public.has_role(auth.uid(), 'creator_admin'));

create policy "fg_ban_registry_admin_manage" on public.fg_ban_registry
  for all using (public.has_role(auth.uid(), 'creator_admin'))
  with check (public.has_role(auth.uid(), 'creator_admin'));

create policy "fg_campaign_briefs_insert_anyone" on public.fg_campaign_briefs
  for insert with check (true);

create policy "fg_campaign_briefs_owner_or_admin_read" on public.fg_campaign_briefs
  for select using (public.has_role(auth.uid(), 'creator_admin') or submitted_by = auth.uid());

create policy "fg_campaign_briefs_admin_update" on public.fg_campaign_briefs
  for update using (public.has_role(auth.uid(), 'creator_admin'));

insert into public.fg_producer_profiles (
  slug, display_name, role_title, bio, skills, services, rate_cards, availability, portfolio, sort_order
) values
  (
    'mono-luke',
    'Mono Luke',
    'Producer & Creative Lead',
    'Creative producer covering music production, engineering, mixing, mastering, motion graphics, 3D, and design support.',
    array['Music Production', 'Mixing', 'Mastering', 'Recording Engineering', '3D Modelling', 'Motion Graphics', 'Graphic Design'],
    '[{"category":"Music & Audio","items":["Vocal recording","Session engineering","Mixing","Mastering","Podcast audio editing"]},{"category":"Visual & Design","items":["Motion graphics","Video effects","Artwork","3D modelling","Product visualisation"]}]'::jsonb,
    '[{"label":"Studio session support","rate":"From £45/hr"},{"label":"Project packages","rate":"Quoted by brief"}]'::jsonb,
    '{"label":"Monday-Friday, 10:00-18:00","notes":"Preferred sessions are weekday afternoons. Booking response target: 4 hours."}'::jsonb,
    '[{"title":"Boiler Room live mix concept"},{"title":"Lyric video motion concept"},{"title":"Studio synth 3D showcase"},{"title":"Single cover art showcase"}]'::jsonb,
    10
  ),
  (
    'seb-green',
    'Sebastian Green',
    'Creative Systems & Operations Director',
    'Behind-the-scenes systems, content strategy, web platforms, workflow automation, and campaign operations support.',
    array['Workflow Automation', 'Systems Architecture', 'Content Strategy', 'Software Engineering', 'Livestream Systems', 'Campaign Planning'],
    '[{"category":"Web & Digital","items":["Website development","Booking systems","Dashboard systems","Custom software planning"]},{"category":"Business & Campaigns","items":["Campaign planning","Operations design","Content rollout","Digital transformation"]}]'::jsonb,
    '[{"label":"Consultation","rate":"POA"},{"label":"Systems project","rate":"Quoted by scope"}]'::jsonb,
    '{"label":"By appointment","notes":"Direct outreach required for strategic consultations and systems work."}'::jsonb,
    '[{"title":"Studio ops automation hub"},{"title":"Ecosystem strategy briefing"},{"title":"Livestream infrastructure setup"},{"title":"Artist launch campaign concept"}]'::jsonb,
    20
  ),
  (
    'future-producer-template',
    'Future Producer',
    'Producer / Specialist',
    'Template profile for future Fully Governed producers and creative specialists.',
    array['Production', 'Engineering', 'Creative Direction'],
    '[{"category":"Services","items":["Add services in admin"]}]'::jsonb,
    '[{"label":"Standard rate","rate":"TBC"}]'::jsonb,
    '{"label":"TBC","notes":"Availability to be confirmed."}'::jsonb,
    '[]'::jsonb,
    999
  )
on conflict (slug) do nothing;

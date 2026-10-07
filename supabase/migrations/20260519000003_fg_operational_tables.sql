-- Migration: Operational Tables
-- Creates all new fg_ operational tables for the studio OS.
-- All use IF NOT EXISTS so re-runs are safe.

-- ========================================================
-- 1. fg_room_buffers — configurable turnaround windows per room
-- ========================================================
CREATE TABLE IF NOT EXISTS public.fg_room_buffers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id         UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  buffer_minutes  INTEGER NOT NULL DEFAULT 60
    CHECK (buffer_minutes IN (20, 30, 60)),
  cleaning_required BOOLEAN NOT NULL DEFAULT true,
  updated_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (room_id)
);

ALTER TABLE public.fg_room_buffers ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_fg_room_buffers_updated_at
  BEFORE UPDATE ON public.fg_room_buffers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================================
-- 2. fg_booking_assignments — staff assignments per booking
-- ========================================================
CREATE TABLE IF NOT EXISTS public.fg_booking_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  staff_user_id   UUID NOT NULL REFERENCES auth.users(id),
  assignment_role TEXT NOT NULL CHECK (assignment_role IN (
    'session_producer', 'cleaner', 'studio_manager', 'support'
  )),
  assignment_status TEXT NOT NULL DEFAULT 'assigned' CHECK (assignment_status IN (
    'assigned', 'accepted', 'declined', 'completed'
  )),
  assigned_by     UUID REFERENCES auth.users(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (booking_id, staff_user_id, assignment_role)
);

ALTER TABLE public.fg_booking_assignments ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_fg_booking_assignments_updated_at
  BEFORE UPDATE ON public.fg_booking_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================================
-- 3. fg_booking_lifecycle_events — auditable status change log
-- ========================================================
CREATE TABLE IF NOT EXISTS public.fg_booking_lifecycle_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status   TEXT NOT NULL,
  changed_by  UUID REFERENCES auth.users(id),
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fg_booking_lifecycle_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_fg_lifecycle_booking_id
  ON public.fg_booking_lifecycle_events(booking_id);

-- ========================================================
-- 4. fg_cleaning_tasks — cleaner turnaround queue
-- ========================================================
CREATE TABLE IF NOT EXISTS public.fg_cleaning_tasks (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id            UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  room_id               UUID NOT NULL REFERENCES public.rooms(id),
  assigned_cleaner_id   UUID REFERENCES auth.users(id),
  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'assigned', 'in_progress', 'completed', 'blocked'
  )),
  cleaning_window_start TIMESTAMPTZ,
  cleaning_window_end   TIMESTAMPTZ,
  checklist             JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes                 TEXT,
  issue_report          TEXT,
  completed_at          TIMESTAMPTZ,
  completed_by          UUID REFERENCES auth.users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fg_cleaning_tasks ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_fg_cleaning_tasks_updated_at
  BEFORE UPDATE ON public.fg_cleaning_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_fg_cleaning_tasks_assigned
  ON public.fg_cleaning_tasks(assigned_cleaner_id);

CREATE INDEX IF NOT EXISTS idx_fg_cleaning_tasks_status
  ON public.fg_cleaning_tasks(status);

-- ========================================================
-- 5. fg_client_verifications — optional ID/waiver verification
-- ========================================================
CREATE TABLE IF NOT EXISTS public.fg_client_verifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id        UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  status            TEXT NOT NULL DEFAULT 'not_required' CHECK (status IN (
    'not_required', 'required', 'pending', 'verified', 'rejected'
  )),
  id_document_url   TEXT,
  selfie_url        TEXT,
  waiver_signed_at  TIMESTAMPTZ,
  admin_status      TEXT DEFAULT 'not_reviewed' CHECK (admin_status IN (
    'not_reviewed', 'approved', 'rejected', 'flagged'
  )),
  verification_notes TEXT,
  verified_by       UUID REFERENCES auth.users(id),
  verified_at       TIMESTAMPTZ,
  rejected_reason   TEXT,
  guest_name        TEXT,
  is_guest          BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fg_client_verifications ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_fg_client_verifications_updated_at
  BEFORE UPDATE ON public.fg_client_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================================
-- 6. fg_email_queue — reliable email event log / queue
-- ========================================================
CREATE TABLE IF NOT EXISTS public.fg_email_queue (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key        TEXT NOT NULL CHECK (template_key IN (
    'booking_confirmation', 'deposit_confirmation', 'session_reminder',
    'session_started', 'late_no_show_warning', 'session_completed',
    'producer_assignment', 'cleaner_assignment',
    'verification_required', 'admin_alert',
    'payment_reminder', 'invoice', 'review_request',
    'password_reset', 'verification_approved', 'verification_rejected'
  )),
  recipient_email     TEXT NOT NULL,
  recipient_user_id   UUID REFERENCES auth.users(id),
  booking_id          UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  payload             JSONB NOT NULL DEFAULT '{}'::jsonb,
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'sent', 'failed', 'skipped'
  )),
  attempts            INTEGER NOT NULL DEFAULT 0,
  provider_message_id TEXT,
  error_message       TEXT,
  send_after          TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fg_email_queue ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_fg_email_queue_updated_at
  BEFORE UPDATE ON public.fg_email_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_fg_email_queue_status
  ON public.fg_email_queue(status, send_after);

-- ========================================================
-- 7. fg_incidents — operational incident log
-- ========================================================
CREATE TABLE IF NOT EXISTS public.fg_incidents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  room_id         UUID REFERENCES public.rooms(id),
  incident_type   TEXT NOT NULL CHECK (incident_type IN (
    'late_arrival', 'no_show', 'damage', 'extra_guests',
    'payment_issue', 'equipment_issue', 'behaviour_issue',
    'cleaning_issue', 'other'
  )),
  severity        TEXT NOT NULL DEFAULT 'low' CHECK (severity IN (
    'low', 'medium', 'high', 'critical'
  )),
  notes           TEXT,
  reported_by     UUID REFERENCES auth.users(id),
  visible_to_client BOOLEAN NOT NULL DEFAULT false,
  resolved        BOOLEAN NOT NULL DEFAULT false,
  resolved_at     TIMESTAMPTZ,
  resolved_by     UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fg_incidents ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_fg_incidents_updated_at
  BEFORE UPDATE ON public.fg_incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_fg_incidents_booking_id
  ON public.fg_incidents(booking_id);

-- ========================================================
-- 8. fg_session_notes — internal notes per booking/session
-- ========================================================
CREATE TABLE IF NOT EXISTS public.fg_session_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES auth.users(id),
  note_type   TEXT NOT NULL DEFAULT 'internal' CHECK (note_type IN (
    'internal', 'producer', 'client_visible', 'admin_only'
  )),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fg_session_notes ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_fg_session_notes_updated_at
  BEFORE UPDATE ON public.fg_session_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================================
-- 9. fg_studio_settings — studio-level config store
-- ========================================================
CREATE TABLE IF NOT EXISTS public.fg_studio_settings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key   TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT 'null'::jsonb,
  description   TEXT,
  updated_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fg_studio_settings ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_fg_studio_settings_updated_at
  BEFORE UPDATE ON public.fg_studio_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default studio settings
INSERT INTO public.fg_studio_settings (setting_key, setting_value, description)
VALUES
  ('default_buffer_minutes',  '60',         'Default room turnaround buffer in minutes'),
  ('verification_required',   'false',      'Whether new clients require ID verification by default'),
  ('deposit_percentage',      '50',         'Default deposit percentage (0 = full payment required)'),
  ('building_phone',          '"TBC"',      'Studio building phone number for AI/reception'),
  ('ai_provider',             '"not_configured"', 'AI phone/reception provider name'),
  ('email_provider',          '"not_configured"', 'Email delivery provider name'),
  ('overtime_grace_minutes',  '10',         'Grace period before overtime is charged')
ON CONFLICT (setting_key) DO NOTHING;

-- ========================================================
-- 10. fg_ai_call_logs — AI phone system placeholder (integration-ready)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.fg_ai_call_logs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_number       TEXT,
  ai_provider         TEXT,
  call_type           TEXT CHECK (call_type IN (
    'inbound', 'outbound', 'missed', 'voicemail'
  )),
  call_summary        TEXT,
  transcript          TEXT,
  booking_enquiry_status TEXT CHECK (booking_enquiry_status IN (
    'none', 'interested', 'booked', 'follow_up_needed', 'not_interested'
  )),
  follow_up_task_id   UUID,
  linked_user_id      UUID REFERENCES auth.users(id),
  duration_seconds    INTEGER,
  started_at          TIMESTAMPTZ,
  ended_at            TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fg_ai_call_logs ENABLE ROW LEVEL SECURITY;

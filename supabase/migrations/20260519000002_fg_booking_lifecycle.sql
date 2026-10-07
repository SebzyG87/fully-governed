-- Migration: Booking Lifecycle Expansion
-- Expands booking statuses, adds lifecycle timestamps, payment fields,
-- session scope (package/extras/notes), and updates the overlap constraint.
-- Safe: existing confirmed/cancelled/completed data remains valid.

-- 1. Drop old narrow status CHECK constraint
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- 2. Add new broad status CHECK constraint
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_status_check CHECK (status IN (
    'pending_payment',
    'deposit_paid',
    'confirmed',
    'verification_required',
    'verification_pending',
    'ready',
    'checked_in',
    'in_progress',
    'completed',
    'cancelled',
    'no_show',
    'needs_cleaning',
    'cleaned'
  ));

-- 3. Lifecycle timestamps
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS updated_at         TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS confirmed_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS checked_in_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS started_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS no_show_at         TIMESTAMPTZ;

-- Backfill updated_at for existing rows
UPDATE public.bookings SET updated_at = created_at WHERE updated_at IS NULL;

-- Trigger to keep updated_at current
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Payment / deposit fields (Stripe-provider-ready; no fake data)
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS deposit_amount         NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS total_amount           NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS outstanding_balance    NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS overtime_owed          NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_status         TEXT DEFAULT 'unpaid'
    CHECK (payment_status IN (
      'unpaid', 'deposit_paid', 'paid',
      'partially_refunded', 'refunded', 'failed', 'disputed'
    )),
  ADD COLUMN IF NOT EXISTS refund_status          TEXT,
  ADD COLUMN IF NOT EXISTS payment_provider       TEXT,
  ADD COLUMN IF NOT EXISTS payment_provider_ref   TEXT;

-- 5. Package / session scope (producer-visible; client notes scoped separately)
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS package_purchased   TEXT,
  ADD COLUMN IF NOT EXISTS included_services   JSONB  DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS excluded_services   JSONB  DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS extras_purchased    JSONB  DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS overtime_rules      JSONB  DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS producer_notes      TEXT,
  ADD COLUMN IF NOT EXISTS admin_notes         TEXT,
  ADD COLUMN IF NOT EXISTS client_notes        TEXT;

-- 6. Verification link
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'not_required'
    CHECK (verification_status IN (
      'not_required', 'required', 'pending', 'verified', 'rejected'
    ));

-- 7. Update the overlap exclusion constraint to block all active statuses.
--    Drop the existing one first (migration 20260304021532 recreated it in extensions schema).
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS no_overlap;

ALTER TABLE public.bookings
  ADD CONSTRAINT no_overlap EXCLUDE USING gist (
    room_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  ) WHERE (status IN (
    'pending_payment', 'deposit_paid', 'confirmed',
    'verification_required', 'verification_pending', 'ready',
    'checked_in', 'in_progress', 'needs_cleaning'
  ));

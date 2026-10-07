-- Migration: Triggers and Functions
-- Auto-creates cleaning tasks when a booking reaches needs_cleaning status.
-- Logs lifecycle events on every booking status change.
-- Provides buffer-enforcement RPC for availability checks.

-- ========================================================
-- 1. Auto-log booking status changes
-- ========================================================
CREATE OR REPLACE FUNCTION public.fg_log_booking_lifecycle_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.fg_booking_lifecycle_events
      (booking_id, from_status, to_status, changed_by)
    VALUES
      (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS fg_booking_lifecycle_logger ON public.bookings;
CREATE TRIGGER fg_booking_lifecycle_logger
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.fg_log_booking_lifecycle_event();

-- ========================================================
-- 2. Auto-create cleaning task when booking → needs_cleaning
-- ========================================================
CREATE OR REPLACE FUNCTION public.fg_auto_create_cleaning_task()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_buffer_minutes INTEGER := 60;
BEGIN
  IF NEW.status = 'needs_cleaning' AND OLD.status != 'needs_cleaning' THEN
    -- Look up room buffer (default 60 min)
    SELECT COALESCE(buffer_minutes, 60) INTO v_buffer_minutes
    FROM public.fg_room_buffers
    WHERE room_id = NEW.room_id;

    INSERT INTO public.fg_cleaning_tasks
      (booking_id, room_id, status, cleaning_window_start, cleaning_window_end,
       checklist)
    VALUES (
      NEW.id,
      NEW.room_id,
      'pending',
      NEW.end_time,
      NEW.end_time + (v_buffer_minutes || ' minutes')::INTERVAL,
      '[
        {"item": "Clear all rubbish and empty bins", "done": false},
        {"item": "Wipe down desk surfaces and console", "done": false},
        {"item": "Clean microphone stands and pop shields", "done": false},
        {"item": "Vacuum floor", "done": false},
        {"item": "Check and replace any damaged equipment", "done": false},
        {"item": "Restock consumables (tissues, pens, water)", "done": false},
        {"item": "Lock room and mark ready", "done": false}
      ]'::jsonb
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS fg_auto_cleaning_task ON public.bookings;
CREATE TRIGGER fg_auto_cleaning_task
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.fg_auto_create_cleaning_task();

-- ========================================================
-- 3. Auto-set lifecycle timestamps when status changes
-- ========================================================
CREATE OR REPLACE FUNCTION public.fg_set_lifecycle_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    CASE NEW.status
      WHEN 'confirmed'    THEN NEW.confirmed_at  := COALESCE(NEW.confirmed_at,  now());
      WHEN 'checked_in'   THEN NEW.checked_in_at := COALESCE(NEW.checked_in_at, now());
      WHEN 'in_progress'  THEN NEW.started_at    := COALESCE(NEW.started_at,    now());
      WHEN 'completed'    THEN NEW.completed_at  := COALESCE(NEW.completed_at,  now());
      WHEN 'cancelled'    THEN NEW.cancelled_at  := COALESCE(NEW.cancelled_at,  now());
      WHEN 'no_show'      THEN NEW.no_show_at    := COALESCE(NEW.no_show_at,    now());
      ELSE NULL;
    END CASE;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS fg_lifecycle_timestamps ON public.bookings;
CREATE TRIGGER fg_lifecycle_timestamps
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.fg_set_lifecycle_timestamps();

-- ========================================================
-- 4. Buffer enforcement RPC
-- Checks if a room is available for a proposed time window,
-- accounting for room buffer settings.
-- Returns TRUE if the slot is free (including buffer); FALSE if blocked.
-- ========================================================
CREATE OR REPLACE FUNCTION public.fg_check_room_availability(
  _room_id      UUID,
  _start_time   TIMESTAMPTZ,
  _end_time     TIMESTAMPTZ,
  _exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_buffer_minutes INTEGER := 60;
  v_buffered_start TIMESTAMPTZ;
  v_buffered_end   TIMESTAMPTZ;
  v_conflict_count INTEGER;
BEGIN
  -- Get room-specific buffer, fall back to studio default
  SELECT COALESCE(b.buffer_minutes, (
    SELECT (setting_value::text)::integer
    FROM public.fg_studio_settings
    WHERE setting_key = 'default_buffer_minutes'
  ), 60)
  INTO v_buffer_minutes
  FROM public.fg_room_buffers b
  WHERE b.room_id = _room_id;

  v_buffered_start := _start_time  - (v_buffer_minutes || ' minutes')::INTERVAL;
  v_buffered_end   := _end_time    + (v_buffer_minutes || ' minutes')::INTERVAL;

  SELECT COUNT(*) INTO v_conflict_count
  FROM public.bookings
  WHERE room_id = _room_id
    AND id IS DISTINCT FROM _exclude_booking_id
    AND status IN (
      'pending_payment', 'deposit_paid', 'confirmed',
      'verification_required', 'verification_pending', 'ready',
      'checked_in', 'in_progress', 'needs_cleaning'
    )
    AND tstzrange(start_time, end_time) && tstzrange(v_buffered_start, v_buffered_end);

  RETURN v_conflict_count = 0;
END;
$$;

-- ========================================================
-- 5. RPC: get today's room status summary for the ops dashboard
-- ========================================================
CREATE OR REPLACE FUNCTION public.fg_todays_room_status()
RETURNS TABLE (
  room_id       UUID,
  room_name     TEXT,
  room_slug     TEXT,
  room_color    TEXT,
  current_booking_id      UUID,
  current_booking_status  TEXT,
  current_client_user_id  UUID,
  current_session_type    TEXT,
  current_start_time      TIMESTAMPTZ,
  current_end_time        TIMESTAMPTZ,
  next_booking_id         UUID,
  next_start_time         TIMESTAMPTZ,
  assigned_producer_id    UUID,
  cleaning_task_id        UUID,
  cleaning_task_status    TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH now_ts AS (SELECT now() AS ts),
  current_bookings AS (
    SELECT DISTINCT ON (b.room_id)
      b.room_id,
      b.id            AS booking_id,
      b.status        AS booking_status,
      b.user_id       AS client_user_id,
      b.session_type,
      b.start_time,
      b.end_time
    FROM public.bookings b, now_ts n
    WHERE b.status IN ('checked_in', 'in_progress', 'confirmed', 'ready')
      AND b.start_time <= n.ts + INTERVAL '30 minutes'
      AND b.end_time   >= n.ts - INTERVAL '30 minutes'
    ORDER BY b.room_id, b.start_time
  ),
  next_bookings AS (
    SELECT DISTINCT ON (b.room_id)
      b.room_id,
      b.id       AS booking_id,
      b.start_time
    FROM public.bookings b, now_ts n
    WHERE b.status IN ('confirmed', 'ready', 'deposit_paid')
      AND b.start_time > n.ts
    ORDER BY b.room_id, b.start_time
  ),
  producer_assignments AS (
    SELECT DISTINCT ON (a.booking_id)
      a.booking_id,
      a.staff_user_id AS producer_id
    FROM public.fg_booking_assignments a
    WHERE a.assignment_role = 'session_producer'
    ORDER BY a.booking_id, a.created_at DESC
  ),
  active_cleaning AS (
    SELECT DISTINCT ON (ct.room_id)
      ct.room_id,
      ct.id     AS task_id,
      ct.status AS task_status
    FROM public.fg_cleaning_tasks ct
    WHERE ct.status IN ('pending', 'assigned', 'in_progress')
    ORDER BY ct.room_id, ct.created_at DESC
  )
  SELECT
    r.id            AS room_id,
    r.name          AS room_name,
    r.slug          AS room_slug,
    r.color         AS room_color,
    cb.booking_id   AS current_booking_id,
    cb.booking_status,
    cb.client_user_id,
    cb.session_type,
    cb.start_time   AS current_start_time,
    cb.end_time     AS current_end_time,
    nb.booking_id   AS next_booking_id,
    nb.start_time   AS next_start_time,
    pa.producer_id  AS assigned_producer_id,
    ac.task_id      AS cleaning_task_id,
    ac.task_status  AS cleaning_task_status
  FROM public.rooms r
  LEFT JOIN current_bookings  cb ON cb.room_id = r.id
  LEFT JOIN next_bookings     nb ON nb.room_id = r.id
  LEFT JOIN producer_assignments pa ON pa.booking_id = cb.booking_id
  LEFT JOIN active_cleaning   ac ON ac.room_id = r.id
  ORDER BY r.name
$$;

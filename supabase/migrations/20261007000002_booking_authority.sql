CREATE OR REPLACE FUNCTION public.fg_expected_room_booking_amount(
  _room_id UUID,
  _start_time TIMESTAMPTZ,
  _end_time TIMESTAMPTZ,
  _session_type TEXT,
  _notes TEXT
)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room_name TEXT;
  v_hourly_rate NUMERIC;
  v_duration NUMERIC;
  v_engineer BOOLEAN := COALESCE(_notes, '') LIKE '%[Engineer:%';
BEGIN
  IF _end_time <= _start_time THEN
    RETURN NULL;
  END IF;

  SELECT name INTO v_room_name FROM public.rooms WHERE id = _room_id;
  IF v_room_name ILIKE '%recording studio%'
    OR v_room_name ILIKE '%gold room%'
    OR v_room_name ILIKE 'studio a%' THEN
    v_hourly_rate := 12.50;
  ELSIF (v_room_name ILIKE '%multi-use%'
      OR v_room_name ILIKE '%neon suite%'
      OR v_room_name ILIKE 'studio b%'
      OR v_room_name ILIKE 'room 1a%')
      AND _session_type ILIKE '%podcast%' THEN
    v_hourly_rate := 49.99;
  ELSIF v_room_name ILIKE '%multi-use%'
    OR v_room_name ILIKE '%neon suite%'
    OR v_room_name ILIKE 'studio b%'
    OR v_room_name ILIKE 'room 1a%' THEN
    v_hourly_rate := 70.00;
  ELSIF v_room_name ILIKE '%content creation%'
    OR v_room_name ILIKE '%creator hub%'
    OR v_room_name ILIKE 'room 2%' THEN
    v_hourly_rate := 45.00;
  ELSE
    RETURN NULL;
  END IF;

  v_duration := EXTRACT(EPOCH FROM (_end_time - _start_time)) / 3600;
  RETURN ROUND(v_duration * v_hourly_rate + CASE WHEN v_engineer THEN 25.00 ELSE 0 END, 2);
END;
$$;

DROP POLICY IF EXISTS "bookings_insert" ON public.bookings;
CREATE POLICY "bookings_insert" ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (
    public.fg_is_manager_or_above()
    OR (
      auth.uid() = user_id
      AND status = 'pending_payment'
      AND payment_status = 'unpaid'
      AND total_amount = public.fg_expected_room_booking_amount(room_id, start_time, end_time, session_type, notes)
      AND deposit_amount > 0
      AND deposit_amount <= total_amount
      AND outstanding_balance = total_amount - deposit_amount
    )
  );

DROP POLICY IF EXISTS "bookings_update" ON public.bookings;
CREATE POLICY "bookings_update" ON public.bookings
  FOR UPDATE TO authenticated
  USING (public.fg_is_manager_or_above() OR public.fg_is_assigned_to_booking(id))
  WITH CHECK (public.fg_is_manager_or_above() OR public.fg_is_assigned_to_booking(id));

CREATE OR REPLACE FUNCTION public.fg_cancel_own_booking(_booking_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE public.bookings
  SET status = 'cancelled'
  WHERE id = _booking_id
    AND user_id = auth.uid()
    AND status IN ('pending_payment', 'deposit_paid', 'confirmed', 'verification_required', 'verification_pending', 'ready')
    AND start_time > now();

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated = 1;
END;
$$;

REVOKE ALL ON FUNCTION public.fg_cancel_own_booking(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fg_cancel_own_booking(UUID) TO authenticated;

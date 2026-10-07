-- Migration: RLS Policies
-- Replaces legacy family-based booking policies with studio-role-aware policies.
-- Adds RLS to all new fg_ operational tables.
-- IMPORTANT: fg_get_studio_role() helper must exist (migration 20260519000001).

-- ========================================================
-- HELPER: check if current user is assigned to a booking
-- ========================================================
CREATE OR REPLACE FUNCTION public.fg_is_assigned_to_booking(_booking_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.fg_booking_assignments
    WHERE booking_id = _booking_id
      AND staff_user_id = auth.uid()
  )
$$;

-- ========================================================
-- BOOKINGS — update existing policies
-- ========================================================
DROP POLICY IF EXISTS "Users can view own bookings"    ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings"      ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings"  ON public.bookings;

-- Clients see their own; managers/above see all; producers see assigned sessions
CREATE POLICY "bookings_select" ON public.bookings
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.fg_is_manager_or_above()
    OR public.fg_is_assigned_to_booking(id)
  );

-- Clients can create their own bookings; managers can create on behalf of clients
CREATE POLICY "bookings_insert" ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR public.fg_is_manager_or_above()
  );

-- Clients can update own pending bookings; managers can update any booking
CREATE POLICY "bookings_update" ON public.bookings
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    OR public.fg_is_manager_or_above()
    OR public.fg_is_assigned_to_booking(id)
  );

-- Only super_admin can delete bookings
CREATE POLICY "bookings_delete" ON public.bookings
  FOR DELETE TO authenticated
  USING (public.fg_is_super_admin());

-- ========================================================
-- ROOMS — update existing policies (keep public read)
-- ========================================================
DROP POLICY IF EXISTS "Family can manage rooms" ON public.rooms;

CREATE POLICY "rooms_manage" ON public.rooms
  FOR ALL TO authenticated
  USING (public.fg_is_manager_or_above())
  WITH CHECK (public.fg_is_manager_or_above());

-- ========================================================
-- USER_ROLES — update existing policies
-- ========================================================
DROP POLICY IF EXISTS "Roles viewable by authenticated" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own role"       ON public.user_roles;

CREATE POLICY "user_roles_select" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.fg_is_manager_or_above());

-- Only super_admin or the user themselves (for self-registration)
CREATE POLICY "user_roles_insert" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.fg_is_super_admin());

CREATE POLICY "user_roles_update" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.fg_is_super_admin());

-- ========================================================
-- PROFILES — update existing policies
-- ========================================================
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile"  ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"  ON public.profiles;

-- Public profiles are visible to everyone (needed for public site)
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users update own profile; managers can update any profile (e.g. set studio_role)
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.fg_is_manager_or_above());

-- ========================================================
-- fg_room_buffers
-- ========================================================
CREATE POLICY "fg_room_buffers_select" ON public.fg_room_buffers
  FOR SELECT TO authenticated
  USING (public.fg_is_staff());

CREATE POLICY "fg_room_buffers_manage" ON public.fg_room_buffers
  FOR ALL TO authenticated
  USING (public.fg_is_manager_or_above())
  WITH CHECK (public.fg_is_manager_or_above());

-- ========================================================
-- fg_booking_assignments
-- ========================================================
-- Managers see/manage all; producers/cleaners see their own assignments
CREATE POLICY "fg_booking_assignments_select" ON public.fg_booking_assignments
  FOR SELECT TO authenticated
  USING (
    public.fg_is_manager_or_above()
    OR staff_user_id = auth.uid()
  );

CREATE POLICY "fg_booking_assignments_manage" ON public.fg_booking_assignments
  FOR ALL TO authenticated
  USING (public.fg_is_manager_or_above())
  WITH CHECK (public.fg_is_manager_or_above());

CREATE POLICY "fg_booking_assignments_update_self" ON public.fg_booking_assignments
  FOR UPDATE TO authenticated
  USING (staff_user_id = auth.uid());

-- ========================================================
-- fg_booking_lifecycle_events
-- ========================================================
CREATE POLICY "fg_lifecycle_events_select" ON public.fg_booking_lifecycle_events
  FOR SELECT TO authenticated
  USING (
    public.fg_is_manager_or_above()
    OR EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id = booking_id AND user_id = auth.uid()
    )
    OR public.fg_is_assigned_to_booking(booking_id)
  );

CREATE POLICY "fg_lifecycle_events_insert" ON public.fg_booking_lifecycle_events
  FOR INSERT TO authenticated
  WITH CHECK (public.fg_is_staff());

-- ========================================================
-- fg_cleaning_tasks
-- ========================================================
CREATE POLICY "fg_cleaning_tasks_select" ON public.fg_cleaning_tasks
  FOR SELECT TO authenticated
  USING (
    public.fg_is_manager_or_above()
    OR assigned_cleaner_id = auth.uid()
  );

CREATE POLICY "fg_cleaning_tasks_insert" ON public.fg_cleaning_tasks
  FOR INSERT TO authenticated
  WITH CHECK (public.fg_is_manager_or_above());

-- Cleaners can update their own tasks; managers can update all
CREATE POLICY "fg_cleaning_tasks_update" ON public.fg_cleaning_tasks
  FOR UPDATE TO authenticated
  USING (
    public.fg_is_manager_or_above()
    OR assigned_cleaner_id = auth.uid()
  );

-- ========================================================
-- fg_client_verifications
-- ========================================================
CREATE POLICY "fg_verifications_select" ON public.fg_client_verifications
  FOR SELECT TO authenticated
  USING (
    public.fg_is_manager_or_above()
    OR user_id = auth.uid()
  );

CREATE POLICY "fg_verifications_insert" ON public.fg_client_verifications
  FOR INSERT TO authenticated
  WITH CHECK (
    public.fg_is_manager_or_above()
    OR user_id = auth.uid()
  );

-- Clients can update (submit docs); managers can approve/reject
CREATE POLICY "fg_verifications_update" ON public.fg_client_verifications
  FOR UPDATE TO authenticated
  USING (
    public.fg_is_manager_or_above()
    OR user_id = auth.uid()
  );

-- ========================================================
-- fg_email_queue
-- ========================================================
-- Only staff can read email queue; only managers can insert/update
CREATE POLICY "fg_email_queue_select" ON public.fg_email_queue
  FOR SELECT TO authenticated
  USING (public.fg_is_manager_or_above());

CREATE POLICY "fg_email_queue_manage" ON public.fg_email_queue
  FOR ALL TO authenticated
  USING (public.fg_is_manager_or_above())
  WITH CHECK (public.fg_is_manager_or_above());

-- ========================================================
-- fg_incidents
-- ========================================================
-- Managers see all; producers see incidents on assigned sessions;
-- cleaners see cleaning/equipment incidents on their tasks;
-- clients NEVER see incidents unless visible_to_client = true
CREATE POLICY "fg_incidents_select" ON public.fg_incidents
  FOR SELECT TO authenticated
  USING (
    public.fg_is_manager_or_above()
    OR public.fg_is_assigned_to_booking(booking_id)
    OR (
      visible_to_client = true
      AND EXISTS (
        SELECT 1 FROM public.bookings
        WHERE id = booking_id AND user_id = auth.uid()
      )
    )
  );

CREATE POLICY "fg_incidents_insert" ON public.fg_incidents
  FOR INSERT TO authenticated
  WITH CHECK (public.fg_is_staff());

CREATE POLICY "fg_incidents_update" ON public.fg_incidents
  FOR UPDATE TO authenticated
  USING (public.fg_is_manager_or_above());

-- ========================================================
-- fg_session_notes
-- ========================================================
-- admin_only notes: managers only
-- producer notes: managers + assigned producer
-- client_visible notes: managers + booking owner
-- internal notes: all staff
CREATE POLICY "fg_session_notes_select" ON public.fg_session_notes
  FOR SELECT TO authenticated
  USING (
    public.fg_is_manager_or_above()
    OR (
      note_type != 'admin_only'
      AND (
        public.fg_is_assigned_to_booking(booking_id)
        OR (
          note_type = 'client_visible'
          AND EXISTS (
            SELECT 1 FROM public.bookings
            WHERE id = booking_id AND user_id = auth.uid()
          )
        )
      )
    )
  );

CREATE POLICY "fg_session_notes_insert" ON public.fg_session_notes
  FOR INSERT TO authenticated
  WITH CHECK (public.fg_is_staff());

CREATE POLICY "fg_session_notes_update" ON public.fg_session_notes
  FOR UPDATE TO authenticated
  USING (
    author_id = auth.uid()
    OR public.fg_is_manager_or_above()
  );

-- ========================================================
-- fg_studio_settings
-- ========================================================
-- All authenticated staff can read settings; only managers can change
CREATE POLICY "fg_studio_settings_select" ON public.fg_studio_settings
  FOR SELECT TO authenticated
  USING (public.fg_is_staff());

CREATE POLICY "fg_studio_settings_manage" ON public.fg_studio_settings
  FOR ALL TO authenticated
  USING (public.fg_is_manager_or_above())
  WITH CHECK (public.fg_is_manager_or_above());

-- ========================================================
-- fg_ai_call_logs
-- ========================================================
CREATE POLICY "fg_ai_call_logs_select" ON public.fg_ai_call_logs
  FOR SELECT TO authenticated
  USING (public.fg_is_manager_or_above());

CREATE POLICY "fg_ai_call_logs_manage" ON public.fg_ai_call_logs
  FOR ALL TO authenticated
  USING (public.fg_is_manager_or_above())
  WITH CHECK (public.fg_is_manager_or_above());

-- ========================================================
-- QUOTE REQUESTS — update existing family-based policies
-- ========================================================
DROP POLICY IF EXISTS "Family can view quote requests"   ON public.quote_requests;
DROP POLICY IF EXISTS "Family can update quote requests" ON public.quote_requests;

CREATE POLICY "quote_requests_select" ON public.quote_requests
  FOR SELECT TO authenticated
  USING (public.fg_is_manager_or_above());

CREATE POLICY "quote_requests_update" ON public.quote_requests
  FOR UPDATE TO authenticated
  USING (public.fg_is_manager_or_above());

-- ========================================================
-- SESSION_RATINGS — update existing family-based policy
-- ========================================================
DROP POLICY IF EXISTS "Users and family can view ratings" ON public.session_ratings;

CREATE POLICY "session_ratings_select" ON public.session_ratings
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.fg_is_manager_or_above()
  );

-- ========================================================
-- VEHICLE_REGISTRATIONS — update existing family-based policy
-- ========================================================
DROP POLICY IF EXISTS "Family can view vehicles" ON public.vehicle_registrations;

CREATE POLICY "vehicle_registrations_select" ON public.vehicle_registrations
  FOR SELECT TO authenticated
  USING (public.fg_is_manager_or_above());

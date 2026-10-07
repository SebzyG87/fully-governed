-- Migration: Role Assignment Helpers
-- Provides safe server-side functions for assigning studio roles by email.
-- Only super_admin can call these. Never hardcode emails in frontend source.

-- ========================================================
-- 1. Assign a studio_role to a user by their email address.
--    Call from Supabase SQL editor or admin edge function.
--    Only super_admin can invoke this.
-- ========================================================
CREATE OR REPLACE FUNCTION public.fg_assign_studio_role_by_email(
  p_email TEXT,
  p_role  TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id   UUID;
  v_old_role  TEXT;
BEGIN
  -- Caller must be super_admin
  IF public.fg_get_studio_role(auth.uid()) != 'super_admin' THEN
    RAISE EXCEPTION 'Only super_admin can assign studio roles.';
  END IF;

  -- Validate the requested role
  IF p_role NOT IN (
    'super_admin', 'studio_manager', 'session_producer', 'cleaner', 'client_artist'
  ) THEN
    RAISE EXCEPTION 'Invalid studio role: %. Must be one of super_admin, studio_manager, session_producer, cleaner, client_artist.', p_role;
  END IF;

  -- Look up the user by email in auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found with email: %', p_email;
  END IF;

  -- Record old role for return message
  SELECT studio_role INTO v_old_role
  FROM public.profiles
  WHERE user_id = v_user_id;

  -- Update profiles.studio_role
  UPDATE public.profiles
  SET studio_role = p_role,
      updated_at  = now()
  WHERE user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user %. Run the auto-create trigger or manually insert a profile.', v_user_id;
  END IF;

  RETURN format('Assigned %s → %s (was: %s)', p_email, p_role, COALESCE(v_old_role, 'unset'));
END;
$$;

-- ========================================================
-- 2. Bootstrap: assign super_admin to a specific user ID
--    without needing an existing super_admin.
--    Intended for initial owner setup only.
--    Call once from Supabase SQL editor as postgres/service role.
-- ========================================================
CREATE OR REPLACE FUNCTION public.fg_bootstrap_super_admin(_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function intentionally has no auth check — it is for
  -- one-time bootstrap from the Supabase service role / SQL editor.
  -- After setup, revoke or restrict access as needed.
  UPDATE public.profiles
  SET studio_role = 'super_admin',
      updated_at  = now()
  WHERE user_id = _user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user %', _user_id;
  END IF;

  RETURN format('Bootstrapped super_admin for user_id: %s', _user_id);
END;
$$;

-- ========================================================
-- 3. List all staff members with their current studio roles.
--    Only super_admin and studio_manager can call this.
-- ========================================================
CREATE OR REPLACE FUNCTION public.fg_list_staff_roles()
RETURNS TABLE (
  user_id     UUID,
  email       TEXT,
  full_name   TEXT,
  studio_role TEXT,
  updated_at  TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT
    p.user_id,
    u.email,
    p.full_name,
    p.studio_role,
    p.updated_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.user_id
  WHERE p.studio_role IS NOT NULL
    AND public.fg_get_studio_role(auth.uid()) IN ('super_admin', 'studio_manager')
  ORDER BY p.studio_role, p.full_name
$$;

-- ========================================================
-- 4. Revoke a studio role (revert to client_artist)
-- ========================================================
CREATE OR REPLACE FUNCTION public.fg_revoke_studio_role_by_email(p_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF public.fg_get_studio_role(auth.uid()) != 'super_admin' THEN
    RAISE EXCEPTION 'Only super_admin can revoke studio roles.';
  END IF;

  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email LIMIT 1;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found with email: %', p_email;
  END IF;

  UPDATE public.profiles
  SET studio_role = 'client_artist',
      updated_at  = now()
  WHERE user_id = v_user_id;

  RETURN format('Revoked studio role for %s → client_artist', p_email);
END;
$$;

-- Migration: Studio Role Expansion
-- Adds operational studio roles alongside legacy app_role enum.
-- Safe: only adds new enum values; existing rows are untouched.

-- 1. Expand app_role enum with new studio roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'studio_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'session_producer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'cleaner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client_artist';

-- 2. Add studio_role column to profiles as the primary ops-role store.
--    Legacy user_roles table remains for backward compat.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS studio_role TEXT
    CHECK (studio_role IN (
      'super_admin', 'studio_manager', 'session_producer', 'cleaner', 'client_artist'
    ));

-- 3. Core studio role helper: reads studio_role from profiles first,
--    then falls back to mapping legacy user_roles values.
CREATE OR REPLACE FUNCTION public.fg_get_studio_role(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT studio_role FROM public.profiles WHERE user_id = _user_id),
    (SELECT CASE role::text
       WHEN 'creator_admin' THEN 'super_admin'
       WHEN 'family'        THEN 'studio_manager'
       WHEN 'customer'      THEN 'client_artist'
       ELSE 'client_artist'
     END
     FROM public.user_roles
     WHERE user_id = _user_id
     LIMIT 1),
    'client_artist'
  )
$$;

-- 4. Convenience boolean helpers used in RLS policies.
CREATE OR REPLACE FUNCTION public.fg_is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.fg_get_studio_role(auth.uid()) = 'super_admin'
$$;

CREATE OR REPLACE FUNCTION public.fg_is_manager_or_above()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.fg_get_studio_role(auth.uid()) IN ('super_admin', 'studio_manager')
$$;

CREATE OR REPLACE FUNCTION public.fg_is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.fg_get_studio_role(auth.uid()) IN (
    'super_admin', 'studio_manager', 'session_producer', 'cleaner'
  )
$$;

CREATE OR REPLACE FUNCTION public.fg_is_producer()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.fg_get_studio_role(auth.uid()) IN ('super_admin', 'studio_manager', 'session_producer')
$$;

CREATE OR REPLACE FUNCTION public.fg_is_cleaner()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.fg_get_studio_role(auth.uid()) IN ('super_admin', 'studio_manager', 'cleaner')
$$;

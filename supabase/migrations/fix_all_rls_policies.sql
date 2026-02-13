-- ============================================================
-- Run this in: Supabase Dashboard > SQL Editor
-- This ensures ALL RLS policies are in place for faculty users.
-- It's safe to run multiple times (uses IF NOT EXISTS / DROP IF EXISTS).
-- ============================================================

-- ==========================
-- 1. ACTIVITIES TABLE
-- ==========================

-- Make sure RLS is enabled
ALTER TABLE IF EXISTS activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid duplicates, then recreate
DROP POLICY IF EXISTS "Users can view own activities" ON activities;
DROP POLICY IF EXISTS "Users can create activities" ON activities;
DROP POLICY IF EXISTS "Users can update own activities" ON activities;
DROP POLICY IF EXISTS "Users can delete own activities" ON activities;

-- Faculty can SELECT their own activities
CREATE POLICY "Users can view own activities"
  ON activities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Faculty can INSERT (only with their own user_id)
CREATE POLICY "Users can create activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Faculty can UPDATE their own activities
CREATE POLICY "Users can update own activities"
  ON activities FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Faculty can DELETE their own activities
CREATE POLICY "Users can delete own activities"
  ON activities FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ==========================
-- 2. PROFILES TABLE
-- ==========================

ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Faculty can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Faculty can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Faculty can create their own profile (first login)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);


-- ==========================
-- 3. ACHIEVEMENTS TABLE
-- ==========================

ALTER TABLE IF EXISTS achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own achievements" ON achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON achievements;
DROP POLICY IF EXISTS "Users can update own achievements" ON achievements;
DROP POLICY IF EXISTS "Users can delete own achievements" ON achievements;

CREATE POLICY "Users can read own achievements"
  ON achievements FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON achievements FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements"
  ON achievements FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own achievements"
  ON achievements FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ==========================
-- 4. ADMIN POLICIES (using SECURITY DEFINER function)
-- ==========================

DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can read all activities" ON activities;
DROP POLICY IF EXISTS "Admins can update all activities" ON activities;

-- Admin check function (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can read all activities"
  ON activities FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update all activities"
  ON activities FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ==========================
-- 5. MAKE SURE role COLUMN EXISTS
-- ==========================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text NOT NULL DEFAULT 'faculty';
  END IF;
END $$;

-- Done! All RLS policies are now active.

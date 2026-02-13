/*
  # Fix Admin RLS Policies (Recursion-Safe)
  
  The previous admin policies caused infinite recursion because they queried the 
  `profiles` table from within a `profiles` RLS policy. This fix uses a 
  SECURITY DEFINER function that bypasses RLS to check admin status.

  1. Drop any previously created admin policies (if they exist)
  2. Create a SECURITY DEFINER function to check admin role
  3. Create new admin policies using the function
*/

-- Step 1: Drop old policies if they exist (safe to run even if they don't)
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can read all activities" ON activities;
DROP POLICY IF EXISTS "Admins can update all activities" ON activities;

-- Step 2: Create a SECURITY DEFINER function (bypasses RLS for the check)
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

-- Step 3: Create admin policies using the function

-- Admin can read ALL profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT TO authenticated
  USING (public.is_admin());

-- Admin can insert profiles for new faculty
CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- Admin can read ALL activities
CREATE POLICY "Admins can read all activities"
  ON activities FOR SELECT TO authenticated
  USING (public.is_admin());

-- Admin can update ALL activities (approve/reject)
CREATE POLICY "Admins can update all activities"
  ON activities FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

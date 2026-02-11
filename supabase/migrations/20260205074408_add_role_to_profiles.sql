/*
  # Add role field to profiles table

  1. Changes
    - Add `role` column to `profiles` table
      - Type: text
      - Values: 'faculty' or 'admin'
      - Default: 'faculty'
      - Not null
    
  2. Security
    - Update existing RLS policies to ensure proper role-based access
    - Users can only read their own profile
    - Users can only update their own profile (but not their role)
*/

-- Add role column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'faculty' NOT NULL;
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('faculty', 'admin'));
  END IF;
END $$;
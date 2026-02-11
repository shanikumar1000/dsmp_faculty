/*
  # Add Google Scholar Sync Fields

  1. Changes to profiles table
    - `h_index` (integer, default 0) - Hirsch index from Google Scholar
    - `total_publications` (integer, default 0) - Total publications from Scholar
    - `total_citations` (integer, default 0) - Total citations from Scholar
    - `last_scholar_sync` (timestamptz, nullable) - Last sync timestamp

  2. Purpose
    - Store scholar metrics synced from Google Scholar
    - Track when the last sync occurred
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'h_index'
  ) THEN
    ALTER TABLE profiles ADD COLUMN h_index integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'total_publications'
  ) THEN
    ALTER TABLE profiles ADD COLUMN total_publications integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'total_citations'
  ) THEN
    ALTER TABLE profiles ADD COLUMN total_citations integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_scholar_sync'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_scholar_sync timestamptz;
  END IF;
END $$;

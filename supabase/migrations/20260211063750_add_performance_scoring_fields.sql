/*
  # Add Performance Scoring Fields

  1. Changes
    - Add `performance_score` (numeric, 0-100)
    - Add `performance_category` (text)
    - Add `last_analyzed_at` (timestamp)
  
  2. Purpose
    - Store AI-computed performance scores for faculty
    - Track performance category (Excellent, Good, Average, Needs Improvement)
    - Record when analysis was last performed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'performance_score'
  ) THEN
    ALTER TABLE profiles ADD COLUMN performance_score numeric DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'performance_category'
  ) THEN
    ALTER TABLE profiles ADD COLUMN performance_category text DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_analyzed_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_analyzed_at timestamptz DEFAULT NULL;
  END IF;
END $$;

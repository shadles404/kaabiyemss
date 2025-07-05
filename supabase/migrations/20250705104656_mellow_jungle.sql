/*
  # Fix RLS Policy for Exams Table

  1. RLS Policy Updates
    - Fix exams RLS policies to allow proper user access
    - Ensure policies use auth.email() function correctly
    - Add proper INSERT policies with WITH CHECK clauses

  2. Security
    - Users can only access their own data
    - Proper authentication checks
    - Secure policy definitions
*/

-- Fix exams RLS policies
DROP POLICY IF EXISTS "Users can insert their own exams" ON exams;
DROP POLICY IF EXISTS "Users can read their own exams" ON exams;
DROP POLICY IF EXISTS "Users can update their own exams" ON exams;
DROP POLICY IF EXISTS "Users can delete their own exams" ON exams;

-- Create proper RLS policies for exams
CREATE POLICY "Users can insert their own exams"
  ON exams
  FOR INSERT
  TO authenticated
  WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can read their own exams"
  ON exams
  FOR SELECT
  TO authenticated
  USING (user_email = auth.email());

CREATE POLICY "Users can update their own exams"
  ON exams
  FOR UPDATE
  TO authenticated
  USING (user_email = auth.email())
  WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can delete their own exams"
  ON exams
  FOR DELETE
  TO authenticated
  USING (user_email = auth.email());

-- Ensure RLS is enabled on exams table
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- Verify that user_email column exists and is properly configured
DO $$
BEGIN
  -- Check exams table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'exams' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE exams ADD COLUMN user_email text NOT NULL DEFAULT '';
  END IF;
  
  -- Ensure user_email is NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'exams' AND column_name = 'user_email' AND is_nullable = 'YES'
  ) THEN
    -- First update any NULL values
    UPDATE exams SET user_email = 'migration@temp.com' WHERE user_email IS NULL;
    -- Then add NOT NULL constraint
    ALTER TABLE exams ALTER COLUMN user_email SET NOT NULL;
  END IF;
END $$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_exams_user_email ON exams(user_email);
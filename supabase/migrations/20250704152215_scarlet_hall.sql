/*
  # Fix RLS Policies for Multi-User Data

  1. RLS Policy Updates
    - Fix teacher_salaries RLS policies to allow proper user access
    - Fix student_fees RLS policies to allow proper user access
    - Ensure policies use auth.email() function correctly
    - Add proper INSERT policies with WITH CHECK clauses

  2. Security
    - Users can only access their own data
    - Proper authentication checks
    - Secure policy definitions
*/

-- Fix teacher_salaries RLS policies
DROP POLICY IF EXISTS "Users can insert their own teacher salaries" ON teacher_salaries;
DROP POLICY IF EXISTS "Users can read their own teacher salaries" ON teacher_salaries;
DROP POLICY IF EXISTS "Users can update their own teacher salaries" ON teacher_salaries;
DROP POLICY IF EXISTS "Users can delete their own teacher salaries" ON teacher_salaries;

-- Create proper RLS policies for teacher_salaries
CREATE POLICY "Users can insert their own teacher salaries"
  ON teacher_salaries
  FOR INSERT
  TO authenticated
  WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can read their own teacher salaries"
  ON teacher_salaries
  FOR SELECT
  TO authenticated
  USING (user_email = auth.email());

CREATE POLICY "Users can update their own teacher salaries"
  ON teacher_salaries
  FOR UPDATE
  TO authenticated
  USING (user_email = auth.email())
  WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can delete their own teacher salaries"
  ON teacher_salaries
  FOR DELETE
  TO authenticated
  USING (user_email = auth.email());

-- Fix student_fees RLS policies
DROP POLICY IF EXISTS "Users can insert their own student fees" ON student_fees;
DROP POLICY IF EXISTS "Users can read their own student fees" ON student_fees;
DROP POLICY IF EXISTS "Users can update their own student fees" ON student_fees;
DROP POLICY IF EXISTS "Users can delete their own student fees" ON student_fees;

-- Create proper RLS policies for student_fees
CREATE POLICY "Users can insert their own student fees"
  ON student_fees
  FOR INSERT
  TO authenticated
  WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can read their own student fees"
  ON student_fees
  FOR SELECT
  TO authenticated
  USING (user_email = auth.email());

CREATE POLICY "Users can update their own student fees"
  ON student_fees
  FOR UPDATE
  TO authenticated
  USING (user_email = auth.email())
  WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can delete their own student fees"
  ON student_fees
  FOR DELETE
  TO authenticated
  USING (user_email = auth.email());

-- Ensure RLS is enabled on both tables
ALTER TABLE teacher_salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_fees ENABLE ROW LEVEL SECURITY;

-- Verify that user_email columns exist and are properly configured
DO $$
BEGIN
  -- Check teacher_salaries table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'teacher_salaries' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE teacher_salaries ADD COLUMN user_email text NOT NULL DEFAULT '';
  END IF;

  -- Check student_fees table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'student_fees' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE student_fees ADD COLUMN user_email text NOT NULL DEFAULT '';
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_teacher_salaries_user_email ON teacher_salaries(user_email);
CREATE INDEX IF NOT EXISTS idx_student_fees_user_email ON student_fees(user_email);

-- Ensure proper constraints exist
DO $$
BEGIN
  -- Add unique constraint for teacher_salaries (user_email, teacher_id, month_year)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'teacher_salaries' 
    AND constraint_name = 'teacher_salaries_user_email_teacher_month_key'
  ) THEN
    ALTER TABLE teacher_salaries 
    ADD CONSTRAINT teacher_salaries_user_email_teacher_month_key 
    UNIQUE (user_email, teacher_id, month_year);
  END IF;
END $$;
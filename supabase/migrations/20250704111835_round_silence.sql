/*
  # Add user email to all tables for multi-user data separation

  1. Schema Changes
    - Add `user_email` column to all main tables
    - Update existing policies to filter by user email
    - Create new policies for user-specific data access

  2. Security
    - Ensure all data is filtered by authenticated user's email
    - Prevent cross-user data access
    - Server-side enforcement through RLS policies

  3. Tables Updated
    - teachers
    - classes  
    - students
    - teacher_attendance
    - teacher_salaries
    - student_fees
    - exams
    - student_marks
    - student_attendance
*/

-- Add user_email column to all tables
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS user_email text;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS user_email text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS user_email text;
ALTER TABLE teacher_attendance ADD COLUMN IF NOT EXISTS user_email text;
ALTER TABLE teacher_salaries ADD COLUMN IF NOT EXISTS user_email text;
ALTER TABLE student_fees ADD COLUMN IF NOT EXISTS user_email text;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS user_email text;
ALTER TABLE student_marks ADD COLUMN IF NOT EXISTS user_email text;
ALTER TABLE student_attendance ADD COLUMN IF NOT EXISTS user_email text;

-- Create indexes on user_email for better performance
CREATE INDEX IF NOT EXISTS idx_teachers_user_email ON teachers(user_email);
CREATE INDEX IF NOT EXISTS idx_classes_user_email ON classes(user_email);
CREATE INDEX IF NOT EXISTS idx_students_user_email ON students(user_email);
CREATE INDEX IF NOT EXISTS idx_teacher_attendance_user_email ON teacher_attendance(user_email);
CREATE INDEX IF NOT EXISTS idx_teacher_salaries_user_email ON teacher_salaries(user_email);
CREATE INDEX IF NOT EXISTS idx_student_fees_user_email ON student_fees(user_email);
CREATE INDEX IF NOT EXISTS idx_exams_user_email ON exams(user_email);
CREATE INDEX IF NOT EXISTS idx_student_marks_user_email ON student_marks(user_email);
CREATE INDEX IF NOT EXISTS idx_student_attendance_user_email ON student_attendance(user_email);

-- Drop existing policies
DROP POLICY IF EXISTS "Teachers can be read by authenticated users" ON teachers;
DROP POLICY IF EXISTS "Teachers can be inserted by authenticated users" ON teachers;
DROP POLICY IF EXISTS "Teachers can be updated by authenticated users" ON teachers;
DROP POLICY IF EXISTS "Teachers can be deleted by authenticated users" ON teachers;

DROP POLICY IF EXISTS "Classes can be read by authenticated users" ON classes;
DROP POLICY IF EXISTS "Classes can be inserted by authenticated users" ON classes;
DROP POLICY IF EXISTS "Classes can be updated by authenticated users" ON classes;
DROP POLICY IF EXISTS "Classes can be deleted by authenticated users" ON classes;

DROP POLICY IF EXISTS "Students can be read by authenticated users" ON students;
DROP POLICY IF EXISTS "Students can be inserted by authenticated users" ON students;
DROP POLICY IF EXISTS "Students can be updated by authenticated users" ON students;
DROP POLICY IF EXISTS "Students can be deleted by authenticated users" ON students;

DROP POLICY IF EXISTS "Teacher attendance can be read by authenticated users" ON teacher_attendance;
DROP POLICY IF EXISTS "Teacher attendance can be inserted by authenticated users" ON teacher_attendance;
DROP POLICY IF EXISTS "Teacher attendance can be updated by authenticated users" ON teacher_attendance;

DROP POLICY IF EXISTS "Teacher salaries can be read by authenticated users" ON teacher_salaries;
DROP POLICY IF EXISTS "Teacher salaries can be inserted by authenticated users" ON teacher_salaries;
DROP POLICY IF EXISTS "Teacher salaries can be updated by authenticated users" ON teacher_salaries;

DROP POLICY IF EXISTS "Student fees can be read by authenticated users" ON student_fees;
DROP POLICY IF EXISTS "Student fees can be inserted by authenticated users" ON student_fees;
DROP POLICY IF EXISTS "Student fees can be updated by authenticated users" ON student_fees;
DROP POLICY IF EXISTS "Student fees can be deleted by authenticated users" ON student_fees;

DROP POLICY IF EXISTS "Exams can be read by authenticated users" ON exams;
DROP POLICY IF EXISTS "Exams can be inserted by authenticated users" ON exams;
DROP POLICY IF EXISTS "Exams can be updated by authenticated users" ON exams;
DROP POLICY IF EXISTS "Exams can be deleted by authenticated users" ON exams;

DROP POLICY IF EXISTS "Student marks can be read by authenticated users" ON student_marks;
DROP POLICY IF EXISTS "Student marks can be inserted by authenticated users" ON student_marks;
DROP POLICY IF EXISTS "Student marks can be updated by authenticated users" ON student_marks;
DROP POLICY IF EXISTS "Student marks can be deleted by authenticated users" ON student_marks;

DROP POLICY IF EXISTS "Student attendance can be read by authenticated users" ON student_attendance;
DROP POLICY IF EXISTS "Student attendance can be inserted by authenticated users" ON student_attendance;
DROP POLICY IF EXISTS "Student attendance can be updated by authenticated users" ON student_attendance;
DROP POLICY IF EXISTS "Student attendance can be deleted by authenticated users" ON student_attendance;

-- Create new user-specific policies for teachers
CREATE POLICY "Users can read their own teachers"
  ON teachers
  FOR SELECT
  TO authenticated
  USING (user_email = auth.email());

CREATE POLICY "Users can insert their own teachers"
  ON teachers
  FOR INSERT
  TO authenticated
  WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can update their own teachers"
  ON teachers
  FOR UPDATE
  TO authenticated
  USING (user_email = auth.email())
  WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can delete their own teachers"
  ON teachers
  FOR DELETE
  TO authenticated
  USING (user_email = auth.email());

-- Create new user-specific policies for classes
CREATE POLICY "Users can read their own classes"
  ON classes
  FOR SELECT
  TO authenticated
  USING (user_email = auth.email());

CREATE POLICY "Users can insert their own classes"
  ON classes
  FOR INSERT
  TO authenticated
  WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can update their own classes"
  ON classes
  FOR UPDATE
  TO authenticated
  USING (user_email = auth.email())
  WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can delete their own classes"
  ON classes
  FOR DELETE
  TO authenticated
  USING (user_email = auth.email());

-- Create new user-specific policies for students
CREATE POLICY "Users can read their own students"
  ON students
  FOR SELECT
  TO authenticated
  USING (user_email = auth.email());

CREATE POLICY "Users can insert their own students"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can update their own students"
  ON students
  FOR UPDATE
  TO authenticated
  USING (user_email = auth.email())
  WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can delete their own students"
  ON students
  FOR DELETE
  TO authenticated
  USING (user_email = auth.email());

-- Create new user-specific policies for teacher_attendance
CREATE POLICY "Users can read their own teacher attendance"
  ON teacher_attendance
  FOR SELECT
  TO authenticated
  USING (user_email = auth.email());

CREATE POLICY "Users can insert their own teacher attendance"
  ON teacher_attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can update their own teacher attendance"
  ON teacher_attendance
  FOR UPDATE
  TO authenticated
  USING (user_email = auth.email())
  WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can delete their own teacher attendance"
  ON teacher_attendance
  FOR DELETE
  TO authenticated
  USING (user_email = auth.email());

-- Create new user-specific policies for teacher_salaries
CREATE POLICY "Users can read their own teacher salaries"
  ON teacher_salaries
  FOR SELECT
  TO authenticated
  USING (user_email = auth.email());

CREATE POLICY "Users can insert their own teacher salaries"
  ON teacher_salaries
  FOR INSERT
  TO authenticated
  WITH CHECK (user_email = auth.email());

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

-- Create new user-specific policies for student_fees
CREATE POLICY "Users can read their own student fees"
  ON student_fees
  FOR SELECT
  TO authenticated
  USING (user_email = auth.email());

CREATE POLICY "Users can insert their own student fees"
  ON student_fees
  FOR INSERT
  TO authenticated
  WITH CHECK (user_email = auth.email());

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

-- Create new user-specific policies for exams
CREATE POLICY "Users can read their own exams"
  ON exams
  FOR SELECT
  TO authenticated
  USING (user_email = auth.email());

CREATE POLICY "Users can insert their own exams"
  ON exams
  FOR INSERT
  TO authenticated
  WITH CHECK (user_email = auth.email());

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

-- Create new user-specific policies for student_marks
CREATE POLICY "Users can read their own student marks"
  ON student_marks
  FOR SELECT
  TO authenticated
  USING (user_email = auth.email());

CREATE POLICY "Users can insert their own student marks"
  ON student_marks
  FOR INSERT
  TO authenticated
  WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can update their own student marks"
  ON student_marks
  FOR UPDATE
  TO authenticated
  USING (user_email = auth.email())
  WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can delete their own student marks"
  ON student_marks
  FOR DELETE
  TO authenticated
  USING (user_email = auth.email());

-- Create new user-specific policies for student_attendance
CREATE POLICY "Users can read their own student attendance"
  ON student_attendance
  FOR SELECT
  TO authenticated
  USING (user_email = auth.email());

CREATE POLICY "Users can insert their own student attendance"
  ON student_attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can update their own student attendance"
  ON student_attendance
  FOR UPDATE
  TO authenticated
  USING (user_email = auth.email())
  WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can delete their own student attendance"
  ON student_attendance
  FOR DELETE
  TO authenticated
  USING (user_email = auth.email());
/*
  # Create student attendance table

  1. New Tables
    - `student_attendance`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to students)
      - `class_id` (uuid, foreign key to classes)
      - `date` (date)
      - `status` (text: present, absent, late)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `student_attendance` table
    - Add policies for authenticated users to manage attendance data

  3. Indexes
    - Add indexes for better performance on foreign keys and date queries
    - Add unique constraint on student_id + date combination
*/

CREATE TABLE IF NOT EXISTS student_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_student_attendance_student_id ON student_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_student_attendance_class_id ON student_attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_student_attendance_date ON student_attendance(date);
CREATE INDEX IF NOT EXISTS idx_student_attendance_status ON student_attendance(status);

-- Enable RLS
ALTER TABLE student_attendance ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Student attendance can be read by authenticated users"
  ON student_attendance
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Student attendance can be inserted by authenticated users"
  ON student_attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Student attendance can be updated by authenticated users"
  ON student_attendance
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Student attendance can be deleted by authenticated users"
  ON student_attendance
  FOR DELETE
  TO authenticated
  USING (true);
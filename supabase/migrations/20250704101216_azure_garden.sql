/*
  # Exam Management System

  1. New Tables
    - `exams`
      - `id` (uuid, primary key)
      - `title` (text)
      - `class_id` (uuid, foreign key to classes)
      - `subject` (text)
      - `exam_date` (date)
      - `max_marks` (integer)
      - `passing_marks` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `student_marks`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to students)
      - `exam_id` (uuid, foreign key to exams)
      - `marks_obtained` (integer)
      - `remarks` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage exam data

  3. Indexes
    - Add indexes for better performance on foreign keys
    - Add unique constraint on student_id + exam_id combination
*/

-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject text NOT NULL,
  exam_date date NOT NULL,
  max_marks integer NOT NULL CHECK (max_marks > 0),
  passing_marks integer NOT NULL CHECK (passing_marks > 0 AND passing_marks <= max_marks),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create student_marks table
CREATE TABLE IF NOT EXISTS student_marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  marks_obtained integer NOT NULL CHECK (marks_obtained >= 0),
  remarks text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, exam_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_exams_class_id ON exams(class_id);
CREATE INDEX IF NOT EXISTS idx_exams_subject ON exams(subject);
CREATE INDEX IF NOT EXISTS idx_exams_date ON exams(exam_date);
CREATE INDEX IF NOT EXISTS idx_student_marks_student_id ON student_marks(student_id);
CREATE INDEX IF NOT EXISTS idx_student_marks_exam_id ON student_marks(exam_id);

-- Enable RLS
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_marks ENABLE ROW LEVEL SECURITY;

-- Create policies for exams
CREATE POLICY "Exams can be read by authenticated users"
  ON exams
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Exams can be inserted by authenticated users"
  ON exams
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Exams can be updated by authenticated users"
  ON exams
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Exams can be deleted by authenticated users"
  ON exams
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for student_marks
CREATE POLICY "Student marks can be read by authenticated users"
  ON student_marks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Student marks can be inserted by authenticated users"
  ON student_marks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Student marks can be updated by authenticated users"
  ON student_marks
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Student marks can be deleted by authenticated users"
  ON student_marks
  FOR DELETE
  TO authenticated
  USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON exams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_marks_updated_at
  BEFORE UPDATE ON student_marks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
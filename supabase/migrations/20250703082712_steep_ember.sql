/*
  # Create students table

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `full_name` (text)
      - `date_of_birth` (date)
      - `gender` (text with check constraint)
      - `guardian_name` (text)
      - `class_id` (uuid, foreign key to classes)
      - `admission_date` (date)
      - `address` (text)
      - `contact_phone` (text)
      - `contact_email` (text)
      - `photo_url` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `students` table
    - Add policy for authenticated users to read/write student data

  3. Indexes
    - Add index on contact_email for faster lookups
    - Add index on class_id for class-based queries
*/

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  guardian_name text NOT NULL,
  class_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  admission_date date NOT NULL DEFAULT CURRENT_DATE,
  address text NOT NULL,
  contact_phone text NOT NULL,
  contact_email text NOT NULL,
  photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_students_email ON students(contact_email);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE UNIQUE INDEX IF NOT EXISTS students_contact_email_key ON students(contact_email);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Students can be read by authenticated users"
  ON students
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Students can be inserted by authenticated users"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Students can be updated by authenticated users"
  ON students
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Students can be deleted by authenticated users"
  ON students
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
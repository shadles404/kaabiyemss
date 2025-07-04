/*
  # Teacher Management System Tables

  1. New Tables
    - `teachers`
      - `id` (uuid, primary key)
      - `full_name` (text)
      - `gender` (text)
      - `subjects` (text array)
      - `qualification` (text)
      - `contact_phone` (text)
      - `contact_email` (text)
      - `address` (text)
      - `joining_date` (date)
      - `salary` (numeric)
      - `photo_url` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `classes`
      - `id` (uuid, primary key)
      - `name` (text)
      - `section` (text)
      - `teacher_id` (uuid, foreign key)
      - `subjects` (text array)
      - `max_students` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `teacher_attendance`
      - `id` (uuid, primary key)
      - `teacher_id` (uuid, foreign key)
      - `date` (date)
      - `status` (text: present, absent, late)
      - `created_at` (timestamp)

    - `teacher_salaries`
      - `id` (uuid, primary key)
      - `teacher_id` (uuid, foreign key)
      - `amount` (numeric)
      - `payment_date` (date)
      - `month_year` (text)
      - `status` (text: paid, unpaid)
      - `payment_mode` (text: cash, bank, online)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage data
*/

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  subjects text[] NOT NULL DEFAULT '{}',
  qualification text NOT NULL,
  contact_phone text NOT NULL,
  contact_email text UNIQUE NOT NULL,
  address text NOT NULL,
  joining_date date NOT NULL DEFAULT CURRENT_DATE,
  salary numeric(10,2) NOT NULL DEFAULT 0,
  photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  section text NOT NULL,
  teacher_id uuid REFERENCES teachers(id) ON DELETE SET NULL,
  subjects text[] NOT NULL DEFAULT '{}',
  max_students integer NOT NULL DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(name, section)
);

-- Create teacher_attendance table
CREATE TABLE IF NOT EXISTS teacher_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(teacher_id, date)
);

-- Create teacher_salaries table
CREATE TABLE IF NOT EXISTS teacher_salaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  payment_date date,
  month_year text NOT NULL,
  status text NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid')),
  payment_mode text CHECK (payment_mode IN ('cash', 'bank', 'online')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(teacher_id, month_year)
);

-- Enable RLS
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_salaries ENABLE ROW LEVEL SECURITY;

-- Create policies for teachers
CREATE POLICY "Teachers can be read by authenticated users"
  ON teachers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can be inserted by authenticated users"
  ON teachers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Teachers can be updated by authenticated users"
  ON teachers
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can be deleted by authenticated users"
  ON teachers
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for classes
CREATE POLICY "Classes can be read by authenticated users"
  ON classes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Classes can be inserted by authenticated users"
  ON classes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Classes can be updated by authenticated users"
  ON classes
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Classes can be deleted by authenticated users"
  ON classes
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for teacher_attendance
CREATE POLICY "Teacher attendance can be read by authenticated users"
  ON teacher_attendance
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teacher attendance can be inserted by authenticated users"
  ON teacher_attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Teacher attendance can be updated by authenticated users"
  ON teacher_attendance
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policies for teacher_salaries
CREATE POLICY "Teacher salaries can be read by authenticated users"
  ON teacher_salaries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teacher salaries can be inserted by authenticated users"
  ON teacher_salaries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Teacher salaries can be updated by authenticated users"
  ON teacher_salaries
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teachers_email ON teachers(contact_email);
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_attendance_teacher_date ON teacher_attendance(teacher_id, date);
CREATE INDEX IF NOT EXISTS idx_teacher_salaries_teacher_month ON teacher_salaries(teacher_id, month_year);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
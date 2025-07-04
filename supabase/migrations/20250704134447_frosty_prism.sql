/*
  # Fix Multi-User Data Separation - Update Unique Constraints

  1. Schema Updates
    - Update unique constraints to include user_email
    - Ensure all tables properly isolate data by user
    - Fix any constraint conflicts that prevent multi-user usage

  2. Tables Updated
    - teachers: (user_email, contact_email)
    - classes: (user_email, name, section)
    - students: (user_email, contact_email)
    - teacher_attendance: (user_email, teacher_id, date)
    - teacher_salaries: (user_email, teacher_id, month_year)
    - exams: No unique constraint needed beyond primary key
    - student_marks: (user_email, student_id, exam_id)
    - student_attendance: (user_email, student_id, date)
    - student_fees: No additional unique constraints needed

  3. Security
    - Maintain all existing RLS policies
    - Ensure data isolation is complete
*/

-- Drop existing unique constraints that don't include user_email
ALTER TABLE teachers DROP CONSTRAINT IF EXISTS teachers_contact_email_key;
ALTER TABLE classes DROP CONSTRAINT IF EXISTS classes_name_section_key;
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_contact_email_key;
ALTER TABLE teacher_attendance DROP CONSTRAINT IF EXISTS teacher_attendance_teacher_id_date_key;
ALTER TABLE teacher_salaries DROP CONSTRAINT IF EXISTS teacher_salaries_teacher_id_month_year_key;
ALTER TABLE student_marks DROP CONSTRAINT IF EXISTS student_marks_student_id_exam_id_key;
ALTER TABLE student_attendance DROP CONSTRAINT IF EXISTS student_attendance_student_id_date_key;

-- Drop any remaining indexes that might conflict
DROP INDEX IF EXISTS teachers_contact_email_key;
DROP INDEX IF EXISTS classes_name_section_key;
DROP INDEX IF EXISTS students_contact_email_key;
DROP INDEX IF EXISTS teacher_attendance_teacher_id_date_key;
DROP INDEX IF EXISTS teacher_salaries_teacher_id_month_year_key;
DROP INDEX IF EXISTS student_marks_student_id_exam_id_key;
DROP INDEX IF EXISTS student_attendance_student_id_date_key;

-- Add NOT NULL constraints to user_email columns where missing
DO $$
BEGIN
  -- Check and update teachers table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teachers' AND column_name = 'user_email' AND is_nullable = 'YES'
  ) THEN
    -- First update any NULL values (shouldn't exist in production)
    UPDATE teachers SET user_email = 'migration@temp.com' WHERE user_email IS NULL;
    -- Then add NOT NULL constraint
    ALTER TABLE teachers ALTER COLUMN user_email SET NOT NULL;
  END IF;

  -- Check and update classes table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'classes' AND column_name = 'user_email' AND is_nullable = 'YES'
  ) THEN
    UPDATE classes SET user_email = 'migration@temp.com' WHERE user_email IS NULL;
    ALTER TABLE classes ALTER COLUMN user_email SET NOT NULL;
  END IF;

  -- Check and update students table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'students' AND column_name = 'user_email' AND is_nullable = 'YES'
  ) THEN
    UPDATE students SET user_email = 'migration@temp.com' WHERE user_email IS NULL;
    ALTER TABLE students ALTER COLUMN user_email SET NOT NULL;
  END IF;

  -- Check and update teacher_attendance table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teacher_attendance' AND column_name = 'user_email' AND is_nullable = 'YES'
  ) THEN
    UPDATE teacher_attendance SET user_email = 'migration@temp.com' WHERE user_email IS NULL;
    ALTER TABLE teacher_attendance ALTER COLUMN user_email SET NOT NULL;
  END IF;

  -- Check and update teacher_salaries table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teacher_salaries' AND column_name = 'user_email' AND is_nullable = 'YES'
  ) THEN
    UPDATE teacher_salaries SET user_email = 'migration@temp.com' WHERE user_email IS NULL;
    ALTER TABLE teacher_salaries ALTER COLUMN user_email SET NOT NULL;
  END IF;

  -- Check and update student_fees table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'student_fees' AND column_name = 'user_email' AND is_nullable = 'YES'
  ) THEN
    UPDATE student_fees SET user_email = 'migration@temp.com' WHERE user_email IS NULL;
    ALTER TABLE student_fees ALTER COLUMN user_email SET NOT NULL;
  END IF;

  -- Check and update exams table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'exams' AND column_name = 'user_email' AND is_nullable = 'YES'
  ) THEN
    UPDATE exams SET user_email = 'migration@temp.com' WHERE user_email IS NULL;
    ALTER TABLE exams ALTER COLUMN user_email SET NOT NULL;
  END IF;

  -- Check and update student_marks table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'student_marks' AND column_name = 'user_email' AND is_nullable = 'YES'
  ) THEN
    UPDATE student_marks SET user_email = 'migration@temp.com' WHERE user_email IS NULL;
    ALTER TABLE student_marks ALTER COLUMN user_email SET NOT NULL;
  END IF;

  -- Check and update student_attendance table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'student_attendance' AND column_name = 'user_email' AND is_nullable = 'YES'
  ) THEN
    UPDATE student_attendance SET user_email = 'migration@temp.com' WHERE user_email IS NULL;
    ALTER TABLE student_attendance ALTER COLUMN user_email SET NOT NULL;
  END IF;
END $$;

-- Create new unique constraints that include user_email

-- Teachers: Allow same email across different users
ALTER TABLE teachers ADD CONSTRAINT teachers_user_email_contact_email_key 
UNIQUE (user_email, contact_email);

-- Classes: Allow same class name/section across different users
ALTER TABLE classes ADD CONSTRAINT classes_user_email_name_section_key 
UNIQUE (user_email, name, section);

-- Students: Allow same email across different users
ALTER TABLE students ADD CONSTRAINT students_user_email_contact_email_key 
UNIQUE (user_email, contact_email);

-- Teacher Attendance: Allow same teacher/date across different users
ALTER TABLE teacher_attendance ADD CONSTRAINT teacher_attendance_user_email_teacher_date_key 
UNIQUE (user_email, teacher_id, date);

-- Teacher Salaries: Allow same teacher/month across different users
ALTER TABLE teacher_salaries ADD CONSTRAINT teacher_salaries_user_email_teacher_month_key 
UNIQUE (user_email, teacher_id, month_year);

-- Student Marks: Allow same student/exam across different users
ALTER TABLE student_marks ADD CONSTRAINT student_marks_user_email_student_exam_key 
UNIQUE (user_email, student_id, exam_id);

-- Student Attendance: Allow same student/date across different users
ALTER TABLE student_attendance ADD CONSTRAINT student_attendance_user_email_student_date_key 
UNIQUE (user_email, student_id, date);

-- Add additional indexes for better performance with user-scoped queries
CREATE INDEX IF NOT EXISTS idx_teachers_user_email_name ON teachers(user_email, full_name);
CREATE INDEX IF NOT EXISTS idx_classes_user_email_teacher ON classes(user_email, teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_user_email_class ON students(user_email, class_id);
CREATE INDEX IF NOT EXISTS idx_exams_user_email_class_subject ON exams(user_email, class_id, subject);

-- Verify RLS policies are still in place (they should be, but let's ensure)
DO $$
BEGIN
  -- Ensure RLS is enabled on all tables
  ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
  ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE students ENABLE ROW LEVEL SECURITY;
  ALTER TABLE teacher_attendance ENABLE ROW LEVEL SECURITY;
  ALTER TABLE teacher_salaries ENABLE ROW LEVEL SECURITY;
  ALTER TABLE student_fees ENABLE ROW LEVEL SECURITY;
  ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
  ALTER TABLE student_marks ENABLE ROW LEVEL SECURITY;
  ALTER TABLE student_attendance ENABLE ROW LEVEL SECURITY;
END $$;
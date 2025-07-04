/*
  # Create student fees table

  1. New Tables
    - `student_fees`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to students)
      - `fee_type` (text)
      - `amount` (numeric)
      - `due_date` (date)
      - `payment_date` (date, optional)
      - `status` (text: paid, unpaid, partial)
      - `payment_mode` (text: cash, bank, online)
      - `description` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `student_fees` table
    - Add policies for authenticated users to manage fee data

  3. Indexes
    - Add index on student_id for faster lookups
    - Add index on status for filtering
    - Add index on due_date for date-based queries
*/

CREATE TABLE IF NOT EXISTS student_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fee_type text NOT NULL,
  amount numeric(10,2) NOT NULL,
  due_date date NOT NULL,
  payment_date date,
  status text NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid', 'partial')),
  payment_mode text CHECK (payment_mode IN ('cash', 'bank', 'online')),
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_student_fees_student_id ON student_fees(student_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_status ON student_fees(status);
CREATE INDEX IF NOT EXISTS idx_student_fees_due_date ON student_fees(due_date);

-- Enable RLS
ALTER TABLE student_fees ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Student fees can be read by authenticated users"
  ON student_fees
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Student fees can be inserted by authenticated users"
  ON student_fees
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Student fees can be updated by authenticated users"
  ON student_fees
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Student fees can be deleted by authenticated users"
  ON student_fees
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_student_fees_updated_at
  BEFORE UPDATE ON student_fees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
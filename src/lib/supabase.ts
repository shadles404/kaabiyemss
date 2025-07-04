import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types with user_email included
export type Teacher = {
  id: string;
  full_name: string;
  gender: 'male' | 'female' | 'other';
  subjects: string[];
  qualification: string;
  contact_phone: string;
  contact_email: string;
  address: string;
  joining_date: string;
  salary: number;
  photo_url?: string;
  created_at: string;
  updated_at: string;
  user_email: string;
};

export type Class = {
  id: string;
  name: string;
  section: string;
  teacher_id?: string;
  subjects: string[];
  max_students: number;
  created_at: string;
  updated_at: string;
  user_email: string;
  teacher?: Teacher;
};

export type Student = {
  id: string;
  full_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  guardian_name: string;
  class_id?: string;
  admission_date: string;
  address: string;
  contact_phone: string;
  contact_email: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
  user_email: string;
  class?: Class;
};

export type TeacherAttendance = {
  id: string;
  teacher_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  created_at: string;
  user_email: string;
  teacher?: Teacher;
};

export type StudentAttendance = {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  created_at: string;
  user_email: string;
  student?: Student;
  class?: Class;
};

export type TeacherSalary = {
  id: string;
  teacher_id: string;
  amount: number;
  payment_date?: string;
  month_year: string;
  status: 'paid' | 'unpaid';
  payment_mode?: 'cash' | 'bank' | 'online';
  created_at: string;
  user_email: string;
  teacher?: Teacher;
};

export type StudentFee = {
  id: string;
  student_id: string;
  fee_type: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: 'paid' | 'unpaid' | 'partial';
  payment_mode?: 'cash' | 'bank' | 'online';
  description?: string;
  created_at: string;
  updated_at: string;
  user_email: string;
  student?: Student;
};

export type Exam = {
  id: string;
  title: string;
  class_id: string;
  subject: string;
  exam_date: string;
  max_marks: number;
  passing_marks: number;
  created_at: string;
  updated_at: string;
  user_email: string;
  class?: Class;
};

export type StudentMark = {
  id: string;
  student_id: string;
  exam_id: string;
  marks_obtained: number;
  remarks?: string;
  created_at: string;
  updated_at: string;
  user_email: string;
  student?: Student;
  exam?: Exam;
};

// Helper functions for user-scoped database operations
export const createUserScopedQuery = (tableName: string, userEmail: string) => {
  if (!userEmail) {
    throw new Error('User email is required for database operations');
  }
  
  return supabase
    .from(tableName)
    .select('*')
    .eq('user_email', userEmail);
};

export const insertWithUserEmail = async (
  tableName: string, 
  data: Record<string, any>, 
  userEmail: string
) => {
  if (!userEmail) {
    throw new Error('User email is required for database operations');
  }

  return supabase
    .from(tableName)
    .insert([{ ...data, user_email: userEmail }])
    .select();
};

export const updateWithUserEmail = async (
  tableName: string,
  id: string,
  data: Record<string, any>,
  userEmail: string
) => {
  if (!userEmail) {
    throw new Error('User email is required for database operations');
  }

  return supabase
    .from(tableName)
    .update(data)
    .eq('id', id)
    .eq('user_email', userEmail)
    .select();
};

export const deleteWithUserEmail = async (
  tableName: string,
  id: string,
  userEmail: string
) => {
  if (!userEmail) {
    throw new Error('User email is required for database operations');
  }

  return supabase
    .from(tableName)
    .delete()
    .eq('id', id)
    .eq('user_email', userEmail);
};
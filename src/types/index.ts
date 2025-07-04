// Common Types
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  avatar?: string;
};

export type Student = {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  guardianName: string;
  classId: string;
  className?: string;
  admissionDate: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  photo?: string;
};

export type Teacher = {
  id: string;
  fullName: string;
  gender: 'male' | 'female' | 'other';
  subjects: string[];
  qualification: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  joiningDate: string;
  salary: number;
  photo?: string;
};

export type Class = {
  id: string;
  name: string;
  section: string;
  teacherId: string;
  teacherName?: string;
  subjects: string[];
  maxStudents: number;
};

export type StudentAttendance = {
  id: string;
  date: string;
  classId: string;
  studentId: string;
  status: 'present' | 'absent' | 'late';
};

export type TeacherAttendance = {
  id: string;
  date: string;
  teacherId: string;
  status: 'present' | 'absent' | 'late';
};

export type Fee = {
  id: string;
  studentId: string;
  studentName?: string;
  feeType: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'unpaid' | 'partial';
  paymentMode?: 'cash' | 'bank' | 'online';
};

export type Salary = {
  id: string;
  teacherId: string;
  teacherName?: string;
  amount: number;
  month: string;
  payDate?: string;
  status: 'paid' | 'unpaid';
  paymentMode?: 'cash' | 'bank' | 'online';
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  date: string;
  read: boolean;
};

export type DashboardStats = {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  attendance: {
    students: number;
    teachers: number;
  };
  financials: {
    pendingFees: number;
    paidFees: number;
    salariesPaid: number;
  };
};
import { 
  User, 
  Student, 
  Teacher, 
  Class, 
  StudentAttendance, 
  TeacherAttendance, 
  Fee, 
  Salary, 
  Notification,
  DashboardStats
} from '../types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@school.com',
    role: 'admin',
  },
  {
    id: 'user-2',
    name: 'Teacher One',
    email: 'teacher1@school.com',
    role: 'teacher',
  }
];

// Mock Students
export const mockStudents: Student[] = [
  {
    id: 'student-1',
    fullName: 'John Smith',
    dateOfBirth: '2010-05-15',
    gender: 'male',
    guardianName: 'Robert Smith',
    classId: 'class-1',
    className: 'Grade 5',
    admissionDate: '2022-01-10',
    address: '123 Main St, Anytown',
    contactPhone: '555-123-4567',
    contactEmail: 'parent@example.com',
    photo: 'https://images.pexels.com/photos/3771180/pexels-photo-3771180.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    id: 'student-2',
    fullName: 'Sarah Johnson',
    dateOfBirth: '2011-08-22',
    gender: 'female',
    guardianName: 'Michael Johnson',
    classId: 'class-1',
    className: 'Grade 5',
    admissionDate: '2022-01-15',
    address: '456 Oak St, Anytown',
    contactPhone: '555-234-5678',
    contactEmail: 'johnson@example.com',
    photo: 'https://images.pexels.com/photos/3771743/pexels-photo-3771743.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    id: 'student-3',
    fullName: 'Mohammed Ali',
    dateOfBirth: '2010-02-10',
    gender: 'male',
    guardianName: 'Farid Ali',
    classId: 'class-2',
    className: 'Grade 6',
    admissionDate: '2022-01-05',
    address: '789 Pine St, Anytown',
    contactPhone: '555-345-6789',
    contactEmail: 'ali@example.com',
  },
];

// Mock Teachers
export const mockTeachers: Teacher[] = [
  {
    id: 'teacher-1',
    fullName: 'Ms. Jennifer Davis',
    gender: 'female',
    subjects: ['Mathematics', 'Science'],
    qualification: 'M.Sc. Mathematics',
    contactPhone: '555-987-6543',
    contactEmail: 'davis@school.com',
    address: '101 Teacher Lane, Anytown',
    joiningDate: '2020-08-15',
    salary: 45000,
    photo: 'https://images.pexels.com/photos/3785424/pexels-photo-3785424.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    id: 'teacher-2',
    fullName: 'Mr. Robert Wilson',
    gender: 'male',
    subjects: ['English', 'History'],
    qualification: 'M.A. Literature',
    contactPhone: '555-876-5432',
    contactEmail: 'wilson@school.com',
    address: '202 Faculty Road, Anytown',
    joiningDate: '2019-07-10',
    salary: 48000,
    photo: 'https://images.pexels.com/photos/5212650/pexels-photo-5212650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
];

// Mock Classes
export const mockClasses: Class[] = [
  {
    id: 'class-1',
    name: 'Grade 5',
    section: 'A',
    teacherId: 'teacher-1',
    teacherName: 'Ms. Jennifer Davis',
    subjects: ['Mathematics', 'Science', 'English', 'History', 'Geography'],
    maxStudents: 30,
  },
  {
    id: 'class-2',
    name: 'Grade 6',
    section: 'B',
    teacherId: 'teacher-2',
    teacherName: 'Mr. Robert Wilson',
    subjects: ['English', 'History', 'Mathematics', 'Science', 'Art'],
    maxStudents: 25,
  },
];

// Mock Student Attendance
export const mockStudentAttendance: StudentAttendance[] = [
  {
    id: 'sa-1',
    date: '2023-05-01',
    classId: 'class-1',
    studentId: 'student-1',
    status: 'present',
  },
  {
    id: 'sa-2',
    date: '2023-05-01',
    classId: 'class-1',
    studentId: 'student-2',
    status: 'absent',
  },
  {
    id: 'sa-3',
    date: '2023-05-02',
    classId: 'class-1',
    studentId: 'student-1',
    status: 'present',
  },
  {
    id: 'sa-4',
    date: '2023-05-02',
    classId: 'class-1',
    studentId: 'student-2',
    status: 'present',
  },
];

// Mock Teacher Attendance
export const mockTeacherAttendance: TeacherAttendance[] = [
  {
    id: 'ta-1',
    date: '2023-05-01',
    teacherId: 'teacher-1',
    status: 'present',
  },
  {
    id: 'ta-2',
    date: '2023-05-01',
    teacherId: 'teacher-2',
    status: 'present',
  },
  {
    id: 'ta-3',
    date: '2023-05-02',
    teacherId: 'teacher-1',
    status: 'absent',
  },
  {
    id: 'ta-4',
    date: '2023-05-02',
    teacherId: 'teacher-2',
    status: 'present',
  },
];

// Mock Fees
export const mockFees: Fee[] = [
  {
    id: 'fee-1',
    studentId: 'student-1',
    studentName: 'John Smith',
    feeType: 'Tuition',
    amount: 5000,
    dueDate: '2023-05-15',
    paidDate: '2023-05-10',
    status: 'paid',
    paymentMode: 'bank',
  },
  {
    id: 'fee-2',
    studentId: 'student-2',
    studentName: 'Sarah Johnson',
    feeType: 'Tuition',
    amount: 5000,
    dueDate: '2023-05-15',
    status: 'unpaid',
  },
  {
    id: 'fee-3',
    studentId: 'student-1',
    studentName: 'John Smith',
    feeType: 'Lab',
    amount: 1000,
    dueDate: '2023-05-20',
    status: 'unpaid',
  },
];

// Mock Salaries
export const mockSalaries: Salary[] = [
  {
    id: 'salary-1',
    teacherId: 'teacher-1',
    teacherName: 'Ms. Jennifer Davis',
    amount: 45000,
    month: 'April 2023',
    payDate: '2023-04-28',
    status: 'paid',
    paymentMode: 'bank',
  },
  {
    id: 'salary-2',
    teacherId: 'teacher-2',
    teacherName: 'Mr. Robert Wilson',
    amount: 48000,
    month: 'April 2023',
    payDate: '2023-04-28',
    status: 'paid',
    paymentMode: 'bank',
  },
  {
    id: 'salary-3',
    teacherId: 'teacher-1',
    teacherName: 'Ms. Jennifer Davis',
    amount: 45000,
    month: 'May 2023',
    status: 'unpaid',
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notification-1',
    title: 'Fee Reminder',
    message: 'Upcoming fee deadline for John Smith on May 15th',
    type: 'warning',
    date: '2023-05-01',
    read: false,
  },
  {
    id: 'notification-2',
    title: 'New Student',
    message: 'New student Mohammed Ali has been registered',
    type: 'info',
    date: '2023-05-02',
    read: true,
  },
  {
    id: 'notification-3',
    title: 'Attendance Alert',
    message: 'Sarah Johnson was absent today',
    type: 'error',
    date: '2023-05-01',
    read: false,
  },
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalStudents: 43,
  totalTeachers: 12,
  totalClasses: 6,
  attendance: {
    students: 95, // Percentage
    teachers: 100, // Percentage
  },
  financials: {
    pendingFees: 125000,
    paidFees: 450000,
    salariesPaid: 375000,
  },
};
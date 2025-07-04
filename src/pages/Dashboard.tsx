import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  ClipboardList,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  UserPlus,
  BookPlus,
  FileText
} from 'lucide-react';
import { supabase, Student, Teacher, Class } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import UserDataGuard from '../components/common/UserDataGuard';

interface DashboardStats {
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
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    attendance: { students: 0, teachers: 0 },
    financials: { pendingFees: 0, paidFees: 0, salariesPaid: 0 }
  });
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);
  const [recentTeachers, setRecentTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.email) {
      fetchDashboardData();
    }
  }, [user?.email]);

  const fetchDashboardData = async () => {
    if (!user?.email) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      // Fetch counts - RLS will automatically filter by user email
      const [studentsResponse, teachersResponse, classesResponse] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('teachers').select('*', { count: 'exact', head: true }),
        supabase.from('classes').select('*', { count: 'exact', head: true })
      ]);

      // Fetch recent students - RLS will automatically filter by user email
      const { data: studentsData } = await supabase
        .from('students')
        .select(`
          *,
          class:classes(name, section)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent teachers - RLS will automatically filter by user email
      const { data: teachersData } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Calculate teacher attendance (last 30 days) - RLS will automatically filter by user email
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: attendanceData } = await supabase
        .from('teacher_attendance')
        .select('status')
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

      const presentCount = attendanceData?.filter(a => a.status === 'present').length || 0;
      const totalAttendance = attendanceData?.length || 0;
      const attendancePercentage = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;

      // Calculate salary stats - RLS will automatically filter by user email
      const { data: salaryData } = await supabase
        .from('teacher_salaries')
        .select('amount, status');

      const paidSalaries = salaryData?.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.amount, 0) || 0;

      // Calculate fee stats - RLS will automatically filter by user email
      const { data: feeData } = await supabase
        .from('student_fees')
        .select('amount, status');

      const paidFees = feeData?.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0) || 0;
      const pendingFees = feeData?.filter(f => f.status === 'unpaid').reduce((sum, f) => sum + f.amount, 0) || 0;

      setStats({
        totalStudents: studentsResponse.count || 0,
        totalTeachers: teachersResponse.count || 0,
        totalClasses: classesResponse.count || 0,
        attendance: {
          students: 95, // This would need actual calculation from student_attendance
          teachers: attendancePercentage,
        },
        financials: {
          pendingFees,
          paidFees,
          salariesPaid: paidSalaries,
        },
      });

      setRecentStudents(studentsData || []);
      setRecentTeachers(teachersData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <UserDataGuard>
      <div className="pb-16 md:pb-0">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.user_metadata?.full_name || user?.email}</p>
          </div>
          <div className="text-xs text-gray-400">
            Your private school management system
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Students */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Your Students</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.totalStudents}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/students" className="font-medium text-blue-600 hover:text-blue-500">
                  View all
                </Link>
              </div>
            </div>
          </div>

          {/* Total Teachers */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <GraduationCap className="h-6 w-6 text-teal-600" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Your Teachers</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.totalTeachers}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/teachers" className="font-medium text-teal-600 hover:text-teal-500">
                  View all
                </Link>
              </div>
            </div>
          </div>

          {/* Teacher Attendance */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Teacher Attendance</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.attendance.teachers}%</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/teacher-attendance" className="font-medium text-indigo-600 hover:text-indigo-500">
                  View details
                </Link>
              </div>
            </div>
          </div>

          {/* Salaries Paid */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-green-600" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Salaries Paid</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">${stats.financials.salariesPaid.toLocaleString()}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/teacher-salary" className="font-medium text-green-600 hover:text-green-500">
                  View all
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Link
              to="/students/new"
              className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-500 hover:text-blue-500"
            >
              <UserPlus className="mb-2 h-6 w-6" />
              <span className="text-sm">Add Student</span>
            </Link>
            <Link
              to="/teachers/new"
              className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-500 hover:text-blue-500"
            >
              <GraduationCap className="mb-2 h-6 w-6" />
              <span className="text-sm">Add Teacher</span>
            </Link>
            <Link
              to="/classes/new"
              className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-500 hover:text-blue-500"
            >
              <BookPlus className="mb-2 h-6 w-6" />
              <span className="text-sm">Add Class</span>
            </Link>
            <Link
              to="/reports"
              className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-500 hover:text-blue-500"
            >
              <FileText className="mb-2 h-6 w-6" />
              <span className="text-sm">Generate Report</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Recent Students */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Students</h3>
            </div>
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto">
                <div className="inline-block min-w-full py-2 align-middle">
                  <div className="overflow-hidden border-b border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Class
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {recentStudents.map((student) => (
                          <tr key={student.id}>
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  {student.photo_url ? (
                                    <img
                                      className="h-10 w-10 rounded-full object-cover"
                                      src={student.photo_url}
                                      alt={student.full_name}
                                    />
                                  ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                                      {student.full_name.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              {student.class ? `${student.class.name} - ${student.class.section}` : 'Not assigned'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
              <div className="text-sm">
                <Link to="/students" className="font-medium text-blue-600 hover:text-blue-500">
                  View all students
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Teachers */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Teachers</h3>
            </div>
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto">
                <div className="inline-block min-w-full py-2 align-middle">
                  <div className="overflow-hidden border-b border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Subjects
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {recentTeachers.map((teacher) => (
                          <tr key={teacher.id}>
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  {teacher.photo_url ? (
                                    <img
                                      className="h-10 w-10 rounded-full object-cover"
                                      src={teacher.photo_url}
                                      alt={teacher.full_name}
                                    />
                                  ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                                      {teacher.full_name.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{teacher.full_name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {teacher.subjects.slice(0, 2).map((subject) => (
                                  <span
                                    key={subject}
                                    className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800"
                                  >
                                    {subject}
                                  </span>
                                ))}
                                {teacher.subjects.length > 2 && (
                                  <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
                                    +{teacher.subjects.length - 2}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
              <div className="text-sm">
                <Link to="/teachers" className="font-medium text-blue-600 hover:text-blue-500">
                  View all teachers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserDataGuard>
  );
};

export default Dashboard;
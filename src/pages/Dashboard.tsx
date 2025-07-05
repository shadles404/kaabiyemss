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
  FileText,
  Activity,
  Zap,
  Target,
  Cpu
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
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

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

  const quickActions = [
    { id: 'add-student', icon: UserPlus, label: 'Add Student', href: '/students/new', color: 'from-cyan-400 to-blue-500' },
    { id: 'add-teacher', icon: GraduationCap, label: 'Add Teacher', href: '/teachers/new', color: 'from-purple-400 to-pink-500' },
    { id: 'add-class', icon: BookPlus, label: 'Add Class', href: '/classes/new', color: 'from-green-400 to-emerald-500' },
    { id: 'reports', icon: FileText, label: 'Reports', href: '/reports', color: 'from-orange-400 to-red-500' },
  ];

  const statsCards = [
    {
      id: 'students',
      title: 'Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'from-cyan-400 to-blue-500',
      href: '/students',
      description: 'Total enrolled students'
    },
    {
      id: 'teachers',
      title: 'Teachers',
      value: stats.totalTeachers,
      icon: GraduationCap,
      color: 'from-purple-400 to-pink-500',
      href: '/teachers',
      description: 'Active teaching staff'
    },
    {
      id: 'attendance',
      title: 'Attendance',
      value: stats.attendance.teachers,
      icon: Calendar,
      color: 'from-green-400 to-emerald-500',
      href: '/teacher-attendance',
      description: 'Teacher attendance rate',
      suffix: '%'
    },
    {
      id: 'revenue',
      title: 'Revenue',
      value: Math.round(stats.financials.paidFees / 1000),
      icon: DollarSign,
      color: 'from-orange-400 to-red-500',
      href: '/student-fees',
      description: 'Total fees collected',
      prefix: '$',
      suffix: 'K'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-purple-400 border-b-transparent rounded-full animate-spin animate-reverse"></div>
        </div>
      </div>
    );
  }

  return (
    <UserDataGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black relative overflow-hidden pb-16 md:pb-0">
        {/* Grid Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="group">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:animate-pulse">
                Kaabiye Command Center
              </h1>
              <p className="text-cyan-300/70 mt-2 flex items-center gap-2">
                <Activity className="w-4 h-4 animate-pulse" />
                Welcome back, {user?.user_metadata?.full_name || user?.email}
              </p>
            </div>
            
            {/* User Profile with Biometric Ring */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 p-1 animate-pulse">
                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                  <span className="text-xl font-bold text-cyan-400">
                    {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
              <div className="absolute -inset-2 rounded-full border-2 border-cyan-400/30 animate-spin"></div>
              <div className="absolute top-0 right-0 w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-500/20 border border-red-500/30 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div>
                  <h3 className="text-sm font-medium text-red-300">System Alert</h3>
                  <p className="text-sm text-red-200 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid - Hexagonal Panels */}
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((card, index) => (
              <Link
                key={card.id}
                to={card.href}
                className="group relative"
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 transition-all duration-500 hover:scale-105 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-400/20">
                  {/* Animated Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  {/* Hexagonal Icon Container */}
                  <div className="relative mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} p-3 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                      <card.icon className="w-full h-full text-white" />
                    </div>
                    {hoveredCard === card.id && (
                      <div className="absolute -inset-2 rounded-lg border-2 border-cyan-400/50 animate-pulse"></div>
                    )}
                  </div>

                  {/* Animated Counter */}
                  <div className="relative">
                    <div className="flex items-baseline gap-1">
                      {card.prefix && <span className="text-lg font-semibold text-gray-400">{card.prefix}</span>}
                      <span className="text-3xl font-bold text-white group-hover:text-cyan-300 transition-colors duration-300">
                        {card.value.toLocaleString()}
                      </span>
                      {card.suffix && <span className="text-lg font-semibold text-gray-400">{card.suffix}</span>}
                    </div>
                    <h3 className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors duration-300">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                  </div>

                  {/* Particle Effect on Hover */}
                  {hoveredCard === card.id && (
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping"
                          style={{
                            left: `${20 + i * 15}%`,
                            top: `${30 + (i % 2) * 40}%`,
                            animationDelay: `${i * 200}ms`
                          }}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Actions - Floating Orb Buttons */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
              {quickActions.map((action) => (
                <div key={action.id} className="relative">
                  <button
                    className="group relative w-20 h-20 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-cyan-400/50 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-cyan-400/20"
                    onMouseEnter={() => setExpandedAction(action.id)}
                    onMouseLeave={() => setExpandedAction(null)}
                  >
                    <div className={`absolute inset-2 rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center transition-all duration-300 group-hover:inset-1`}>
                      <action.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Ripple Effect */}
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-ping group-hover:animate-pulse"></div>
                  </button>

                  {/* Expanded Menu */}
                  {expandedAction === action.id && (
                    <div className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 z-20">
                      <Link
                        to={action.href}
                        className="block px-4 py-2 bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white text-sm font-medium hover:bg-gray-700/90 transition-all duration-200 whitespace-nowrap"
                      >
                        {action.label}
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Recent Students */}
            <div className="rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700/50">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  Recent Students
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentStudents.map((student, index) => (
                    <div
                      key={student.id}
                      className="group flex items-center gap-4 p-3 rounded-lg bg-gray-900/50 hover:bg-gray-700/50 transition-all duration-300 hover:scale-[1.02]"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                          {student.photo_url ? (
                            <img className="w-full h-full rounded-full object-cover" src={student.photo_url} alt="" />
                          ) : (
                            <span className="text-white font-semibold">{student.full_name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium group-hover:text-cyan-300 transition-colors duration-200">
                          {student.full_name}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {student.class ? `${student.class.name} - ${student.class.section}` : 'Not assigned'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Link
                    to="/students"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 hover:scale-105"
                  >
                    View all students
                    <Users className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Teachers */}
            <div className="rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700/50">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-purple-400" />
                  Recent Teachers
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentTeachers.map((teacher, index) => (
                    <div
                      key={teacher.id}
                      className="group flex items-center gap-4 p-3 rounded-lg bg-gray-900/50 hover:bg-gray-700/50 transition-all duration-300 hover:scale-[1.02]"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                          {teacher.photo_url ? (
                            <img className="w-full h-full rounded-full object-cover" src={teacher.photo_url} alt="" />
                          ) : (
                            <span className="text-white font-semibold">{teacher.full_name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium group-hover:text-purple-300 transition-colors duration-200">
                          {teacher.full_name}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {teacher.subjects.slice(0, 2).map((subject) => (
                            <span
                              key={subject}
                              className="inline-flex rounded-full bg-purple-500/20 px-2 py-1 text-xs font-medium text-purple-300"
                            >
                              {subject}
                            </span>
                          ))}
                          {teacher.subjects.length > 2 && (
                            <span className="inline-flex rounded-full bg-gray-500/20 px-2 py-1 text-xs font-medium text-gray-400">
                              +{teacher.subjects.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Link
                    to="/teachers"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 hover:scale-105"
                  >
                    View all teachers
                    <GraduationCap className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserDataGuard>
  );
};

export default Dashboard;
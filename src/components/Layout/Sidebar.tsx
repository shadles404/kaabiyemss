import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardList,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  LogOut,
  BookOpen,
  Zap,
  Activity
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Command Center', href: '/', icon: LayoutDashboard, color: 'from-cyan-400 to-blue-500' },
    { name: 'Students', href: '/students', icon: Users, color: 'from-blue-400 to-indigo-500' },
    { name: 'Teachers', href: '/teachers', icon: GraduationCap, color: 'from-purple-400 to-pink-500' },
    { name: 'Classes', href: '/classes', icon: ClipboardList, color: 'from-green-400 to-emerald-500' },
    { name: 'Exams', href: '/exams', icon: BookOpen, color: 'from-orange-400 to-red-500' },
    { name: 'Student Attendance', href: '/student-attendance', icon: Calendar, color: 'from-teal-400 to-cyan-500' },
    { name: 'Teacher Attendance', href: '/teacher-attendance', icon: Calendar, color: 'from-indigo-400 to-purple-500' },
    { name: 'Student Fees', href: '/student-fees', icon: DollarSign, color: 'from-yellow-400 to-orange-500' },
    { name: 'Teacher Salary', href: '/teacher-salary', icon: DollarSign, color: 'from-pink-400 to-rose-500' },
    { name: 'Reports', href: '/reports', icon: FileText, color: 'from-gray-400 to-gray-500' },
    { name: 'Settings', href: '/settings', icon: Settings, color: 'from-slate-400 to-gray-500' },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900/95 backdrop-blur-sm border-r border-gray-700/50">
      {/* Sidebar header */}
      <div className="flex h-16 shrink-0 items-center border-b border-gray-700/50 px-6 bg-gray-800/50">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-cyan-400 animate-pulse" />
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Kaabiye MS
          </span>
        </div>
      </div>

      {/* User info */}
      <div className="flex flex-col items-center border-b border-gray-700/50 py-6 bg-gray-800/30">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-xl font-bold text-white shadow-lg shadow-cyan-400/20">
            {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div className="absolute -inset-1 rounded-full border-2 border-cyan-400/30 animate-pulse"></div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50 border-2 border-gray-900"></div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm font-medium text-white">
            {user?.user_metadata?.full_name || 'User'}
          </p>
          <p className="text-xs text-gray-400">System Administrator</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span className="text-xs text-cyan-400 font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                  : 'text-gray-300 hover:bg-gray-800/50 hover:text-white hover:scale-[1.02]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`mr-3 rounded-md p-1 ${isActive ? `bg-gradient-to-r ${item.color}` : 'bg-gray-700/50 group-hover:bg-gray-600/50'} transition-all duration-200`}>
                  <item.icon
                    className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors duration-200`}
                    aria-hidden="true"
                  />
                </div>
                <span className="truncate">{item.name}</span>
                {isActive && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout button */}
      <div className="shrink-0 border-t border-gray-700/50 p-4 bg-gray-800/30">
        <button
          onClick={logout}
          className="group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 hover:scale-[1.02] border border-transparent hover:border-red-500/30"
        >
          <div className="mr-3 rounded-md p-1 bg-gray-700/50 group-hover:bg-red-500/20 transition-all duration-200">
            <LogOut className="h-4 w-4 text-gray-400 group-hover:text-red-400 transition-colors duration-200" aria-hidden="true" />
          </div>
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
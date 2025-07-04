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
  BookOpen
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Teachers', href: '/teachers', icon: GraduationCap },
    { name: 'Classes', href: '/classes', icon: ClipboardList },
    { name: 'Exams', href: '/exams', icon: BookOpen },
    { name: 'Student Attendance', href: '/student-attendance', icon: Calendar },
    { name: 'Teacher Attendance', href: '/teacher-attendance', icon: Calendar },
    { name: 'Student Fees', href: '/student-fees', icon: DollarSign },
    { name: 'Teacher Salary', href: '/teacher-salary', icon: DollarSign },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      {/* Sidebar header */}
      <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-6">
        <span className="text-xl font-bold text-blue-600">Kaabiye MS</span>
      </div>

      {/* User info */}
      <div className="flex flex-col items-center border-b border-gray-200 py-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl font-medium text-blue-600">
          {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
        </div>
        <div className="mt-2 text-center">
          <p className="text-sm font-medium text-gray-900">
            {user?.user_metadata?.full_name || 'User'}
          </p>
          <p className="text-xs text-gray-500">Administrator</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon
              className="mr-3 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Logout button */}
      <div className="shrink-0 border-t border-gray-200 p-4">
        <button
          onClick={logout}
          className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOut className="mr-3 h-5 w-5 shrink-0" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
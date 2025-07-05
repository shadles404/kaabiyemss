import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  DollarSign,
  BookOpen
} from 'lucide-react';

const MobileNavigation = () => {
  // Simplified navigation for mobile
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, color: 'from-cyan-400 to-blue-500' },
    { name: 'Students', href: '/students', icon: Users, color: 'from-blue-400 to-indigo-500' },
    { name: 'Teachers', href: '/teachers', icon: GraduationCap, color: 'from-purple-400 to-pink-500' },
    { name: 'Exams', href: '/exams', icon: BookOpen, color: 'from-orange-400 to-red-500' },
    { name: 'Attendance', href: '/student-attendance', icon: Calendar, color: 'from-teal-400 to-cyan-500' },
    { name: 'Finance', href: '/student-fees', icon: DollarSign, color: 'from-yellow-400 to-orange-500' }
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t border-gray-700/50 bg-gray-900/95 backdrop-blur-md">
      <div className="grid h-16 grid-cols-6 gap-1 px-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'text-cyan-400 bg-cyan-500/20 border border-cyan-500/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-md ${isActive ? `bg-gradient-to-r ${item.color}` : 'bg-gray-700/50'} transition-all duration-200`}>
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} aria-hidden="true" />
                </div>
                <span className="mt-1 text-xs font-medium truncate">{item.name}</span>
                {isActive && (
                  <div className="absolute top-1 right-1">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
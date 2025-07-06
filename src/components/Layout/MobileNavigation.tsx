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
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Teachers', href: '/teachers', icon: GraduationCap },
    { name: 'Exams', href: '/exams', icon: BookOpen },
    { name: 'Attendance', href: '/student-attendance', icon: Calendar },
    { name: 'Finance', href: '/student-fees', icon: DollarSign }
  ];

  return (
    <div className="fixed bottom-0 left-0 z-10 w-full border-t border-gray-200 bg-white">
      <div className="grid h-16 grid-cols-6">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="h-6 w-6" aria-hidden="true" />
            <span className="mt-1 text-xs">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
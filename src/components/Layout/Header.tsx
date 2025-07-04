import React, { useState } from 'react';
import { Bell, Menu, X, Search, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left side - Mobile menu button and logo */}
        <div className="flex items-center">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <span className="sr-only">Open main menu</span>
            {showMobileMenu ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
          
          <div className="ml-4 md:ml-0">
            <h1 className="text-xl font-bold text-blue-600">Kaabiye Management System </h1>
          </div>
        </div>

        {/* Center - Search bar (hidden on mobile) */}
        <div className="hidden flex-1 px-8 md:flex md:max-w-md lg:max-w-lg">
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
              placeholder="Search..."
            />
          </div>
        </div>

        {/* Right side - Notifications and profile */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="relative rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
            <span className="absolute right-0 top-0 flex h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="user-menu-button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <span className="sr-only">Open user menu</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <span className="text-sm font-medium">
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
            </button>

            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                role="menu"
              >
                <div className="border-b border-gray-100 px-4 py-2">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                
                <a
                  href="#profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  Your Profile
                </a>
                
                <a
                  href="#settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </a>
                
                <button
                  onClick={logout}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
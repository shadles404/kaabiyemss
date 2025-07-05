import React, { useState } from 'react';
import { Bell, Menu, X, Search, LogOut, Settings, User as UserIcon, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-md shadow-lg shadow-cyan-500/10">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left side - Mobile menu button and logo */}
        <div className="flex items-center">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 md:hidden transition-all duration-200"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <span className="sr-only">Open main menu</span>
            {showMobileMenu ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
          
          <div className="ml-4 md:ml-0 group">
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:animate-pulse flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
              Kaabiye MS
            </h1>
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
              className="block w-full rounded-lg border-0 bg-gray-800/50 py-2 pl-10 pr-3 text-gray-100 placeholder:text-gray-400 focus:bg-gray-800 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0 sm:text-sm backdrop-blur-sm transition-all duration-200"
              placeholder="Search command center..."
            />
          </div>
        </div>

        {/* Right side - Notifications and profile */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="relative rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
            <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50"></span>
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200 hover:ring-2 hover:ring-cyan-400/50"
              id="user-menu-button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <span className="sr-only">Open user menu</span>
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-semibold">
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div className="absolute -inset-1 rounded-full border-2 border-cyan-400/30 animate-pulse"></div>
              </div>
            </button>

            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-gray-800/95 backdrop-blur-sm py-2 shadow-xl shadow-black/50 ring-1 ring-gray-700/50 focus:outline-none border border-gray-700/50"
                role="menu"
              >
                <div className="border-b border-gray-700/50 px-4 py-3">
                  <p className="text-sm font-medium text-white">
                    {user?.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-cyan-400 font-medium">Command Center Active</span>
                  </div>
                </div>
                
                <a
                  href="#profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-cyan-400 transition-all duration-200"
                  role="menuitem"
                >
                  <UserIcon className="mr-3 h-4 w-4" />
                  Your Profile
                </a>
                
                <a
                  href="#settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-cyan-400 transition-all duration-200"
                  role="menuitem"
                >
                  <Settings className="mr-3 h-4 w-4" />
                  Settings
                </a>
                
                <button
                  onClick={logout}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-red-400 transition-all duration-200"
                  role="menuitem"
                >
                  <LogOut className="mr-3 h-4 w-4" />
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
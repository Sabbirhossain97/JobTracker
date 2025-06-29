import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, 
  Plus, 
  FileText, 
  Kanban, 
  BarChart3, 
  Settings,
  Briefcase,
  Home,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';

export default function Layout() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/add', icon: Plus, label: 'Add Application' },
    { to: '/dashboard/applications', icon: Briefcase, label: 'Applications' },
    { to: '/dashboard/kanban', icon: Kanban, label: 'Kanban Board' },
    { to: '/dashboard/documents', icon: FileText, label: 'Documents' },
    { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const truncateEmail = (email: string, maxLength: number = 20) => {
    if (email.length <= maxLength) return email;
    return email.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 border-r border-gray-200 flex flex-col">
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 flex-shrink-0">
          <NavLink to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              JobTracker Pro
            </span>
          </NavLink>
        </div>
        
        <nav className="flex-1 mt-8 px-4 overflow-y-auto">
          <div className="mb-4">
            <NavLink
              to="/"
              className="flex items-center space-x-3 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </NavLink>
          </div>
          
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-r-2 border-blue-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Menu */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center space-x-3 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {getUserInitials()}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {getUserDisplayName()}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user?.email ? truncateEmail(user.email) : ''}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    // Add profile navigation here if needed
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    // Add settings navigation here if needed
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4 flex-shrink-0" />
                  <span>Settings</span>
                </button>
                <hr className="my-2" />
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64">
        <div className="min-h-screen">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onBackToLastSession?: () => void;
}

// Define the auth context type to match what's being provided
interface AuthContextType {
  user: {
    name?: string;
    username?: string;
    email?: string;
    role?: string;
    user_id?: number;
  } | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<any>;
  logout: () => void;
  refreshToken: () => Promise<string>;
}

const Header: React.FC<HeaderProps> = ({ onBackToLastSession }) => {
  // Type assertion to help TypeScript understand the context structure
  const { user, logout, isLoading } = useAuth() as AuthContextType;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleBackToLastSession = () => {
    if (onBackToLastSession) {
      onBackToLastSession();
    }
  };

  // Get username from user object with proper type checking
  const username = user?.name || user?.username || user?.email || "Photographer";

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/40 dark:border-slate-700/40 shadow-lg">
      <div className="w-full px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 w-full">
          {/* Left Section - Logo */}
          <div className="flex items-center">
            <button 
              onClick={handleBackToLastSession}
              className="flex items-center space-x-4 hover:opacity-80 transition-all duration-300 group"
            >
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-lg border border-slate-200/30 dark:border-slate-700/30 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                <img 
                  src="/m2-logo.jpg" 
                  alt="M2 Photography Logo" 
                  className="w-full h-full object-contain bg-white"
                />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  M2 Photography
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Professional Studio
                </span>
              </div>
            </button>
          </div>

          {/* Right Section - User Info & Logout */}
          <div className="flex items-center space-x-4">
            {/* User Info Card */}
            <div className="flex items-center px-4 py-3 rounded-2xl bg-gradient-to-r from-slate-50/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-700/90 border border-slate-200/30 dark:border-slate-600/30 backdrop-blur-sm shadow-lg">
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-white/20">
                    {username[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></div>
                </div>
                
                {/* User Details */}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                    {username}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {new Date().toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              disabled={isLoading}
              className="inline-flex items-center px-5 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {isLoading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
import React from 'react';
import {
  Sparkles,
  Compass,
  BookOpen,
  TrendingUp,
  History,
  User as UserIcon,
  LogOut,
  LogIn
} from 'lucide-react';
import type { User } from '../lib/firebase';

interface NavbarProps {
  activeTab: 'landing' | 'dashboard' | 'learn' | 'progress' | 'history' | 'profile';
  onSelectTab: (tab: 'dashboard' | 'learn' | 'progress' | 'history' | 'profile') => void;
  user: User | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  user,
  onOpenAuth,
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-30 glass border-b border-white/10 bg-[#0A0F1E]/75 backdrop-blur-xl shadow-lg shadow-black/20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          id="brand-logo"
          onClick={() => onSelectTab(user ? 'dashboard' : 'learn')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
              Learn<span className="text-blue-400">Loop</span>
            </span>
            <span className="hidden sm:block text-[10px] tracking-wider uppercase font-semibold text-slate-400 -mt-1">
              Adaptive AI Tutor
            </span>
          </div>
        </div>

        {/* Navigation Links (If logged in or in app mode) */}
        {user ? (
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10 backdrop-blur-md">
            <button
              id="nav-dashboard-btn"
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'glass-card text-blue-400 font-semibold shadow-[0_0_15px_rgba(59,130,246,0.25)] border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Compass className="w-4 h-4" />
              Dashboard
            </button>

            <button
              id="nav-learn-btn"
              onClick={() => onSelectTab('learn')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'learn'
                  ? 'glass-card text-blue-400 font-semibold shadow-[0_0_15px_rgba(59,130,246,0.25)] border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Learn
            </button>

            <button
              id="nav-progress-btn"
              onClick={() => onSelectTab('progress')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'progress'
                  ? 'glass-card text-blue-400 font-semibold shadow-[0_0_15px_rgba(59,130,246,0.25)] border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Progress
            </button>

            <button
              id="nav-history-btn"
              onClick={() => onSelectTab('history')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'history'
                  ? 'glass-card text-blue-400 font-semibold shadow-[0_0_15px_rgba(59,130,246,0.25)] border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <History className="w-4 h-4" />
              History
            </button>

            <button
              id="nav-profile-btn"
              onClick={() => onSelectTab('profile')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'profile'
                  ? 'glass-card text-blue-400 font-semibold shadow-[0_0_15px_rgba(59,130,246,0.25)] border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              Profile
            </button>
          </nav>
        ) : (
          <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-slate-300">
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-400/20 backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Adaptive Mastery Engine
            </span>
          </div>
        )}

        {/* User Account / Auth Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div
                onClick={() => onSelectTab('profile')}
                className="flex items-center gap-2.5 cursor-pointer p-1 rounded-full hover:bg-white/10 transition-colors"
                title={user.email || 'Student Account'}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Student'}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-white/20 object-cover shadow-xs"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-xs border border-indigo-400/30">
                    {(user.displayName || user.email || 'S').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="hidden lg:block text-xs font-semibold text-slate-200 max-w-[120px] truncate">
                  {user.displayName || user.email?.split('@')[0] || 'Student'}
                </span>
              </div>
              <button
                id="sign-out-btn"
                onClick={onSignOut}
                className="text-slate-400 hover:text-rose-300 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="nav-login-btn"
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation bar */}
      {user && (
        <div className="md:hidden flex items-center justify-around border-t border-white/10 bg-[#0A0F1E]/80 backdrop-blur-xl py-2 px-1">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg ${
              activeTab === 'dashboard' ? 'text-blue-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <Compass className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => onSelectTab('learn')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg ${
              activeTab === 'learn' ? 'text-blue-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Learn
          </button>
          <button
            onClick={() => onSelectTab('progress')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg ${
              activeTab === 'progress' ? 'text-blue-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Progress
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg ${
              activeTab === 'history' ? 'text-blue-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <History className="w-4 h-4" />
            History
          </button>
          <button
            onClick={() => onSelectTab('profile')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg ${
              activeTab === 'profile' ? 'text-blue-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            Profile
          </button>
        </div>
      )}
    </header>
  );
};

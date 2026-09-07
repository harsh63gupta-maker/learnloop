import React from 'react';
import {
  User as UserIcon,
  Mail,
  ShieldCheck,
  LogOut,
  Sparkles,
  BookOpen,
  Award,
  Database,
  Cpu,
  RefreshCw
} from 'lucide-react';
import type { User } from '../lib/firebase';
import type { UserProgressSummary } from '../types';

interface ProfileViewProps {
  user: User | null;
  progress: UserProgressSummary | null;
  onSignOut: () => void;
  onRefreshData: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  progress,
  onSignOut,
  onRefreshData,
}) => {
  const isAnonymous = user?.isAnonymous;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-white">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-md">
          <UserIcon className="w-3.5 h-3.5" />
          <span>Student Account</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Profile & Learning Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Your isolated student identity and persistent learning record in Cloud Firestore.
        </p>
      </div>

      {/* Profile Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-2xl border-2 border-white/20 object-cover shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-indigo-500/20 text-indigo-300 font-black text-2xl flex items-center justify-center border border-indigo-400/30 shadow-md backdrop-blur-md">
              {(user?.displayName || user?.email || 'S').slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="flex-1 text-center sm:text-left space-y-1">
            <h2 className="text-xl font-bold text-white">
              {user?.displayName || (isAnonymous ? 'Guest Student' : 'LearnLoop Student')}
            </h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email || (isAnonymous ? 'Anonymous Guest Session' : 'Private Account')}</span>
              </span>
              <span>•</span>
              <span className="font-mono text-[10px] bg-white/10 border border-white/10 px-2 py-0.5 rounded text-slate-300">
                UID: {user?.uid.slice(0, 12)}...
              </span>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30 backdrop-blur-md">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Firestore Isolated</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30 backdrop-blur-md">
                <Cpu className="w-3.5 h-3.5" />
                <span>Gemini 3.6 Flash Tutor</span>
              </span>
            </div>
          </div>

          <button
            onClick={onSignOut}
            className="px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs transition-colors flex items-center gap-1.5 backdrop-blur-md cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <span className="text-xs font-bold text-slate-400 uppercase">Mastery Average</span>
            <div className="text-2xl font-black text-white mt-1">
              {progress?.overallUnderstanding ?? 0}%
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <span className="text-xs font-bold text-slate-400 uppercase">Topics Logged</span>
            <div className="text-2xl font-black text-white mt-1">
              {progress?.totalTopicsStudied ?? 0}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <span className="text-xs font-bold text-slate-400 uppercase">Sessions Completed</span>
            <div className="text-2xl font-black text-white mt-1">
              {progress?.totalSessions ?? 0}
            </div>
          </div>
        </div>

        {/* System & Architecture Info */}
        <div className="pt-4 border-t border-white/10 text-xs text-slate-400 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300">Data Synchronization:</span>
            <button
              onClick={onRefreshData}
              className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Sync with Cloud Firestore</span>
            </button>
          </div>
          <p className="leading-relaxed">
            All your quiz attempts, concept scores, detected misconceptions, and personalized AI recommendations are stored under your personal UID collection path in Cloud Firestore.
          </p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Award,
  Clock,
  RotateCcw,
  Zap,
  Target
} from 'lucide-react';
import type { UserProgressSummary, LearningSession, SubjectType, LearningLevel } from '../types';
import type { User } from '../lib/firebase';

interface DashboardViewProps {
  user: User | null;
  progress: UserProgressSummary | null;
  recentSessions: LearningSession[];
  onStartLearning: (
    topic?: string,
    concept?: string,
    subject?: SubjectType,
    autoStart?: boolean,
    level?: LearningLevel
  ) => void;
  onViewProgress: () => void;
  onViewHistory: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  progress,
  recentSessions,
  onStartLearning,
  onViewProgress,
  onViewHistory
}) => {
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Student';
  const overallUnderstanding = progress?.overallUnderstanding ?? 0;
  const totalTopics = progress?.totalTopicsStudied ?? 0;
  const weakTopics = progress?.weakTopics ?? [];
  const strongTopics = progress?.strongTopics ?? [];
  const recentScores = progress?.recentScores ?? [];

  // Generate recommendation based on weak concepts or progress
  let recommendationText = progress?.personalizedRecommendation;
  if (!recommendationText) {
    if (weakTopics.length > 0) {
      const topWeak = weakTopics[0];
      recommendationText = `You recently struggled with concepts in "${topWeak.topic}" (${topWeak.weakConcepts.join(', ') || 'foundational rules'}). We recommend reviewing these before advancing to complex multi-step problems.`;
    } else if (totalTopics > 0) {
      recommendationText = `Outstanding momentum! You have mastered your initial topics. Challenge yourself with a new subject or advanced level topic.`;
    } else {
      recommendationText = `Ready to begin your adaptive learning journey? Pick any academic topic below to test your understanding.`;
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Banner / Welcome */}
      <div className="glass bg-gradient-to-r from-blue-600/30 via-indigo-600/25 to-purple-600/30 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/15 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-300 border border-white/10 text-xs font-semibold uppercase tracking-wider mb-3 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Student Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {displayName}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              LearnLoop tracks the exact misconceptions in your mental models so you master topics permanently.
            </p>
          </div>

          <button
            id="dash-start-learning-btn"
            onClick={() => onStartLearning()}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 glow-blue transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Start Learning</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Overall Understanding */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-lg flex items-center gap-4 backdrop-blur-md">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-400/20 text-blue-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Overall Understanding
            </div>
            <div className="text-3xl font-black text-white mt-0.5 flex items-baseline gap-1">
              {overallUnderstanding}%
              <span className="text-xs font-semibold text-slate-400">mastery</span>
            </div>
            <div className="w-24 bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, overallUnderstanding))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Topics Studied */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-lg flex items-center gap-4 backdrop-blur-md">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Topics Studied
            </div>
            <div className="text-3xl font-black text-white mt-0.5">
              {totalTopics}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {strongTopics.length} mastered · {weakTopics.length} in progress
            </div>
          </div>
        </div>

        {/* Sessions Completed */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-lg flex items-center gap-4 backdrop-blur-md">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Learning Loops Completed
            </div>
            <div className="text-3xl font-black text-white mt-0.5">
              {progress?.totalSessions ?? recentSessions.length}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Interactive quiz & diagnose loops
            </div>
          </div>
        </div>
      </div>

      {/* Personalized Recommendations Alert */}
      {recommendationText && (
        <div className="glass border border-amber-400/30 bg-amber-950/20 rounded-2xl p-5 flex items-start gap-3.5 shadow-lg backdrop-blur-md">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
            <Target className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                AI Learning Recommendation
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 font-bold">
                Adaptive
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
              {recommendationText}
            </p>
          </div>
          {weakTopics.length > 0 && (
            <button
              onClick={() => onStartLearning(weakTopics[0].topic, weakTopics[0].weakConcepts[0])}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
            >
              <span>Fix Gaps</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Main Grid: Weak Topics & Recent Quiz Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weak Topics Card */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-lg flex flex-col justify-between backdrop-blur-md text-white">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">
                  Weak Topics & Gaps
                </h2>
              </div>
              <span className="text-xs font-medium text-slate-400">
                {weakTopics.length} detected
              </span>
            </div>

            {weakTopics.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl bg-white/[0.02] border border-dashed border-white/10">
                <p className="text-xs font-medium text-slate-300">
                  No weak topics identified yet!
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Complete your first quiz to let LearnLoop identify any concepts needing revision.
                </p>
                <button
                  onClick={() => onStartLearning('Binary Search')}
                  className="mt-3 text-xs font-bold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 cursor-pointer"
                >
                  Test "Binary Search" <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {weakTopics.map(w => (
                  <div
                    key={w.topic}
                    className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{w.topic}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30">
                          {w.score}%
                        </span>
                      </div>
                      {w.weakConcepts.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {w.weakConcepts.map(c => (
                            <span
                              key={c}
                              className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10"
                            >
                              • {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onStartLearning(w.topic, w.weakConcepts[0])}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1 shrink-0 cursor-pointer"
                      title="Review this weak topic"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Diagnosed through mistaken reasoning</span>
            <button
              onClick={onViewProgress}
              className="text-blue-400 hover:text-blue-300 hover:underline font-semibold cursor-pointer"
            >
              Detailed Breakdown →
            </button>
          </div>
        </div>

        {/* Recent Quiz Scores Card */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-lg flex flex-col justify-between backdrop-blur-md text-white">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">
                  Recent Quiz Scores
                </h2>
              </div>
              <button
                onClick={onViewHistory}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                View All
              </button>
            </div>

            {recentScores.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl bg-white/[0.02] border border-dashed border-white/10">
                <p className="text-xs font-medium text-slate-300">
                  No quiz scores recorded yet
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Start a topic and complete the 5-question check to build your score history.
                </p>
                <button
                  onClick={() => onStartLearning()}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                >
                  <Zap className="w-3 h-3" />
                  <span>Start First Session</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentScores.slice(0, 5).map((item, idx) => {
                  const isHigh = item.score >= 80;
                  const isMid = item.score >= 60 && item.score < 80;
                  return (
                    <div
                      key={`${item.sessionId || idx}`}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            isHigh ? 'bg-emerald-400' : isMid ? 'bg-amber-400' : 'bg-rose-400'
                          }`}
                        />
                        <span className="font-bold text-slate-200">{item.topic}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-[11px]">{item.date}</span>
                        <span
                          className={`font-black px-2 py-0.5 rounded-md border ${
                            isHigh
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                              : isMid
                              ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                          }`}
                        >
                          {item.score}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Adaptive scores reflect true understanding</span>
            <button
              onClick={onViewHistory}
              className="text-blue-400 hover:text-blue-300 hover:underline font-semibold cursor-pointer"
            >
              Review Past Quizzes →
            </button>
          </div>
        </div>
      </div>

      {/* Recent Topics Studied List */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-lg backdrop-blur-md text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">
              Recent Topics
            </h2>
          </div>
          <button
            onClick={() => onStartLearning()}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Explore New Topic</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentSessions.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { topic: 'Binary Search', subject: 'Computer Science', level: 'Beginner' },
              { topic: 'Recursion', subject: 'Computer Science', level: 'Intermediate' },
              { topic: 'Newton\'s Second Law', subject: 'Physics', level: 'Beginner' },
            ].map(sample => (
              <div
                key={sample.topic}
                onClick={() => onStartLearning(sample.topic)}
                className="p-4 rounded-xl border border-white/10 hover:border-blue-400/50 bg-white/[0.02] hover:bg-white/[0.06] transition-all cursor-pointer group backdrop-blur-md"
              >
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  {sample.subject}
                </div>
                <div className="text-sm font-bold text-white mt-1 group-hover:text-blue-300">
                  {sample.topic}
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{sample.level}</span>
                  <span className="text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    Start →
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recentSessions.slice(0, 6).map(session => (
              <div
                key={session.id}
                onClick={() => onStartLearning(session.topic)}
                className="p-4 rounded-xl border border-white/10 hover:border-blue-400/50 bg-white/[0.02] hover:bg-white/[0.06] transition-all cursor-pointer group flex flex-col justify-between backdrop-blur-md"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    <span>{session.subject}</span>
                    <span className="text-slate-400">{session.level}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                    {session.topic}
                  </h3>
                </div>

                <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    {session.correctCount} / {session.totalQuestions} correct
                  </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded border ${
                      session.score >= 70
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                    }`}
                  >
                    {session.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  History as HistoryIcon,
  Calendar,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';
import type { LearningSession } from '../types';

interface HistoryViewProps {
  sessions: LearningSession[];
  onSelectSessionForReview: (session: LearningSession) => void;
  onPracticeTopic: (topic: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  sessions,
  onSelectSessionForReview,
  onPracticeTopic,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-md">
            <HistoryIcon className="w-3.5 h-3.5" />
            <span>Learning Log</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Session History
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review past adaptive quizzes, diagnoses, and concept assessments saved to your account.
          </p>
        </div>

        <span className="text-xs font-semibold text-slate-400 self-start sm:self-auto">
          {sessions.length} total sessions
        </span>
      </div>

      {sessions.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-white/10 shadow-2xl backdrop-blur-xl">
          <HistoryIcon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No session history yet</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
            Once you complete your first lesson and adaptive knowledge check, your full session records will appear here.
          </p>
          <button
            onClick={() => onPracticeTopic('Binary Search')}
            className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            Start First Quiz
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => {
            const isExpanded = expandedId === session.id;
            const dateStr = new Date(session.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            const isHigh = session.score >= 80;
            const isMid = session.score >= 60 && session.score < 80;

            return (
              <div
                key={session.id}
                className="glass-card rounded-2xl border border-white/10 shadow-xl backdrop-blur-md overflow-hidden transition-all text-white"
              >
                <div
                  onClick={() => toggleExpand(session.id)}
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center shrink-0 mt-0.5 backdrop-blur-md">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">
                          {session.topic}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 border border-white/10 text-slate-300 font-semibold">
                          {session.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{dateStr}</span>
                        </span>
                        <span>•</span>
                        <span>
                          {session.correctCount} of {session.totalQuestions} correct
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span
                        className={`text-base font-black px-3 py-1 rounded-xl inline-block border backdrop-blur-md ${
                          isHigh
                            ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
                            : isMid
                            ? 'bg-amber-500/20 border-amber-400/30 text-amber-300'
                            : 'bg-rose-500/20 border-rose-400/30 text-rose-300'
                        }`}
                      >
                        {session.score}%
                      </span>
                    </div>

                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-white/10 bg-white/[0.02] space-y-4">
                    {/* Concepts Summary */}
                    <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                        <span className="font-bold text-emerald-400 block mb-1">
                          Concepts Understood ({session.conceptsUnderstood.length})
                        </span>
                        <div className="space-y-1">
                          {session.conceptsUnderstood.map(c => (
                            <div key={c} className="text-slate-300 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{c}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                        <span className="font-bold text-amber-400 block mb-1">
                          Needing Practice ({session.conceptsNeedingImprovement.length})
                        </span>
                        <div className="space-y-1">
                          {session.conceptsNeedingImprovement.length === 0 ? (
                            <span className="text-slate-500 italic">None</span>
                          ) : (
                            session.conceptsNeedingImprovement.map(c => (
                              <div key={c} className="text-slate-300 flex items-center gap-1.5">
                                <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                <span>{c}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2.5 pt-2">
                      <button
                        onClick={() => onSelectSessionForReview(session)}
                        className="px-4 py-2 rounded-xl border border-white/15 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs transition-colors backdrop-blur-md cursor-pointer"
                      >
                        View Full Assessment
                      </button>
                      <button
                        onClick={() => onPracticeTopic(session.topic)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Re-test This Topic</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Target,
  ShieldCheck
} from 'lucide-react';
import type { LearningSession } from '../types';

interface ResultsViewProps {
  session: LearningSession;
  onReviewWeakTopic: (topic: string, concept?: string) => void;
  onStartNewTopic: () => void;
  onGoToDashboard: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  session,
  onReviewWeakTopic,
  onStartNewTopic,
  onGoToDashboard,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const hasWeakConcepts = session.conceptsNeedingImprovement && session.conceptsNeedingImprovement.length > 0;
  const isHighMastery = session.score >= 80;
  const isMidMastery = session.score >= 60 && session.score < 80;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300 text-white">
      {/* Top Banner / Score Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-9 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden text-center sm:text-left text-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Award className="w-3.5 h-3.5" />
              <span>Session Assessment Complete</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {session.topic}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-md">
              Your conceptual mental model was evaluated across {session.totalQuestions} questions with real-time adaptive feedback.
            </p>
          </div>

          {/* Big Score Gauge */}
          <div className="flex flex-col items-center glass p-6 rounded-2xl border border-white/10 shrink-0 min-w-[180px] backdrop-blur-md">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Your Understanding
            </span>
            <div className="text-5xl font-black text-white flex items-baseline">
              {session.score}%
            </div>
            <span
              className={`mt-2 text-xs font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-md ${
                isHighMastery
                  ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
                  : isMidMastery
                  ? 'bg-amber-500/20 border-amber-400/30 text-amber-300'
                  : 'bg-rose-500/20 border-rose-400/30 text-rose-300'
              }`}
            >
              {isHighMastery ? 'Mastered' : isMidMastery ? 'Solid Foundation' : 'Needs Practice'}
            </span>
          </div>
        </div>

        {/* Quick Counters */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Correct</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>{session.correctCount}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Incorrect</div>
            <div className="text-xl font-black text-rose-400 mt-0.5 flex items-center gap-1">
              <XCircle className="w-4 h-4" />
              <span>{session.incorrectCount}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Concepts Solid</div>
            <div className="text-xl font-black text-blue-400 mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>{session.conceptsUnderstood.length}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Gaps Diagnosed</div>
            <div className="text-xl font-black text-amber-400 mt-0.5 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              <span>{session.conceptsNeedingImprovement.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Concept Breakdown Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Concepts Understood */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/10 shadow-xl backdrop-blur-md text-white">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-base mb-4">
            <CheckCircle2 className="w-5 h-5" />
            <h2>Concepts Understood</h2>
          </div>

          {session.conceptsUnderstood.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">
              All tested concepts experienced minor misunderstandings. Reviewing below will solidify them.
            </p>
          ) : (
            <div className="space-y-2.5">
              {session.conceptsUnderstood.map(c => (
                <div
                  key={c}
                  className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-400/30 text-xs font-bold text-emerald-200 flex items-center justify-between backdrop-blur-md"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{c}</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300 font-bold border border-emerald-400/30">
                    Strong
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Concepts Needing Improvement */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/10 shadow-xl backdrop-blur-md text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h2>Needs Improvement</h2>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {session.conceptsNeedingImprovement.length} concepts
              </span>
            </div>

            {!hasWeakConcepts ? (
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-400/30 text-emerald-200 text-xs backdrop-blur-md">
                <p className="font-bold">Perfect comprehension across all sub-concepts!</p>
                <p className="text-emerald-300 mt-1">No conceptual blind spots detected in this session.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {session.conceptsNeedingImprovement.map(c => (
                  <div
                    key={c}
                    className="p-3 rounded-xl bg-amber-950/30 border border-amber-400/30 text-xs font-bold text-amber-200 flex items-center justify-between backdrop-blur-md"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{c}</span>
                    </span>
                    <button
                      onClick={() => onReviewWeakTopic(session.topic, c)}
                      className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold transition-colors cursor-pointer shadow-sm"
                    >
                      Review Concept
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {hasWeakConcepts && (
            <div className="mt-5 pt-4 border-t border-white/10">
              <button
                id="review-weak-topics-btn"
                onClick={() => onReviewWeakTopic(session.topic, session.conceptsNeedingImprovement[0])}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Review Weak Topics Now</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Personalized Recommendations Card */}
      {session.recommendations && session.recommendations.length > 0 && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl backdrop-blur-md text-white">
          <div className="flex items-center gap-2 text-blue-300 font-bold text-sm mb-3">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Recommended Next Steps & Review Topics</span>
          </div>
          <div className="space-y-2">
            {session.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-slate-200 flex items-start gap-2.5 shadow-sm backdrop-blur-md"
              >
                <Target className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accordion: Full Question & Misconception Review */}
      <div className="glass-card rounded-3xl border border-white/10 shadow-xl backdrop-blur-md text-white overflow-hidden">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-white/[0.04] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-white text-sm sm:text-base">
              Detailed Question-by-Question Review & Misconception Log
            </span>
          </div>
          {showDetails ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {showDetails && (
          <div className="p-6 pt-0 border-t border-white/10 space-y-4">
            {session.attempts.map((attempt, index) => (
              <div
                key={index}
                className={`p-4 rounded-2xl border text-xs sm:text-sm backdrop-blur-md ${
                  attempt.isCorrect
                    ? 'bg-emerald-950/20 border-emerald-400/20'
                    : 'bg-amber-950/20 border-amber-400/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">
                      {attempt.isFollowUp ? 'Follow-Up Verification' : `Question ${index + 1}`}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-300 font-semibold border border-white/10">
                      {attempt.concept}
                    </span>
                  </div>
                  <span
                    className={`font-black text-xs ${
                      attempt.isCorrect ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {attempt.isCorrect ? '✓ Correct' : '✗ Misconception'}
                  </span>
                </div>

                <p className="font-semibold text-slate-200 mb-2">
                  {attempt.questionText}
                </p>

                <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-300 mb-2">
                  <span className="font-bold text-slate-400">Your Answer: </span>
                  <span>{attempt.studentAnswer}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-white">Feedback: </span>
                  {attempt.diagnosis}
                </p>

                {attempt.misconception && (
                  <div className="mt-2 p-2 rounded bg-slate-950/80 border border-rose-500/30 text-white text-xs">
                    <span className="font-bold text-rose-400">Misconception: </span>
                    {attempt.misconception}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Session saved to your Firestore learning history</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onStartNewTopic}
            className="flex-1 sm:flex-initial px-5 py-3 rounded-xl border border-white/15 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs transition-all cursor-pointer backdrop-blur-md"
          >
            Study Another Topic
          </button>

          <button
            onClick={onGoToDashboard}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 glow-blue transition-all cursor-pointer"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

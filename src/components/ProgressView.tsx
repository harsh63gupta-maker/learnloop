import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  RotateCcw,
  Target,
  Brain,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import type { UserProgressSummary, LearningSession } from '../types';

interface ProgressViewProps {
  progress: UserProgressSummary | null;
  sessions: LearningSession[];
  onStartLearning: (topic?: string, concept?: string) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  progress,
  sessions,
  onStartLearning,
}) => {
  // Aggregate topic mastery from sessions
  const topicStatsMap = new Map<string, { scores: number[]; weakConcepts: Set<string>; strongConcepts: Set<string> }>();

  sessions.forEach(s => {
    if (!topicStatsMap.has(s.topic)) {
      topicStatsMap.set(s.topic, { scores: [], weakConcepts: new Set(), strongConcepts: new Set() });
    }
    const cur = topicStatsMap.get(s.topic)!;
    cur.scores.push(s.score);
    s.conceptsNeedingImprovement?.forEach(c => cur.weakConcepts.add(c));
    s.conceptsUnderstood?.forEach(c => cur.strongConcepts.add(c));
  });

  const topicList = Array.from(topicStatsMap.entries()).map(([topic, data]) => {
    const avgScore = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
    return {
      topic,
      avgScore,
      attemptsCount: data.scores.length,
      weakConcepts: Array.from(data.weakConcepts),
      strongConcepts: Array.from(data.strongConcepts)
    };
  });

  // Collect all unique misconceptions detected across all sessions
  const allDetectedMisconceptions: Array<{
    topic: string;
    concept: string;
    misconception: string;
    question: string;
  }> = [];

  sessions.forEach(s => {
    s.detectedMisconceptions?.forEach(m => {
      allDetectedMisconceptions.push({
        topic: s.topic,
        concept: m.concept,
        misconception: m.misconception,
        question: m.question
      });
    });
    // Also extract from attempts if detectedMisconceptions was empty
    s.attempts?.forEach(a => {
      if (a.misconception) {
        allDetectedMisconceptions.push({
          topic: s.topic,
          concept: a.concept,
          misconception: a.misconception,
          question: a.questionText
        });
      }
    });
  });

  const overallUnderstanding = progress?.overallUnderstanding ?? 0;
  const weakTopics = progress?.weakTopics ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-white">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-md">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Mastery Analytics</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            MY PROGRESS
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Tracking your understanding across topics, concept-level scores, and identified thinking gaps.
          </p>
        </div>

        <button
          onClick={() => onStartLearning()}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 glow-blue transition-all self-start sm:self-auto cursor-pointer"
        >
          <span>Learn New Topic</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-xl backdrop-blur-md text-white">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Overall Understanding
          </div>
          <div className="text-4xl font-black text-white mt-1 flex items-baseline gap-1.5">
            {overallUnderstanding}%
            <span className="text-xs font-semibold text-slate-400">mastery</span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              style={{ width: `${Math.min(100, Math.max(5, overallUnderstanding))}%` }}
            />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-xl backdrop-blur-md text-white">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Topics Assessed
          </div>
          <div className="text-4xl font-black text-white mt-1">
            {progress?.totalTopicsStudied ?? topicList.length}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Multi-question conceptual diagnostics
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-xl backdrop-blur-md text-white">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Misconceptions Corrected
          </div>
          <div className="text-4xl font-black text-emerald-400 mt-1">
            {allDetectedMisconceptions.length}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Gaps caught before exams
          </p>
        </div>
      </div>

      {/* Topics Mastery Table / List (Exact Prompt format: C Programming 82%, Data Structures 64%, etc.) */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl backdrop-blur-xl text-white space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">
              Topic-Level Mastery
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-400">
            {topicList.length} topics logged
          </span>
        </div>

        {topicList.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-white/[0.03] border border-dashed border-white/15 backdrop-blur-md">
            <p className="text-sm font-semibold text-slate-300">No topic data recorded yet</p>
            <p className="text-xs text-slate-400 mt-1">Complete your first study session to populate your progress.</p>
            <button
              onClick={() => onStartLearning('Binary Search')}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
            >
              Start with Binary Search
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {topicList.map(t => {
              const isHigh = t.avgScore >= 80;
              const isMid = t.avgScore >= 60 && t.avgScore < 80;
              return (
                <div
                  key={t.topic}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 backdrop-blur-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">{t.topic}</h3>
                      <span className="text-[11px] text-slate-400">
                        {t.attemptsCount} {t.attemptsCount === 1 ? 'quiz attempt' : 'quiz attempts'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-lg font-black px-3 py-1 rounded-xl border backdrop-blur-md ${
                          isHigh
                            ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
                            : isMid
                            ? 'bg-amber-500/20 border-amber-400/30 text-amber-300'
                            : 'bg-rose-500/20 border-rose-400/30 text-rose-300'
                        }`}
                      >
                        {t.avgScore}%
                      </span>
                      <button
                        onClick={() => onStartLearning(t.topic, t.weakConcepts[0])}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Practice</span>
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isHigh ? 'bg-emerald-500' : isMid ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${t.avgScore}%` }}
                    />
                  </div>

                  {/* Concept breakdown tags */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                    {t.weakConcepts.map(wc => (
                      <span
                        key={wc}
                        className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-400/30 font-semibold backdrop-blur-md"
                      >
                        • {wc} (needs practice)
                      </span>
                    ))}
                    {t.strongConcepts.map(sc => (
                      <span
                        key={sc}
                        className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 font-semibold backdrop-blur-md"
                      >
                        ✓ {sc}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Weak Topics Highlight Section (Prompt Requirement) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/10 shadow-xl backdrop-blur-md text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-base mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h2>Weak Topics Needing Review</h2>
            </div>

            {weakTopics.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-400/30 text-emerald-200 text-xs backdrop-blur-md">
                No weak topics flagged right now. Keep up the high mastery!
              </div>
            ) : (
              <ul className="space-y-3">
                {weakTopics.map(w => (
                  <li
                    key={w.topic}
                    className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-400/30 flex items-start justify-between gap-3 text-xs backdrop-blur-md"
                  >
                    <div>
                      <span className="font-bold text-white block text-sm">
                        • {w.topic}
                      </span>
                      {w.weakConcepts.length > 0 && (
                        <p className="text-slate-300 mt-1">
                          Sub-concepts: {w.weakConcepts.join(', ')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => onStartLearning(w.topic, w.weakConcepts[0])}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/30 shrink-0 cursor-pointer"
                    >
                      Review
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Detected Misconceptions Archive */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/10 shadow-xl backdrop-blur-md text-white">
          <div className="flex items-center gap-2 text-white font-bold text-base mb-4">
            <Brain className="w-5 h-5 text-indigo-400" />
            <h2>Detected Misconceptions Archive</h2>
          </div>

          {allDetectedMisconceptions.length === 0 ? (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-slate-400 text-xs backdrop-blur-md">
              No misconceptions recorded yet. When you answer questions during a quiz, any incorrect mental models will be archived here for revision.
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {allDetectedMisconceptions.slice(0, 6).map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/70 border border-indigo-500/30 text-white text-xs space-y-1 shadow-md backdrop-blur-md"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-blue-400">{m.topic}</span>
                    <span>{m.concept}</span>
                  </div>
                  <p className="text-slate-200 font-medium leading-relaxed">
                    "{m.misconception}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

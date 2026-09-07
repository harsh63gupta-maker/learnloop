import React, { useState, useRef } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Repeat,
  Sparkles,
  TrendingUp,
  XCircle,
  Brain,
  ShieldCheck,
  Zap,
  Search,
  Code2,
  Cpu,
  Binary,
  Atom,
  Compass,
  GraduationCap,
  X
} from 'lucide-react';
import type { SubjectType, LearningLevel } from '../types';

interface LandingViewProps {
  onStartLearning: (
    suggestedTopic?: string,
    concept?: string,
    subject?: SubjectType,
    autoStart?: boolean,
    level?: LearningLevel
  ) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStartLearning }) => {
  const [searchTopic, setSearchTopic] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<LearningLevel>('Beginner');
  const [inputError, setInputError] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Exact examples requested by the user
  const exampleQueries = [
    'Explain recursion',
    'Teach me Python decorators',
    "Explain Newton's laws",
    'What is normalization in DBMS?',
    'Explain photosynthesis'
  ];

  // Subject/Category cards requested
  const subjectCategories: Array<{
    id: SubjectType;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    borderGlow: string;
    topics: string[];
  }> = [
    {
      id: 'Programming',
      title: 'Programming',
      description: 'Languages, data structures, and software engineering',
      icon: Code2,
      accentColor: 'text-cyan-400',
      borderGlow: 'hover:border-cyan-400/40',
      topics: [
        'Python',
        'C',
        'C++',
        'Java',
        'Data Structures & Algorithms'
      ]
    },
    {
      id: 'Computer Science',
      title: 'Computer Science',
      description: 'Systems, operating systems, databases, and AI theory',
      icon: Cpu,
      accentColor: 'text-blue-400',
      borderGlow: 'hover:border-blue-400/40',
      topics: [
        'DBMS',
        'Operating Systems',
        'Computer Networks',
        'Artificial Intelligence',
        'Machine Learning',
        'Computer Architecture'
      ]
    },
    {
      id: 'Mathematics',
      title: 'Mathematics',
      description: 'Algebra, calculus, probability, and statistical methods',
      icon: Binary,
      accentColor: 'text-indigo-400',
      borderGlow: 'hover:border-indigo-400/40',
      topics: [
        'Algebra',
        'Calculus',
        'Probability',
        'Statistics'
      ]
    },
    {
      id: 'Science',
      title: 'Science',
      description: 'Physics, chemistry, biology, and scientific inquiry',
      icon: Atom,
      accentColor: 'text-emerald-400',
      borderGlow: 'hover:border-emerald-400/40',
      topics: [
        'Physics',
        'Chemistry',
        'Biology'
      ]
    },
    {
      id: 'Other',
      title: 'Other Disciplines',
      description: 'Economics, philosophy, psychology, or custom questions',
      icon: Compass,
      accentColor: 'text-purple-400',
      borderGlow: 'hover:border-purple-400/40',
      topics: [
        'Economics & Markets',
        'Philosophy & Ethics',
        'Cognitive Psychology',
        'Formal Logic'
      ]
    }
  ];

  const inferSubject = (topicString: string): SubjectType => {
    const lower = topicString.toLowerCase();
    if (
      lower.includes('python') ||
      lower.includes(' c ') ||
      lower.startsWith('c ') ||
      lower.includes('c++') ||
      lower.includes('java') ||
      lower.includes('data structure') ||
      lower.includes('algorithm') ||
      lower.includes('decorator') ||
      lower.includes('pointer') ||
      lower.includes('recursion')
    ) {
      return 'Programming';
    }
    if (
      lower.includes('dbms') ||
      lower.includes('database') ||
      lower.includes('normalization') ||
      lower.includes('operating system') ||
      lower.includes('network') ||
      lower.includes('artificial intelligence') ||
      lower.includes('machine learning') ||
      lower.includes('architecture')
    ) {
      return 'Computer Science';
    }
    if (
      lower.includes('calculus') ||
      lower.includes('algebra') ||
      lower.includes('probability') ||
      lower.includes('statistic')
    ) {
      return 'Mathematics';
    }
    if (
      lower.includes('physics') ||
      lower.includes('newton') ||
      lower.includes('chemistry') ||
      lower.includes('biology') ||
      lower.includes('photosynthesis')
    ) {
      return 'Science';
    }
    return 'Other';
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTopic = searchTopic.trim();
    if (!cleanTopic) {
      setInputError('Please enter any topic or question to learn.');
      searchInputRef.current?.focus();
      return;
    }
    setInputError(null);
    const inferred = inferSubject(cleanTopic);
    onStartLearning(cleanTopic, undefined, inferred, true, selectedLevel);
  };

  const handlePredefinedTopicClick = (topicName: string, subject: SubjectType) => {
    setSearchTopic(topicName);
    onStartLearning(topicName, undefined, subject, true, selectedLevel);
  };

  const handleExampleClick = (example: string) => {
    setSearchTopic(example);
    const inferred = inferSubject(example);
    onStartLearning(example, undefined, inferred, true, selectedLevel);
  };

  const loopSteps = [
    {
      step: '1',
      title: 'LEARN',
      desc: 'Intuitive AI explanation using clear analogies, code snippets, and bite-sized concepts.',
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-600',
      tag: 'No Jargon'
    },
    {
      step: '2',
      title: 'TEST',
      desc: '5 targeted conceptual questions (MCQs, True/False, and Short Answer).',
      icon: HelpCircle,
      color: 'from-indigo-500 to-purple-600',
      tag: 'One by One'
    },
    {
      step: '3',
      title: 'ANALYZE',
      desc: 'Gemini examines your exact thinking to diagnose the root conceptual misconception.',
      icon: Brain,
      color: 'from-amber-500 to-orange-600',
      tag: 'Root Cause'
    },
    {
      step: '4',
      title: 'EXPLAIN MISTAKE',
      desc: 'Never just "Wrong". Explains why your answer failed and re-teaches with a fresh angle.',
      icon: Lightbulb,
      color: 'from-rose-500 to-pink-600',
      tag: 'Fresh Analogy'
    },
    {
      step: '5',
      title: 'RETEST',
      desc: 'An immediate follow-up question on the same concept checks if you truly get it.',
      icon: Repeat,
      color: 'from-emerald-500 to-teal-600',
      tag: 'Verification'
    },
    {
      step: '6',
      title: 'IMPROVE',
      desc: 'Persistent concept-level breakdown saved to your private Firestore profile.',
      icon: TrendingUp,
      color: 'from-teal-500 to-cyan-600',
      tag: 'Mastery Score'
    }
  ];

  return (
    <div className="space-y-20 pb-16 text-white">
      {/* Hero Section */}
      <section className="pt-10 md:pt-16 text-center max-w-4xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6 shadow-xs backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          The Anti-Chatbot Adaptive Learning Loop
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.12]">
          Learn. Test. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
            Understand. Improve.
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          LearnLoop helps you understand difficult topics by teaching you, testing you, and diagnosing your exact mistakes.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Private student records in Cloud Firestore</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Powered by Gemini AI Tutor</span>
          </div>
        </div>
      </section>

      {/* "What do you want to learn today?" Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
            What do you want to learn today?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
            You are never limited to a predefined list. Enter any subject, coding concept, physics law, or academic inquiry below.
          </p>
        </div>

        {/* 1. Prominent Search / Input Box */}
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={handleSearchSubmit}
            className="glass-card rounded-2xl p-2 sm:p-2.5 border border-white/20 shadow-2xl backdrop-blur-2xl transition-all focus-within:border-blue-400/80 focus-within:shadow-[0_0_30px_rgba(59,130,246,0.3)] flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex items-center gap-3 w-full px-3 py-1.5">
              <Search className="w-5 h-5 text-blue-400 shrink-0" />
              <input
                ref={searchInputRef}
                id="landing-search-topic-input"
                type="text"
                value={searchTopic}
                onChange={(e) => {
                  setSearchTopic(e.target.value);
                  if (inputError) setInputError(null);
                }}
                placeholder="Search or enter any topic..."
                className="w-full bg-transparent text-white text-base sm:text-lg placeholder:text-slate-400 focus:outline-hidden"
              />
              {searchTopic && (
                <button
                  type="button"
                  onClick={() => setSearchTopic('')}
                  className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              id="landing-submit-search-btn"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-blue-600/30 glow-blue transition-all cursor-pointer shrink-0"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Start Learning</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {inputError && (
            <p className="text-xs font-semibold text-rose-400 mt-2 text-center">
              {inputError}
            </p>
          )}

          {/* Clickable Example Prompts */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Try asking:
            </span>
            {exampleQueries.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => handleExampleClick(ex)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-blue-600/20 border border-white/10 hover:border-blue-400/40 text-slate-300 hover:text-blue-200 transition-all cursor-pointer backdrop-blur-md shadow-xs active:scale-95"
              >
                "{ex}"
              </button>
            ))}
          </div>
        </div>

        {/* 2. Subject / Category Cards */}
        <div className="pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <span>Subject & Category Shortcuts</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any topic below to jump straight into the LearnLoop teaching flow.
              </p>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 font-medium self-start sm:self-auto">
              Any Academic Topic Supported
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjectCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.title}
                  className={`glass-card rounded-2xl p-5 border border-white/10 shadow-xl backdrop-blur-xl transition-all hover:bg-white/[0.05] ${category.borderGlow} flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                        <Icon className={`w-5 h-5 ${category.accentColor}`} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">
                          {category.title}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {category.description}
                        </p>
                      </div>
                    </div>

                    {/* 3. Predefined topic clicks start LearnLoop teaching flow */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {category.topics.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handlePredefinedTopicClick(t, category.id)}
                          className="text-xs px-3 py-1.5 rounded-xl border border-white/10 hover:border-blue-400/40 bg-white/[0.03] hover:bg-blue-600/20 text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 backdrop-blur-md active:scale-95"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400/80" />
                          <span>{t}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {category.id === 'Other' && (
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Custom topic?</span>
                      <button
                        type="button"
                        onClick={() => {
                          searchInputRef.current?.focus();
                          searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Enter query above</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 p-4 rounded-2xl glass border border-blue-400/20 bg-blue-950/20 text-slate-300 text-xs sm:text-sm flex items-start gap-3 backdrop-blur-xl">
            <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">Note:</strong> The subject cards are only shortcuts for convenience. Gemini will never reject a topic just because it is not in the predefined list. Feel free to type any university lecture, exam concept, or programming question.
            </p>
          </div>
        </div>
      </section>

      {/* The Core Adaptive Loop Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            The Continuous Mastery Loop
          </h2>
          <p className="mt-2 text-slate-400 text-sm max-w-xl mx-auto">
            Not a generic prompt-and-answer box. A structured pedagogical feedback loop designed to catch flaws in mental models.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loopSteps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all text-white backdrop-blur-md relative overflow-hidden flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-white/10 text-slate-200 border border-white/10">
                    {item.tag}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs font-black tracking-wider text-blue-400 mb-1">
                    <span>STEP {item.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparison: Generic Chatbot vs LearnLoop */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="glass rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/15 bg-white/[0.04] backdrop-blur-xl text-white">
          <div className="text-center mb-8">
            <span className="text-xs font-bold tracking-widest text-blue-400 uppercase">
              Why LearnLoop Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 text-white">
              The Problem with Standard AI Chatbots
            </h2>
            <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
              Generic chatbots give answers instantly, robbing students of learning struggle and leaving hidden misconceptions unchecked.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Generic Chatbot */}
            <div className="bg-rose-950/20 rounded-2xl p-6 border border-rose-500/30 backdrop-blur-md">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-4">
                <XCircle className="w-5 h-5" />
                <span>Standard ChatGPT / AI Chatbots</span>
              </div>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                  <p className="text-slate-400 font-medium">Student answer: "Binary search works on any array."</p>
                </div>
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-200">
                  <p className="font-semibold text-rose-300 mb-1">Generic Bot:</p>
                  <p>"Incorrect. The answer is sorted arrays. Binary search has O(log n) time complexity. Let me know if you have other questions."</p>
                </div>
                <p className="text-slate-400 text-[11px] italic">
                  Result: Student never understood WHY sorting was mandatory and repeats the error on test day.
                </p>
              </div>
            </div>

            {/* LearnLoop */}
            <div className="bg-emerald-950/20 rounded-2xl p-6 border border-emerald-500/30 backdrop-blur-md">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-4">
                <CheckCircle2 className="w-5 h-5" />
                <span>LearnLoop Adaptive Tutor</span>
              </div>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                  <p className="text-slate-400 font-medium">Student answer: "Binary search works on any array."</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-200">
                  <p className="font-semibold text-emerald-300 mb-1">LearnLoop Diagnosis:</p>
                  <p>"Not quite. Binary search relies on data being ordered. Because it's sorted, we can eliminate half of the remaining space by checking the middle element..."</p>
                  <p className="mt-2 font-medium text-amber-300 bg-amber-950/40 p-1.5 rounded border border-amber-500/20">
                    Identified Misconception: Ignored monotonic ordering prerequisite.
                  </p>
                  <p className="mt-2 text-blue-300">
                    Follow-Up Question generated immediately to verify understanding!
                  </p>
                </div>
                <p className="text-emerald-400 text-[11px] font-medium">
                  Result: Student corrects their mental model and achieves concept mastery.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => onStartLearning('Binary Search', undefined, 'Computer Science', true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/30 glow-blue transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Experience The Difference with Binary Search</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

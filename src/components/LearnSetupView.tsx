import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Code2,
  Cpu,
  Binary,
  Atom,
  Compass,
  CheckCircle2,
  AlertCircle,
  Zap,
  X,
  BookOpen
} from 'lucide-react';
import type { SubjectType, LearningLevel } from '../types';

interface LearnSetupViewProps {
  initialTopic?: string;
  initialConcept?: string;
  onStartTeaching: (topic: string, subject: SubjectType, level: LearningLevel, conceptToReview?: string) => void;
  isLoading: boolean;
}

export const LearnSetupView: React.FC<LearnSetupViewProps> = ({
  initialTopic = '',
  initialConcept = '',
  onStartTeaching,
  isLoading
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [level, setLevel] = useState<LearningLevel>('Beginner');
  const [conceptReview, setConceptReview] = useState(initialConcept);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [activeCardLoading, setActiveCardLoading] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
    if (initialConcept) setConceptReview(initialConcept);
  }, [initialTopic, initialConcept]);

  // Specific example prompts requested
  const exampleQueries = [
    'Explain recursion',
    'Teach me Python decorators',
    "Explain Newton's laws",
    'What is normalization in DBMS?',
    'Explain photosynthesis'
  ];

  // Subject/Category Cards data as specified in user request
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
      description: 'Languages, algorithms, and software implementation',
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
      description: 'Core systems, theoretical foundations, and architectures',
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
      description: 'Proofs, calculus, statistics, and analytical reasoning',
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
      description: 'Empirical laws, physics, chemistry, and biological systems',
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
      description: 'Economics, philosophy, logic, psychology, or any custom study',
      icon: Compass,
      accentColor: 'text-purple-400',
      borderGlow: 'hover:border-purple-400/40',
      topics: [
        'Economics & Game Theory',
        'Philosophy & Ethics',
        'Cognitive Psychology',
        'Formal Logic & Fallacies',
        'World History',
        'Neuroscience'
      ]
    }
  ];

  const levels: Array<{ id: LearningLevel; label: string; desc: string }> = [
    {
      id: 'Beginner',
      label: 'Beginner',
      desc: 'Intuitive analogies, plain English, high school to early collegiate'
    },
    {
      id: 'Intermediate',
      label: 'Intermediate',
      desc: 'Standard collegiate rigor, mechanisms, trade-offs, and edge cases'
    },
    {
      id: 'Advanced',
      label: 'Advanced',
      desc: 'Mathematical rigor, architectural trade-offs, and deep theory'
    }
  ];

  // Helper to infer or assign subject based on topic
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
      lower.includes('recursion') ||
      lower.includes('code')
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
      lower.includes('architecture') ||
      lower.includes('cpu')
    ) {
      return 'Computer Science';
    }
    if (
      lower.includes('calculus') ||
      lower.includes('algebra') ||
      lower.includes('probability') ||
      lower.includes('statistic') ||
      lower.includes('bayes') ||
      lower.includes('matrix') ||
      lower.includes('derivative') ||
      lower.includes('integral')
    ) {
      return 'Mathematics';
    }
    if (
      lower.includes('physics') ||
      lower.includes('newton') ||
      lower.includes('chemistry') ||
      lower.includes('biology') ||
      lower.includes('photosynthesis') ||
      lower.includes('reaction') ||
      lower.includes('thermodynamics')
    ) {
      return 'Science';
    }
    return 'Other';
  };

  const handleCustomSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanTopic = topic.trim();
    if (!cleanTopic) {
      setValidationError('Please enter a topic or question to learn.');
      searchInputRef.current?.focus();
      return;
    }
    setValidationError(null);
    const subject = inferSubject(cleanTopic);
    onStartTeaching(cleanTopic, subject, level, conceptReview || undefined);
  };

  const handleTopicClick = (clickedTopic: string, categorySubject: SubjectType) => {
    setTopic(clickedTopic);
    setActiveCardLoading(clickedTopic);
    setValidationError(null);
    // Start normal LearnLoop teaching flow immediately on click
    onStartTeaching(clickedTopic, categorySubject, level, conceptReview || undefined);
  };

  const handleExampleClick = (example: string) => {
    setTopic(example);
    setValidationError(null);
    const subject = inferSubject(example);
    onStartTeaching(example, subject, level, conceptReview || undefined);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10 text-white">
      {/* Targeted Review Alert if student came from review button */}
      {conceptReview && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-400/30 text-sm text-amber-200 flex items-start justify-between gap-3 shadow-lg backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Targeted Misconception Review:</span> You are reviewing your diagnosed gap in{' '}
              <span className="font-bold text-amber-300 underline underline-offset-2">{conceptReview}</span>.
              <p className="text-xs text-amber-300/80 mt-1">
                Gemini will teach this concept with a fresh mental model and follow up with a verification check.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setConceptReview('')}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-xs font-semibold text-amber-200 transition-colors cursor-pointer shrink-0"
          >
            Clear Focus
          </button>
        </div>
      )}

      {/* Main Hero / "What do you want to learn today?" Section */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Infinite Adaptive Curriculum</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          What do you want to learn today?
        </h1>

        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          LearnLoop is not limited to predefined topics. Enter any academic topic, question, or conceptual puzzle.
          Gemini will teach you with relatable analogies, diagnose your misconceptions, and re-test your understanding.
        </p>

        {/* 1. Prominent Search / Input Box */}
        <div className="max-w-3xl mx-auto pt-3">
          <form
            onSubmit={handleCustomSubmit}
            className="glass-card rounded-2xl p-2 sm:p-2.5 border border-white/20 shadow-2xl backdrop-blur-2xl transition-all focus-within:border-blue-400/70 focus-within:shadow-[0_0_30px_rgba(59,130,246,0.3)] flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex items-center gap-3 w-full px-3 py-1.5">
              <Search className="w-5 h-5 text-blue-400 shrink-0" />
              <input
                ref={searchInputRef}
                id="search-topic-input"
                type="text"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Search or enter any topic..."
                className="w-full bg-transparent text-white text-base sm:text-lg placeholder:text-slate-400 focus:outline-hidden"
              />
              {topic && (
                <button
                  type="button"
                  onClick={() => setTopic('')}
                  className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              id="submit-topic-search-btn"
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-blue-600/30 glow-blue transition-all cursor-pointer disabled:opacity-60 shrink-0"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Preparing...</span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-4 h-4" />
                  <span>Start Learning</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {validationError && (
            <p className="text-xs font-semibold text-rose-400 mt-2 flex items-center justify-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{validationError}</span>
            </p>
          )}

          {/* 4. Clickable Example Inquiries */}
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
      </section>

      {/* Learning Level Selector */}
      <section className="max-w-3xl mx-auto glass-card rounded-2xl p-4 sm:p-5 border border-white/10 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Select Your Learning Level
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Adapts vocabulary, analogies, and quiz difficulty
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {levels.map((l) => {
            const isSelected = level === l.id;
            return (
              <button
                key={l.id}
                type="button"
                id={`level-option-${l.id.toLowerCase()}`}
                onClick={() => setLevel(l.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between backdrop-blur-md ${
                  isSelected
                    ? 'border-blue-400/80 bg-blue-600/30 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                    : 'border-white/10 hover:border-white/20 bg-white/[0.02] text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black uppercase tracking-wider ${isSelected ? 'text-blue-300' : 'text-slate-200'}`}>
                    {l.label}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {l.desc}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Subject / Category Cards Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-blue-400" />
              <span>Explore by Subject</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Click any topic shortcut below to launch the learning loop immediately, or enter your own custom topic above.
            </p>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 font-semibold self-start sm:self-auto">
            1-Click Instant Learning
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjectCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.title}
                id={`category-card-${category.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                className={`glass-card rounded-2xl p-5 border border-white/10 shadow-xl backdrop-blur-xl transition-all hover:bg-white/[0.05] ${category.borderGlow} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                      <Icon className={`w-5 h-5 ${category.accentColor}`} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">
                        {category.title}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  {/* 3. When student clicks predefined topic, start LearnLoop teaching flow */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {category.topics.map((t) => {
                      const isThisActive = activeCardLoading === t && isLoading;
                      return (
                        <button
                          key={t}
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleTopicClick(t, category.id)}
                          className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 backdrop-blur-md active:scale-95 disabled:opacity-50 ${
                            topic === t
                              ? 'bg-blue-600 text-white border-blue-400 font-bold shadow-md shadow-blue-600/30'
                              : 'bg-white/[0.03] hover:bg-blue-600/20 hover:border-blue-400/40 text-slate-200 hover:text-white border-white/10'
                          }`}
                        >
                          {isThisActive ? (
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400/80" />
                          )}
                          <span>{t}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {category.id === 'Other' && (
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Have a custom topic?</span>
                    <button
                      type="button"
                      onClick={() => {
                        searchInputRef.current?.focus();
                        searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Type above</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Informative Guidance Banner */}
        <div className="p-4 rounded-2xl glass border border-blue-400/20 bg-blue-950/20 text-slate-300 text-xs sm:text-sm flex items-start gap-3 backdrop-blur-xl">
          <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white">Subject cards are convenient shortcuts.</span>
            <p className="text-slate-300 leading-relaxed text-xs">
              Gemini is fully equipped to teach <strong>any academic discipline, technical concept, or university subject</strong>.
              Whether you want to understand complex algorithms, quantum physics, calculus theorems, or organic chemistry mechanisms,
              simply type your query in the search box to start your tailored knowledge check loop.
            </p>
          </div>
        </div>
      </section>

      {/* The 7-Step LearnLoop Process Overview */}
      <section className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl backdrop-blur-xl text-center space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Guaranteed Mental Model Mastery
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            The Continuous LearnLoop Flow
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl mx-auto">
            Every topic you choose passes through our adaptive cycle to ensure you never walk away with unaddressed misconceptions.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 text-center text-xs">
          {[
            { step: '1', name: 'TOPIC', sub: 'Any Subject' },
            { step: '2', name: 'TEACH', sub: 'Intuitive Analogy' },
            { step: '3', name: 'CHECK', sub: 'Mental Model' },
            { step: '4', name: 'QUIZ', sub: '5 Questions' },
            { step: '5', name: 'EVALUATE', sub: 'Diagnose Gap' },
            { step: '6', name: 'EXPLAIN', sub: 'Fix Mistake' },
            { step: '7', name: 'RE-TEST', sub: 'Verify Learning' },
            { step: '8', name: 'SAVE', sub: 'Track Progress' }
          ].map((item, idx) => (
            <div
              key={item.name}
              className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center backdrop-blur-md"
            >
              <span className="w-5 h-5 rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-300 text-[10px] font-black flex items-center justify-center mb-1.5">
                {idx + 1}
              </span>
              <span className="font-bold text-white text-[11px]">{item.name}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">{item.sub}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

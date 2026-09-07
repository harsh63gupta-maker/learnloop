import React, { useState } from 'react';
import Markdown from 'react-markdown';
import {
  Sparkles,
  ArrowRight,
  Send,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import type { TeachingMessage, SubjectType, LearningLevel } from '../types';

interface TeachingViewProps {
  topic: string;
  subject: SubjectType;
  level: LearningLevel;
  messages: TeachingMessage[];
  isLoading: boolean;
  lessonError?: string | null;
  onRetryLesson?: () => void;
  onSendMessage: (content: string) => void;
  onStartQuiz: () => void;
  onBackToSetup: () => void;
}

export const TeachingView: React.FC<TeachingViewProps> = ({
  topic,
  subject,
  level,
  messages,
  isLoading,
  lessonError,
  onRetryLesson,
  onSendMessage,
  onStartQuiz,
  onBackToSetup
}) => {
  const [inputVal, setInputVal] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isLoading) return;
    onSendMessage(inputVal.trim());
    setInputVal('');
  };

  const initialModelMessage = messages.find(m => m.role === 'model');
  const conversationMessages = messages.filter(m => m !== initialModelMessage);
  const isLessonReady = Boolean(initialModelMessage && !lessonError);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header Card */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-400/20">
              {subject}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
              {level} Level
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1.5 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400 shrink-0" />
            <span>{topic}</span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={onBackToSetup}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border border-white/10 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer backdrop-blur-md"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Change Topic</span>
          </button>

          {/* Only show Quiz button if the lesson was successfully generated */}
          {isLessonReady && !isLoading && (
            <button
              id="ready-for-quiz-top-btn"
              onClick={onStartQuiz}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
            >
              <span>Take 5-Question Quiz</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ERROR STATE: Failed to generate lesson */}
      {lessonError ? (
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-amber-500/30 bg-amber-950/20 shadow-2xl backdrop-blur-xl text-center space-y-5 text-white">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto shadow-md">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              We encountered an issue preparing the lesson
            </h2>
            <p className="text-slate-300 text-sm mt-2 max-w-lg mx-auto leading-relaxed">
              We couldn't generate the AI lesson for <strong className="text-white font-semibold">"{topic}"</strong> right now. Please verify your connection or try again.
            </p>
            {lessonError !== 'Failed to generate lesson.' && (
              <p className="text-xs text-amber-300/80 bg-black/40 rounded-xl p-3 max-w-lg mx-auto mt-3 font-mono border border-amber-500/20 overflow-x-auto">
                {lessonError}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {onRetryLesson && (
              <button
                id="retry-lesson-btn"
                onClick={onRetryLesson}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Retrying...' : 'Try Again'}</span>
              </button>
            )}

            <button
              onClick={onBackToSetup}
              className="px-5 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-sm transition-all cursor-pointer"
            >
              Choose Another Topic
            </button>
          </div>
        </div>
      ) : initialModelMessage ? (
        /* SUCCESS STATE: Lesson Generated */
        <div className="glass-card rounded-3xl p-6 sm:p-9 border border-white/10 shadow-2xl backdrop-blur-xl relative text-white">
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">LearnLoop AI Tutor</span>
                <span className="text-[11px] text-slate-400">Conceptual lesson & intuition anchor</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-400/20 backdrop-blur-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Step 1: Teaching</span>
            </div>
          </div>

          {/* Render Markdown Lesson */}
          <div className="markdown-content text-slate-200">
            <Markdown>{initialModelMessage.content}</Markdown>
          </div>

          {/* Callout to Quiz */}
          <div className="mt-8 pt-6 border-t border-white/10 bg-gradient-to-r from-blue-600/20 via-indigo-600/15 to-transparent rounded-2xl p-6 border border-blue-400/25 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
                <Lightbulb className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Ready to test your mental model?</span>
              </div>
              <p className="text-slate-300 text-xs mt-1">
                LearnLoop will ask 5 conceptual questions. If you make a mistake, we'll explain the exact misconception!
              </p>
            </div>
            <button
              id="ready-for-quiz-main-btn"
              onClick={onStartQuiz}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 glow-blue transition-all cursor-pointer shrink-0"
            >
              <span>Take 5-Question Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* LOADING STATE */
        <div className="glass-card rounded-3xl p-12 text-center border border-white/10 shadow-lg backdrop-blur-md text-white">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white">
            Crafting intuitive explanation for {topic}...
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Formulating real-world analogies and code examples suited for {level} level.
          </p>
        </div>
      )}

      {/* Multi-turn Student Follow-up Conversation (Available once lesson is generated) */}
      {isLessonReady && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-5 text-white backdrop-blur-md">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span>Have a question before testing? Ask the AI Tutor</span>
          </div>

          {conversationMessages.length > 0 && (
            <div className="space-y-4 pt-2">
              {conversationMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600/80 text-white ml-8 sm:ml-16 shadow-md border border-blue-400/30'
                      : 'bg-white/[0.04] border border-white/10 text-slate-200 mr-8 sm:mr-16'
                  }`}
                >
                  <div className="text-[10px] font-bold opacity-75 uppercase tracking-wider mb-1">
                    {msg.role === 'user' ? 'You' : 'AI Tutor'}
                  </div>
                  {msg.role === 'model' ? (
                    <div className="markdown-content text-slate-200">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300 flex items-center gap-2 backdrop-blur-md">
              <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span>AI Tutor is thinking...</span>
            </div>
          )}

          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask a follow-up question (e.g., 'Can you explain why the base case comes first?')"
              className="glass-input flex-1 px-4 py-3 rounded-xl text-white placeholder:text-slate-500 text-xs sm:text-sm outline-hidden shadow-inner"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isLoading}
              className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask</span>
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Ask anything if you feel unclear before jumping into the quiz</span>
            <button
              type="button"
              onClick={onStartQuiz}
              className="text-blue-400 hover:text-blue-300 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Take 5-Question Quiz</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

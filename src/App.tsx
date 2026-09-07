import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { LandingView } from './components/LandingView';
import { DashboardView } from './components/DashboardView';
import { LearnSetupView } from './components/LearnSetupView';
import { TeachingView } from './components/TeachingView';
import { QuizView } from './components/QuizView';
import { ResultsView } from './components/ResultsView';
import { ProgressView } from './components/ProgressView';
import { HistoryView } from './components/HistoryView';
import { ProfileView } from './components/ProfileView';

import { auth, onAuthStateChanged, signOut, type User } from './lib/firebase';
import {
  getUserSessions,
  getUserProgress,
  saveLearningSession
} from './lib/firestore';
import type {
  SubjectType,
  LearningLevel,
  TeachingMessage,
  QuizQuestion,
  QuestionAttempt,
  ConceptMastery,
  LearningSession,
  UserProgressSummary
} from './types';

type NavigationTab = 'landing' | 'dashboard' | 'learn' | 'progress' | 'history' | 'profile';
type LearnSubStep = 'setup' | 'teaching' | 'quiz' | 'results';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<NavigationTab>('landing');
  const [learnStep, setLearnStep] = useState<LearnSubStep>('setup');

  // Firestore persistent state
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [progress, setProgress] = useState<UserProgressSummary | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  // Active learning session state
  const [currentTopic, setCurrentTopic] = useState('');
  const [currentSubject, setCurrentSubject] = useState<SubjectType>('Computer Science');
  const [currentLevel, setCurrentLevel] = useState<LearningLevel>('Beginner');
  const [conceptToReview, setConceptToReview] = useState<string | undefined>(undefined);

  // Teaching state
  const [teachingMessages, setTeachingMessages] = useState<TeachingMessage[]>([]);
  const [isTeachingLoading, setIsTeachingLoading] = useState(false);
  const [lessonError, setLessonError] = useState<string | null>(null);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Completed session for Results view
  const [completedSession, setCompletedSession] = useState<LearningSession | null>(null);

  // Pending topic if user clicked start while unauthenticated
  const pendingLearnRef = React.useRef<{
    topic?: string;
    concept?: string;
    subject?: SubjectType;
    autoStart?: boolean;
    level?: LearningLevel;
  } | null>(null);

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        // If a topic was pending before sign-in, run it immediately
        if (pendingLearnRef.current?.topic) {
          const pending = pendingLearnRef.current;
          pendingLearnRef.current = null;
          handleStartLearning(
            pending.topic,
            pending.concept,
            pending.subject,
            pending.autoStart,
            pending.level
          );
        } else {
          setActiveTab((prev) => (prev === 'landing' ? 'dashboard' : prev));
        }
        loadUserData(currentUser.uid);
      } else {
        setSessions([]);
        setProgress(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (uid: string) => {
    try {
      setDataLoading(true);
      const [userSessions, userProg] = await Promise.all([
        getUserSessions(uid),
        getUserProgress(uid)
      ]);
      setSessions(userSessions);
      setProgress(userProg);
    } catch (err) {
      console.error('Error loading user data from Firestore:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setActiveTab('landing');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  // Start Learning trigger (from Landing, Dashboard, or Navbar)
  const handleStartLearning = (
    topic?: string,
    concept?: string,
    subject?: SubjectType,
    autoStart?: boolean,
    level?: LearningLevel
  ) => {
    if (topic) setCurrentTopic(topic);
    if (concept) setConceptToReview(concept);
    if (subject) setCurrentSubject(subject);
    if (level) setCurrentLevel(level);

    if (!user) {
      pendingLearnRef.current = { topic, concept, subject, autoStart, level };
      setIsAuthModalOpen(true);
      return;
    }

    if (autoStart && topic) {
      handleStartTeaching(
        topic,
        subject || currentSubject,
        level || currentLevel,
        concept
      );
    } else {
      setActiveTab('learn');
      setLearnStep('setup');
    }
  };

  // Triggered from LearnSetupView: calls /api/teach
  const handleStartTeaching = async (
    topic: string,
    subject: SubjectType,
    level: LearningLevel,
    reviewConcept?: string
  ) => {
    setCurrentTopic(topic);
    setCurrentSubject(subject);
    setCurrentLevel(level);
    setConceptToReview(reviewConcept);
    setLearnStep('teaching');
    setTeachingMessages([]);
    setLessonError(null);
    setIsTeachingLoading(true);

    try {
      const response = await fetch('/api/teach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          subject,
          level,
          conceptToReview: reviewConcept
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate lesson.');
      }

      const data = await response.json();
      setTeachingMessages([
        {
          id: `msg_${Date.now()}`,
          role: 'model',
          content: data.content,
          timestamp: Date.now()
        }
      ]);
    } catch (err: any) {
      console.error('Error starting teaching:', err);
      setLessonError(err?.message || 'We encountered an issue preparing the lesson. Please verify your connection or try again.');
    } finally {
      setIsTeachingLoading(false);
    }
  };

  // Follow-up question during teaching
  const handleSendTeachingMessage = async (text: string) => {
    const userMsg: TeachingMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    const newMessages = [...teachingMessages, userMsg];
    setTeachingMessages(newMessages);
    setIsTeachingLoading(true);

    try {
      const response = await fetch('/api/teach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentTopic,
          subject: currentSubject,
          level: currentLevel,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) throw new Error('Failed to answer student question.');

      const data = await response.json();
      setTeachingMessages([
        ...newMessages,
        {
          id: `msg_model_${Date.now()}`,
          role: 'model',
          content: data.content,
          timestamp: Date.now()
        }
      ]);
    } catch (err) {
      console.error('Error in student follow-up:', err);
    } finally {
      setIsTeachingLoading(false);
    }
  };

  // Generate 5-question quiz
  const handleStartQuiz = async () => {
    if (lessonError || isTeachingLoading) return;
    setIsGeneratingQuiz(true);
    setLearnStep('quiz');

    try {
      // Find any previously weak concepts for this topic to target
      const pastSession = sessions.find(s => s.topic.toLowerCase() === currentTopic.toLowerCase());
      const weakConcepts = pastSession?.conceptsNeedingImprovement || (conceptToReview ? [conceptToReview] : []);

      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentTopic,
          subject: currentSubject,
          level: currentLevel,
          weakConcepts
        })
      });

      if (!response.ok) throw new Error('Failed to generate quiz.');

      const data = await response.json();
      const questions: QuizQuestion[] = data.questions || [];

      if (questions.length === 0) {
        // Fallback default questions if API returned empty
        setQuizQuestions([
          {
            id: 'q1',
            question: `What is the fundamental prerequisite or rule for ${currentTopic}?`,
            type: 'short_answer',
            concept: 'Core Prerequisite',
            difficulty: currentLevel
          },
          {
            id: 'q2',
            question: `True or False: ${currentTopic} can be performed without checking boundaries or base conditions.`,
            type: 'true_false',
            options: ['True', 'False'],
            concept: 'Boundary Conditions',
            difficulty: currentLevel
          }
        ]);
      } else {
        setQuizQuestions(questions);
      }
    } catch (err) {
      console.error('Error generating quiz:', err);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // When student finishes the quiz: evaluate concepts, call recommendations, save to Firestore
  const handleCompleteQuiz = async (
    attempts: QuestionAttempt[],
    conceptBreakdown: Record<string, ConceptMastery>,
    score: number
  ) => {
    const conceptsUnderstood: string[] = [];
    const conceptsNeedingImprovement: string[] = [];

    Object.values(conceptBreakdown).forEach(c => {
      if (c.status === 'strong') {
        conceptsUnderstood.push(c.conceptName);
      } else {
        conceptsNeedingImprovement.push(c.conceptName);
      }
    });

    const detectedMisconceptions = attempts
      .filter(a => !a.isCorrect && a.misconception)
      .map(a => ({
        concept: a.concept,
        misconception: a.misconception!,
        question: a.questionText,
        studentAnswer: a.studentAnswer,
        explanation: a.diagnosis
      }));

    // Fetch AI Recommendations
    let recommendations: string[] = [];
    try {
      const recRes = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentTopic,
          score,
          weakConcepts: conceptsNeedingImprovement,
          strongConcepts: conceptsUnderstood,
          recentTopics: sessions.slice(0, 3).map(s => s.topic)
        })
      });
      if (recRes.ok) {
        const recData = await recRes.json();
        recommendations = recData.recommendations || [];
      }
    } catch (recErr) {
      console.warn('Failed to fetch recommendations:', recErr);
    }

    const newSession: LearningSession = {
      id: `session_${Date.now()}`,
      userId: user?.uid || 'guest_user',
      topic: currentTopic,
      subject: currentSubject,
      level: currentLevel,
      score,
      correctCount: attempts.filter(a => a.isCorrect).length,
      incorrectCount: attempts.filter(a => !a.isCorrect).length,
      totalQuestions: attempts.length,
      conceptsUnderstood,
      conceptsNeedingImprovement,
      conceptBreakdown,
      detectedMisconceptions,
      attempts,
      recommendations,
      createdAt: Date.now()
    };

    setCompletedSession(newSession);
    setLearnStep('results');

    // Persist in Firestore if user is authenticated
    if (user) {
      try {
        await saveLearningSession(newSession);
        // Refresh local sessions & progress state
        await loadUserData(user.uid);
      } catch (err) {
        console.error('Failed to persist session to Firestore:', err);
      }
    } else {
      // Local fallback for guest
      setSessions(prev => [newSession, ...prev]);
    }
  };

  const handleReviewWeakTopic = (topic: string, concept?: string) => {
    handleStartLearning(topic, concept);
    handleStartTeaching(topic, currentSubject, currentLevel, concept);
  };

  const handleSelectSessionForReview = (session: LearningSession) => {
    setCompletedSession(session);
    setActiveTab('learn');
    setLearnStep('results');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] mesh-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-300 text-sm font-semibold">Initializing LearnLoop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-600/30 selection:text-blue-200 relative overflow-x-hidden">
      {/* Mesh Gradient Ambient Backdrop */}
      <div className="mesh-gradient pointer-events-none fixed inset-0 z-0" />

      {/* Top Navigation */}
      <div className="relative z-30">
        <Navbar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'learn') setLearnStep('setup');
          }}
          user={user}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onSignOut={handleSignOut}
        />
      </div>

      {/* Main View Router */}
      <main className="flex-1 relative z-10">
        {activeTab === 'landing' && (
          <LandingView onStartLearning={handleStartLearning} />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            user={user}
            progress={progress}
            recentSessions={sessions}
            onStartLearning={handleStartLearning}
            onViewProgress={() => setActiveTab('progress')}
            onViewHistory={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'learn' && (
          <div>
            {learnStep === 'setup' && (
              <LearnSetupView
                initialTopic={currentTopic}
                initialConcept={conceptToReview}
                onStartTeaching={handleStartTeaching}
                isLoading={isTeachingLoading}
              />
            )}

            {learnStep === 'teaching' && (
              <TeachingView
                topic={currentTopic}
                subject={currentSubject}
                level={currentLevel}
                messages={teachingMessages}
                isLoading={isTeachingLoading}
                lessonError={lessonError}
                onRetryLesson={() => handleStartTeaching(currentTopic, currentSubject, currentLevel, conceptToReview)}
                onSendMessage={handleSendTeachingMessage}
                onStartQuiz={handleStartQuiz}
                onBackToSetup={() => setLearnStep('setup')}
              />
            )}

            {learnStep === 'quiz' && (
              isGeneratingQuiz ? (
                <div className="max-w-xl mx-auto py-20 text-center glass-card rounded-3xl p-8 border border-white/10 shadow-2xl backdrop-blur-xl">
                  <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-white">Generating 5-Question Quiz...</h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Designing targeted conceptual tests on {currentTopic} to diagnose mental models.
                  </p>
                </div>
              ) : (
                <QuizView
                  topic={currentTopic}
                  questions={quizQuestions}
                  onCompleteQuiz={handleCompleteQuiz}
                  onCancel={() => setLearnStep('setup')}
                />
              )
            )}

            {learnStep === 'results' && completedSession && (
              <ResultsView
                session={completedSession}
                onReviewWeakTopic={handleReviewWeakTopic}
                onStartNewTopic={() => setLearnStep('setup')}
                onGoToDashboard={() => setActiveTab('dashboard')}
              />
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <ProgressView
            progress={progress}
            sessions={sessions}
            onStartLearning={handleStartLearning}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            sessions={sessions}
            onSelectSessionForReview={handleSelectSessionForReview}
            onPracticeTopic={(topic) => handleStartLearning(topic)}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            user={user}
            progress={progress}
            onSignOut={handleSignOut}
            onRefreshData={() => user && loadUserData(user.uid)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/[0.02] backdrop-blur-md py-6 mt-12 text-center text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">LearnLoop</span>
            <span className="text-slate-600">—</span>
            <span className="text-slate-400">Adaptive AI Learning Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>LEARN → TEST → ANALYZE → EXPLAIN MISTAKE → RETEST → IMPROVE</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          setActiveTab('dashboard');
        }}
      />
    </div>
  );
}

export type SubjectType =
  | 'Programming'
  | 'Computer Science'
  | 'Mathematics'
  | 'Science'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'General Science'
  | 'Other';

export type LearningLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface TeachingMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[]; // for multiple_choice and true_false
  concept: string; // The core concept tested
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface AnswerEvaluation {
  isCorrect: boolean;
  diagnosis: string;
  misconception?: string;
  concept: string;
  reTeaching?: string;
  analogy?: string;
  followUpQuestion?: QuizQuestion;
  recurringMisconceptionDetected?: boolean;
  recurringIntervention?: string;
}

export interface ConceptMastery {
  conceptName: string;
  totalTested: number;
  correctCount: number;
  percentage: number;
  status: 'strong' | 'needs_practice' | 'weak';
}

export interface QuestionAttempt {
  questionId: string;
  questionText: string;
  type: QuestionType;
  concept: string;
  studentAnswer: string;
  isCorrect: boolean;
  diagnosis: string;
  misconception?: string;
  reTeaching?: string;
  isFollowUp?: boolean;
}

export interface LearningSession {
  id: string;
  userId: string;
  topic: string;
  subject: string;
  level: LearningLevel;
  score: number; // percentage 0-100
  correctCount: number;
  incorrectCount: number;
  totalQuestions: number;
  conceptsUnderstood: string[];
  conceptsNeedingImprovement: string[];
  conceptBreakdown: Record<string, ConceptMastery>;
  detectedMisconceptions: Array<{
    concept: string;
    misconception: string;
    question: string;
    studentAnswer: string;
    explanation: string;
  }>;
  attempts: QuestionAttempt[];
  recommendations: string[];
  createdAt: number;
}

export interface UserProgressSummary {
  userId: string;
  totalSessions: number;
  totalTopicsStudied: number;
  overallUnderstanding: number;
  weakTopics: Array<{ topic: string; score: number; weakConcepts: string[] }>;
  strongTopics: Array<{ topic: string; score: number; concepts: string[] }>;
  recentScores: Array<{ topic: string; score: number; date: string; sessionId: string }>;
  personalizedRecommendation?: string;
  updatedAt: number;
}

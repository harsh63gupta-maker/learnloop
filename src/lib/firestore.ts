import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import type { LearningSession, UserProgressSummary } from '../types';

export async function saveLearningSession(session: LearningSession): Promise<void> {
  try {
    const sessionDocRef = doc(db, 'users', session.userId, 'sessions', session.id);
    await setDoc(sessionDocRef, session);

    // After saving, recalculate and update user's overall progress summary
    await updateUserProgress(session.userId);
  } catch (error) {
    console.error('Error saving learning session:', error);
    throw error;
  }
}

export async function getUserSessions(userId: string): Promise<LearningSession[]> {
  try {
    const sessionsRef = collection(db, 'users', userId, 'sessions');
    const q = query(sessionsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => doc.data() as LearningSession);
  } catch (error) {
    console.error('Error getting user sessions:', error);
    return [];
  }
}

export async function getUserProgress(userId: string): Promise<UserProgressSummary | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      return snap.data() as UserProgressSummary;
    }

    // If no progress document exists yet, check sessions to build one or return default
    return await updateUserProgress(userId);
  } catch (error) {
    console.error('Error getting user progress:', error);
    return null;
  }
}

export async function updateUserProgress(userId: string): Promise<UserProgressSummary> {
  try {
    const sessions = await getUserSessions(userId);

    if (sessions.length === 0) {
      const emptySummary: UserProgressSummary = {
        userId,
        totalSessions: 0,
        totalTopicsStudied: 0,
        overallUnderstanding: 0,
        weakTopics: [],
        strongTopics: [],
        recentScores: [],
        updatedAt: Date.now(),
      };
      await setDoc(doc(db, 'users', userId), emptySummary);
      return emptySummary;
    }

    // Calculate unique topics
    const topicMap = new Map<string, { scores: number[]; weakConcepts: Set<string>; strongConcepts: Set<string> }>();

    for (const s of sessions) {
      if (!topicMap.has(s.topic)) {
        topicMap.set(s.topic, { scores: [], weakConcepts: new Set(), strongConcepts: new Set() });
      }
      const data = topicMap.get(s.topic)!;
      data.scores.push(s.score);
      (s.conceptsNeedingImprovement || []).forEach(c => data.weakConcepts.add(c));
      (s.conceptsUnderstood || []).forEach(c => data.strongConcepts.add(c));
    }

    let totalScoreSum = 0;
    const weakTopics: Array<{ topic: string; score: number; weakConcepts: string[] }> = [];
    const strongTopics: Array<{ topic: string; score: number; concepts: string[] }> = [];

    topicMap.forEach((info, topic) => {
      const avgScore = Math.round(info.scores.reduce((a, b) => a + b, 0) / info.scores.length);
      totalScoreSum += avgScore;

      if (avgScore < 70 || info.weakConcepts.size > 0) {
        weakTopics.push({
          topic,
          score: avgScore,
          weakConcepts: Array.from(info.weakConcepts)
        });
      } else {
        strongTopics.push({
          topic,
          score: avgScore,
          concepts: Array.from(info.strongConcepts)
        });
      }
    });

    const overallUnderstanding = topicMap.size > 0 ? Math.round(totalScoreSum / topicMap.size) : 0;

    const recentScores = sessions.slice(0, 8).map(s => ({
      sessionId: s.id,
      topic: s.topic,
      score: s.score,
      date: new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }));

    const summary: UserProgressSummary = {
      userId,
      totalSessions: sessions.length,
      totalTopicsStudied: topicMap.size,
      overallUnderstanding,
      weakTopics,
      strongTopics,
      recentScores,
      updatedAt: Date.now()
    };

    await setDoc(doc(db, 'users', userId), summary);
    return summary;
  } catch (err) {
    console.error('Error updating user progress:', err);
    throw err;
  }
}

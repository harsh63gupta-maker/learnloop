import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Repeat,
  Sparkles,
  Layers,
  Send,
  Target
} from 'lucide-react';
import type {
  QuizQuestion,
  AnswerEvaluation,
  ConceptMastery,
  QuestionAttempt
} from '../types';

interface QuizViewProps {
  topic: string;
  questions: QuizQuestion[];
  onCompleteQuiz: (
    attempts: QuestionAttempt[],
    conceptBreakdown: Record<string, ConceptMastery>,
    score: number
  ) => void;
  onCancel: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  topic,
  questions,
  onCompleteQuiz,
  onCancel,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);

  // Follow-up question state (when student makes a mistake)
  const [followUpAnswer, setFollowUpAnswer] = useState<string>('');
  const [isEvaluatingFollowUp, setIsEvaluatingFollowUp] = useState(false);
  const [followUpEvaluation, setFollowUpEvaluation] = useState<AnswerEvaluation | null>(null);

  // Concept performance tracking across the session
  const [conceptStats, setConceptStats] = useState<
    Record<string, { total: number; correct: number }>
  >({});
  const [attempts, setAttempts] = useState<QuestionAttempt[]>([]);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  // Track how many mistakes student made on this concept so far
  const conceptMistakeCount = conceptStats[currentQuestion?.concept]?.total
    ? conceptStats[currentQuestion.concept].total - conceptStats[currentQuestion.concept].correct
    : 0;

  const handleOptionSelect = (option: string) => {
    if (evaluation) return;
    setSelectedOption(option);
  };

  const handleSubmitAnswer = async () => {
    const answer =
      currentQuestion.type === 'short_answer'
        ? textAnswer.trim()
        : selectedOption;

    if (!answer || isEvaluating) return;

    try {
      setIsEvaluating(true);

      const response = await fetch('/api/quiz/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          question: currentQuestion,
          studentAnswer: answer,
          previousMistakesOnConcept: conceptMistakeCount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate answer');
      }

      const evalResult: AnswerEvaluation = await response.json();
      setEvaluation(evalResult);

      // Update concept tracking
      const conceptName = currentQuestion.concept || 'General Understanding';
      setConceptStats((prev) => {
        const existing = prev[conceptName] || { total: 0, correct: 0 };
        return {
          ...prev,
          [conceptName]: {
            total: existing.total + 1,
            correct: existing.correct + (evalResult.isCorrect ? 1 : 0),
          },
        };
      });

      // Record attempt
      const attempt: QuestionAttempt = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.question,
        type: currentQuestion.type,
        concept: conceptName,
        studentAnswer: answer,
        isCorrect: evalResult.isCorrect,
        diagnosis: evalResult.diagnosis,
        misconception: evalResult.misconception,
        reTeaching: evalResult.reTeaching,
      };
      setAttempts((prev) => [...prev, attempt]);
    } catch (err) {
      console.error('Error submitting answer:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleFollowUpSubmit = async () => {
    if (!evaluation?.followUpQuestion || !followUpAnswer.trim() || isEvaluatingFollowUp)
      return;

    try {
      setIsEvaluatingFollowUp(true);

      const response = await fetch('/api/quiz/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          question: evaluation.followUpQuestion,
          studentAnswer: followUpAnswer.trim(),
          previousMistakesOnConcept: conceptMistakeCount + 1,
        }),
      });

      if (!response.ok) throw new Error('Failed to evaluate follow-up');

      const followUpEvalResult: AnswerEvaluation = await response.json();
      setFollowUpEvaluation(followUpEvalResult);

      // If they got the follow-up right, credit their concept mastery!
      const conceptName = currentQuestion.concept;
      setConceptStats((prev) => {
        const existing = prev[conceptName] || { total: 0, correct: 0 };
        return {
          ...prev,
          [conceptName]: {
            total: existing.total + 1,
            correct: existing.correct + (followUpEvalResult.isCorrect ? 1 : 0),
          },
        };
      });

      const attempt: QuestionAttempt = {
        questionId: evaluation.followUpQuestion.id,
        questionText: evaluation.followUpQuestion.question,
        type: evaluation.followUpQuestion.type,
        concept: conceptName,
        studentAnswer: followUpAnswer.trim(),
        isCorrect: followUpEvalResult.isCorrect,
        diagnosis: followUpEvalResult.diagnosis,
        isFollowUp: true,
      };
      setAttempts((prev) => [...prev, attempt]);
    } catch (err) {
      console.error('Error evaluating follow up:', err);
    } finally {
      setIsEvaluatingFollowUp(false);
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      finishQuiz();
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedOption('');
    setTextAnswer('');
    setEvaluation(null);
    setFollowUpAnswer('');
    setFollowUpEvaluation(null);
  };

  const finishQuiz = () => {
    // Compile final concept breakdown
    const finalBreakdown: Record<string, ConceptMastery> = {};
    let totalTested = 0;
    let totalCorrect = 0;

    Object.entries(conceptStats).forEach(([cName, stats]) => {
      const pct = Math.round((stats.correct / stats.total) * 100);
      let status: 'strong' | 'needs_practice' | 'weak' = 'needs_practice';
      if (pct >= 75) status = 'strong';
      else if (pct < 50) status = 'weak';

      finalBreakdown[cName] = {
        conceptName: cName,
        totalTested: stats.total,
        correctCount: stats.correct,
        percentage: pct,
        status,
      };

      totalTested += stats.total;
      totalCorrect += stats.correct;
    });

    const overallScore =
      totalTested > 0 ? Math.round((totalCorrect / totalTested) * 100) : 0;

    onCompleteQuiz(attempts, finalBreakdown, overallScore);
  };

  if (!currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center text-white">
        <p className="text-slate-400">No questions available.</p>
        <button
          onClick={onCancel}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl cursor-pointer"
        >
          Return to Setup
        </button>
      </div>
    );
  }

  const isCurrentAnswerEntered =
    currentQuestion.type === 'short_answer'
      ? textAnswer.trim().length > 0
      : !!selectedOption;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Progress & Header */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 shadow-lg backdrop-blur-md text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                {topic}
              </span>
              <span className="text-white/20">•</span>
              <span className="text-xs font-bold text-slate-400">
                Adaptive Knowledge Check
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-lg font-bold text-white">
                Question {currentIndex + 1} of {questions.length}
              </h2>
            </div>
          </div>

          {/* Targeted concept badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold self-start sm:self-auto backdrop-blur-md">
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            <span>Target Concept: {currentQuestion.concept}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Main Question Box */}
      <div className="glass-card rounded-3xl p-6 sm:p-9 border border-white/10 shadow-2xl space-y-6 text-white backdrop-blur-xl">
        {/* Question Text */}
        <div className="flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
            Q{currentIndex + 1}
          </div>
          <div className="flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              {currentQuestion.type === 'multiple_choice'
                ? 'Multiple Choice'
                : currentQuestion.type === 'true_false'
                ? 'True or False'
                : 'Short Conceptual Answer'}
            </span>
            <p className="text-lg sm:text-xl font-bold text-white leading-snug">
              {currentQuestion.question}
            </p>
          </div>
        </div>

        {/* Options / Input based on question type */}
        {currentQuestion.type === 'short_answer' ? (
          <div>
            <textarea
              rows={3}
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              disabled={!!evaluation || isEvaluating}
              placeholder="Explain in your own words (e.g. why does this occur, or what is the prerequisite?)..."
              className="glass-input w-full p-4 rounded-xl text-sm text-white placeholder:text-slate-500 outline-hidden shadow-inner disabled:opacity-60"
            />
          </div>
        ) : (
          <div className="space-y-3">
            {(
              currentQuestion.options ||
              (currentQuestion.type === 'true_false' ? ['True', 'False'] : [])
            ).map((opt, idx) => {
              const isSelected = selectedOption === opt;
              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleOptionSelect(opt)}
                  disabled={!!evaluation || isEvaluating}
                  className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between cursor-pointer backdrop-blur-md ${
                    isSelected
                      ? 'border-blue-400/90 bg-blue-600/30 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] font-semibold'
                      : 'border-white/10 hover:border-white/20 hover:bg-white/[0.04] bg-white/[0.02] text-slate-200'
                  } disabled:cursor-not-allowed`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                        isSelected
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Submit Answer Action */}
        {!evaluation && (
          <div className="pt-2 flex justify-end">
            <button
              id="submit-answer-btn"
              onClick={handleSubmitAnswer}
              disabled={!isCurrentAnswerEntered || isEvaluating}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 glow-blue disabled:opacity-50 transition-all cursor-pointer"
            >
              {isEvaluating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing Conceptual Thinking...</span>
                </>
              ) : (
                <>
                  <span>Submit Answer</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* EVALUATION RESULT: THE CORE ADAPTIVE TEACHING LOOP */}
        {evaluation && (
          <div className="space-y-6 pt-4 border-t border-white/10 animate-in fade-in duration-300">
            {/* Outcome Banner */}
            <div
              className={`p-5 rounded-2xl border flex items-start gap-3.5 backdrop-blur-md ${
                evaluation.isCorrect
                  ? 'bg-emerald-950/40 border-emerald-400/30 text-emerald-200'
                  : 'bg-amber-950/40 border-amber-400/30 text-amber-200'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  evaluation.isCorrect
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-400/30'
                }`}
              >
                {evaluation.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider">
                    {evaluation.isCorrect
                      ? 'Concept Mastered!'
                      : 'Conceptual Misconception Identified'}
                  </span>
                </div>
                <p className="text-sm font-medium mt-1 leading-relaxed">
                  {evaluation.diagnosis}
                </p>
              </div>
            </div>

            {/* ADAPTIVE MISCONCEPTION BREAKDOWN (For incorrect answers) */}
            {!evaluation.isCorrect && (
              <div className="space-y-4">
                {/* 1. Identified Misconception */}
                {evaluation.misconception && (
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-rose-500/30 text-white shadow-md backdrop-blur-md">
                    <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
                      <Target className="w-4 h-4" />
                      <span>Diagnosed Misconception</span>
                    </div>
                    <p className="text-sm text-slate-200 font-medium">
                      "{evaluation.misconception}"
                    </p>
                  </div>
                )}

                {/* 2. Re-teaching with Simpler Explanation & Analogy */}
                {evaluation.reTeaching && (
                  <div className="p-5 rounded-2xl bg-blue-950/30 border border-blue-400/25 text-slate-200 space-y-2 backdrop-blur-md">
                    <div className="flex items-center gap-2 text-blue-300 font-bold text-xs uppercase tracking-wider">
                      <Lightbulb className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span>Let's Look At This Differently</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {evaluation.reTeaching}
                    </p>

                    {evaluation.analogy && (
                      <div className="mt-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300 flex items-start gap-2.5 backdrop-blur-md">
                        <span className="font-bold text-blue-400 shrink-0">
                          Analogy:
                        </span>
                        <span className="italic">{evaluation.analogy}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Recurring Misconception Intervention (if detected) */}
                {evaluation.recurringMisconceptionDetected &&
                  evaluation.recurringIntervention && (
                    <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 backdrop-blur-md">
                      <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-rose-400 mb-1">
                        <Repeat className="w-4 h-4" />
                        <span>Recurring Barrier Detected</span>
                      </div>
                      <p className="text-xs leading-relaxed">
                        {evaluation.recurringIntervention}
                      </p>
                    </div>
                  )}

                {/* 4. IMMEDIATE VERIFICATION FOLLOW-UP QUESTION */}
                {evaluation.followUpQuestion && (
                  <div className="mt-6 p-6 rounded-2xl bg-indigo-950/30 border border-indigo-400/30 space-y-4 backdrop-blur-md text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                        <Repeat className="w-4 h-4" />
                        <span>Immediate Verification Check</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                        Concept Check
                      </span>
                    </div>

                    <p className="text-sm sm:text-base font-bold text-white">
                      {evaluation.followUpQuestion.question}
                    </p>

                    {/* Follow-up Question Inputs */}
                    {evaluation.followUpQuestion.options &&
                    evaluation.followUpQuestion.options.length > 0 ? (
                      <div className="space-y-2">
                        {evaluation.followUpQuestion.options.map((fOpt, fIdx) => (
                          <button
                            type="button"
                            key={fIdx}
                            onClick={() => setFollowUpAnswer(fOpt)}
                            disabled={
                              !!followUpEvaluation || isEvaluatingFollowUp
                            }
                            className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer backdrop-blur-md ${
                              followUpAnswer === fOpt
                                ? 'border-indigo-400 bg-indigo-600/30 text-white font-bold shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                                : 'border-white/10 bg-white/[0.03] hover:bg-white/10 text-slate-300'
                            }`}
                          >
                            {fOpt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={followUpAnswer}
                        onChange={(e) => setFollowUpAnswer(e.target.value)}
                        placeholder="Your quick answer to verify understanding..."
                        disabled={!!followUpEvaluation || isEvaluatingFollowUp}
                        className="glass-input w-full p-3 rounded-xl text-xs text-white placeholder:text-slate-500 outline-hidden"
                      />
                    )}

                    {!followUpEvaluation && (
                      <button
                        onClick={handleFollowUpSubmit}
                        disabled={
                          !followUpAnswer.trim() || isEvaluatingFollowUp
                        }
                        className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {isEvaluatingFollowUp ? (
                          <span>Verifying...</span>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Verify My Understanding</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Follow-up Result */}
                    {followUpEvaluation && (
                      <div
                        className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 backdrop-blur-md ${
                          followUpEvaluation.isCorrect
                            ? 'bg-emerald-950/40 border border-emerald-400/30 text-emerald-200'
                            : 'bg-amber-950/40 border border-amber-400/30 text-amber-200'
                        }`}
                      >
                        {followUpEvaluation.isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>
                              Brilliant! You grasped the distinction and corrected your mental model!
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>
                              Good attempt. We've recorded this concept so you can review it at the end.
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Next Question / Finish Quiz button */}
            <div className="pt-2 flex justify-end">
              <button
                id="next-question-btn"
                onClick={handleNextQuestion}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 glow-blue transition-all cursor-pointer"
              >
                <span>
                  {isLastQuestion
                    ? 'Complete & View Understanding Report'
                    : 'Next Question'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Live Concept Tracking Footer */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs text-white backdrop-blur-md">
        <div className="flex items-center gap-2 text-slate-400 font-semibold">
          <Layers className="w-4 h-4 text-blue-400" />
          <span>Active Learning Loop:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(conceptStats).map(([cName, stats]) => {
            const pct = Math.round((stats.correct / stats.total) * 100);
            return (
              <span
                key={cName}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border backdrop-blur-md ${
                  pct >= 75
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                    : pct >= 50
                    ? 'bg-amber-500/15 text-amber-300 border-amber-400/30'
                    : 'bg-rose-500/15 text-rose-300 border-rose-400/30'
                }`}
              >
                {cName}: {pct}%
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

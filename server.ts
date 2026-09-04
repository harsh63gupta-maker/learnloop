import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;
const CANDIDATE_MODELS = ['gemini-3.6-flash', 'gemini-3.8-flash'];

app.use(express.json({ limit: '10mb' }));

// Lazy initialization for Gemini client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Resilient Gemini caller with model fallback and exponential backoff retry for transient 503/429 errors
async function callGeminiWithRetry(options: {
  contents: any;
  config?: any;
  maxAttempts?: number;
}): Promise<any> {
  const ai = getAI();
  const maxAttempts = options.maxAttempts ?? 3;
  let lastError: any = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: options.config,
        });
        if (response && (response.text !== undefined || (response as any).candidates)) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini API] Model ${model} attempt ${attempt + 1} encountered:`, err?.status || err?.message || err);
      }
    }
    // Exponential backoff before next attempt
    const delay = Math.min(1000 * Math.pow(2, attempt), 3000);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  throw lastError || new Error('All Gemini model candidates failed after retries.');
}

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// 1. AI TEACHING MODE ENDPOINT
app.post('/api/teach', async (req: Request, res: Response) => {
  try {
    const { topic, subject = 'General', level = 'Beginner', messages = [], conceptToReview } = req.body;

    if (!topic || typeof topic !== 'string') {
      res.status(400).json({ error: 'Topic is required.' });
      return;
    }

    const ai = getAI();

    const systemInstruction = `You are LearnLoop's AI Adaptive Tutor.
Your goal is to teach students difficult academic topics in simple, intuitive, student-friendly language so they truly understand the underlying concepts.

IMPORTANT SCOPE GUIDELINE:
Students can learn ANY academic topic, subject, or question.
The topic input can be:
- A predefined or standard subject (e.g. "Python", "Data Structures & Algorithms", "DBMS", "Operating Systems", "Calculus", "Physics")
- Or ANY custom inquiry or question (e.g. "Explain recursion", "Teach me Python decorators", "Explain Newton's laws", "What is normalization in DBMS?", "Explain photosynthesis", "How do transformer attention mechanisms work?")
Never reject any legitimate academic or technical topic. Teach it thoroughly and intuitively.

TEACHING RULES:
1. Start with a simple, clear explanation tailored to the student's level (${level}).
2. Avoid unnecessary jargon. When technical terms are needed, define them gently.
3. Use a relatable real-world analogy to anchor intuition.
4. Break complicated ideas into small, manageable parts.
5. Provide concrete examples. For programming topics, include short, clean, well-commented code snippets.
6. Do NOT overwhelm the student with too much text at once.
7. Format with clean Markdown (headings, bold text, bullet points).
8. At the very end, encourage the student and ask if they are ready for their interactive knowledge check!`;

    let prompt = '';
    if (messages.length > 0) {
      // Follow-up conversation
      const lastUserMsg = messages[messages.length - 1]?.content || '';
      prompt = `Topic: "${topic}" (${subject}, Level: ${level}).
Student follow-up question or message: "${lastUserMsg}".
Respond to the student's question in simple terms, resolving any confusion, and ask if they are ready to test their knowledge.`;
    } else if (conceptToReview) {
      // Reviewing a specific weak concept
      prompt = `The student is reviewing the topic "${topic}" (${subject}), specifically the concept they struggled with: "${conceptToReview}".
Level: ${level}.
Teach this specific concept from a fresh angle with a simple new analogy, clear explanation, and an intuitive example so they overcome their previous confusion. Then ask if they want to try the quiz again.`;
    } else {
      // Fresh lesson
      prompt = `Teach the topic: "${topic}".
Subject: ${subject}.
Target Audience Level: ${level}.
Follow the teaching rules to provide a friendly, intuitive lesson.`;
    }

    const response = await callGeminiWithRetry({
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    res.json({
      content: response.text || 'Unable to generate explanation. Please try again.',
    });
  } catch (error: any) {
    console.error('Error in /api/teach:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate teaching response.',
    });
  }
});

// 2. QUIZ GENERATION ENDPOINT
app.post('/api/quiz/generate', async (req: Request, res: Response) => {
  try {
    const { topic, subject = 'General', level = 'Beginner', weakConcepts = [] } = req.body;

    if (!topic || typeof topic !== 'string') {
      res.status(400).json({ error: 'Topic is required.' });
      return;
    }

    const ai = getAI();

    const systemInstruction = `You are LearnLoop's Quiz Architect.
Your job is to generate a structured 5-question adaptive quiz that tests genuine conceptual understanding, not trivial trivia or syntax memorization.

The topic may be a concise subject name (e.g. "Data Structures", "Operating Systems", "Calculus") or a natural language inquiry (e.g. "Explain recursion", "Teach me Python decorators", "Explain Newton's laws", "What is normalization in DBMS?", "Explain photosynthesis").
Extract the underlying core academic concept and generate 5 conceptual questions testing it.

REQUIREMENTS:
- Exactly 5 questions.
- A mixture of question types:
  - multiple_choice (4 clear distinct options)
  - true_false (options must be ["True", "False"])
  - short_answer (no options)
- Each question MUST target a specific fundamental sub-concept of "${topic}".
- ${weakConcepts.length > 0 ? `Pay special attention to testing these previously weak concepts: ${weakConcepts.join(', ')}.` : ''}
- Do NOT include answers or spoilers in the question text.
- Output strictly valid JSON matching the specified schema.`;

    const prompt = `Generate a 5-question conceptual quiz for topic: "${topic}" (${subject}, Level: ${level}).
Return a JSON array of objects with the following format:
[
  {
    "id": "q1",
    "question": "Question text...",
    "type": "multiple_choice" | "true_false" | "short_answer",
    "options": ["Option A", "Option B", "Option C", "Option D"] (or ["True", "False"] for true_false, omit or empty array for short_answer),
    "concept": "Specific sub-concept tested (e.g., 'Sorted Array Prerequisite')",
    "difficulty": "${level}"
  }
]`;

    const response = await callGeminiWithRetry({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    let questions = [];
    try {
      const text = response.text || '[]';
      questions = JSON.parse(text);
      if (!Array.isArray(questions) && (questions as any).questions) {
        questions = (questions as any).questions;
      }
    } catch (parseErr) {
      console.error('Failed to parse quiz questions JSON:', parseErr);
      questions = [];
    }

    res.json({ questions });
  } catch (error: any) {
    console.error('Error in /api/quiz/generate:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate quiz.',
    });
  }
});

// 3. ANSWER EVALUATION & ADAPTIVE MISCONCEPTION DIAGNOSIS (CORE ENGINE)
app.post('/api/quiz/evaluate', async (req: Request, res: Response) => {
  try {
    const { topic, question, studentAnswer, previousMistakesOnConcept = 0 } = req.body;

    if (!question || studentAnswer === undefined) {
      res.status(400).json({ error: 'Question and studentAnswer are required.' });
      return;
    }

    const ai = getAI();

    const systemInstruction = `You are LearnLoop's Adaptive Evaluator.
YOUR HIGHEST PRIORITY DIRECTIVE:
Evaluate the student's answer for genuine conceptual understanding.

CRITICAL INSTRUCTION FOR INCORRECT ANSWERS:
- DO NOT simply say "Wrong. The correct answer is X."
- Explain WHY the student's answer is incorrect.
- Identify the specific misconception or flawed mental model behind the answer.
- Give a simpler explanation of that concept.
- Use a different analogy or real-world example to clarify intuition.
- Then generate a SIMILAR FOLLOW-UP QUESTION on the same concept to verify whether the student now understands!
${previousMistakesOnConcept >= 1 ? '- The student has struggled with this concept repeatedly. Trigger recurringMisconceptionDetected = true and provide a recurringIntervention breaking down the concept from square one.' : ''}

CRITICAL INSTRUCTION FOR CORRECT ANSWERS:
- Explain briefly why the reasoning is sound and praise the understanding.
- Do NOT generate a follow-up question for correct answers.`;

    const prompt = `Topic: "${topic}"
Question: "${question.question}"
Question Type: "${question.type}"
Options (if applicable): ${JSON.stringify(question.options || [])}
Target Concept: "${question.concept}"
Student's Submitted Answer: "${studentAnswer}"
Previous mistakes by student on this concept: ${previousMistakesOnConcept}

Return strict JSON with this exact schema:
{
  "isCorrect": boolean,
  "diagnosis": "Detailed friendly explanation of why the answer is correct OR why it is incorrect and the logic behind it",
  "misconception": "If incorrect, concise identification of the specific misconception (e.g., 'Confused linear search unsorted capability with binary search requirements')",
  "concept": "${question.concept}",
  "reTeaching": "If incorrect, re-explain the concept using a simpler and different approach",
  "analogy": "If incorrect, a relatable fresh analogy",
  "recurringMisconceptionDetected": ${previousMistakesOnConcept >= 1 ? 'true' : 'false'},
  "recurringIntervention": "If recurringMisconceptionDetected, a deep-dive breakdown addressing the recurring barrier",
  "followUpQuestion": {
    "id": "follow_up_${Date.now()}",
    "question": "A similar question to re-test the concept",
    "type": "multiple_choice" | "true_false" | "short_answer",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"] (or ["True", "False"] or empty for short_answer),
    "concept": "${question.concept}"
  } (or null if isCorrect is true)
}`;

    const response = await callGeminiWithRetry({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    let result;
    try {
      result = JSON.parse(response.text || '{}');
    } catch (e) {
      console.error('Failed to parse evaluation JSON:', e);
      result = {
        isCorrect: false,
        diagnosis: response.text || 'Answer evaluated.',
        concept: question.concept,
      };
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/quiz/evaluate:', error);
    res.status(500).json({
      error: error?.message || 'Failed to evaluate answer.',
    });
  }
});

// 4. PERSONALIZED RECOMMENDATIONS ENDPOINT
app.post('/api/recommendations', async (req: Request, res: Response) => {
  try {
    const { topic, score, weakConcepts = [], strongConcepts = [], recentTopics = [] } = req.body;

    const ai = getAI();

    const prompt = `Student study summary:
Recent Session Topic: "${topic}"
Score: ${score}%
Concepts Needing Improvement: ${JSON.stringify(weakConcepts)}
Concepts Mastered: ${JSON.stringify(strongConcepts)}
Other Recently Studied Topics: ${JSON.stringify(recentTopics)}

As LearnLoop's AI Learning Advisor, provide:
1. A warm, encouraging 2-3 sentence personalized evaluation of what they did well and where the exact learning gap is.
2. 2-3 specific recommended next steps (e.g., "Review sorted arrays before attempting binary search trees", "Practice base cases with factorials").

Return strict JSON:
{
  "summary": "Warm personalized feedback paragraph...",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}`;

    const response = await callGeminiWithRetry({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let data;
    try {
      data = JSON.parse(response.text || '{}');
    } catch {
      data = {
        summary: `You scored ${score}% on ${topic}. Reviewing the concepts that challenged you will solidify your mastery!`,
        recommendations: weakConcepts.map(c => `Review foundational principles of ${c}`),
      };
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error in /api/recommendations:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate recommendations.',
    });
  }
});

// 5. Setup Vite Middleware (Dev) or Static Serving (Prod)
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LearnLoop server running at http://0.0.0.0:${PORT}`);
  });
}

setupServer();

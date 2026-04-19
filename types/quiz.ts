export type ExplanationResponse = {
  overview: string;
  keyPoints: string[];
  commonMistakes: string[];
  revisionSummary: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export type QuizResponse = {
  questions: QuizQuestion[];
};

export type ReviewItem = {
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  feedback: string;
};

export type ReviewResponse = {
  score: number;
  total: number;
  summary: string;
  weakAreas: string[];
  reviseNext: string[];
  items: ReviewItem[];
};
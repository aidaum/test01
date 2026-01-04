
export interface Problem {
  id: string;
  equation: string;
  steps: string[];
  finalAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
}

export interface Feedback {
  isCorrect: boolean;
  message: string;
  visualPrompt: string;
  conceptTip: string;
}

export interface ChatMessage {
  role: 'teacher' | 'student';
  content: string;
  imageUrl?: string;
  problem?: Problem;
  feedback?: Feedback;
}

export enum AppState {
  HOME = 'HOME',
  LEARNING = 'LEARNING',
  SOLVING = 'SOLVING',
  FEEDBACK = 'FEEDBACK'
}

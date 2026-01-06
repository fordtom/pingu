export interface QuestionInfo {
  id: string;
  text: string;
  cwd: string;
  createdAt: number;
}

export interface PendingQuestion extends QuestionInfo {
  resolve: (answer: string) => void;
  reject: (error: Error) => void;
  timer: Timer;
}

export class TimeoutError extends Error {
  constructor() {
    super("Timed out");
    this.name = "TimeoutError";
  }
}

export class ShutdownError extends Error {
  constructor() {
    super("Server unavailable");
    this.name = "ShutdownError";
  }
}

// WebSocket messages: Server → Client
export type ServerMessage =
  | { type: "sync"; questions: QuestionInfo[] }
  | { type: "question_added"; question: QuestionInfo }
  | { type: "question_removed"; id: string }
  | { type: "answer_accepted"; id: string }
  | { type: "answer_rejected"; id: string; reason: "not_found" | "already_answered" };

// WebSocket messages: Client → Server
export type ClientMessage = { type: "answer"; id: string; text: string };

export type AnswerResult = "answered" | "not_found" | "already_answered";

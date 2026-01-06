import React, { useState, useEffect, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

interface QuestionInfo {
  id: string;
  text: string;
  cwd: string;
  createdAt: number;
}

type ServerMessage =
  | { type: "sync"; questions: QuestionInfo[] }
  | { type: "question_added"; question: QuestionInfo }
  | { type: "question_removed"; id: string }
  | { type: "answer_accepted"; id: string }
  | { type: "answer_rejected"; id: string; reason: string };

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function QuestionCard({
  question,
  onAnswer,
}: {
  question: QuestionInfo;
  onAnswer: (id: string, text: string) => void;
}) {
  const [answer, setAnswer] = useState("");
  const [relativeTime, setRelativeTime] = useState(() => formatRelativeTime(question.createdAt));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeTime(formatRelativeTime(question.createdAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [question.createdAt]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onAnswer(question.id, answer.trim());
      setAnswer("");
    }
  };

  return (
    <div className="question-card">
      <div className="question-meta">
        <span className="question-cwd">{question.cwd}</span>
        <span className="question-time">{relativeTime}</span>
      </div>
      <div className="question-text">{question.text}</div>
      <form onSubmit={handleSubmit} className="answer-form">
        <input
          ref={inputRef}
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer..."
          className="answer-input"
        />
        <button type="submit" className="answer-button">
          Reply
        </button>
      </form>
    </div>
  );
}

function App() {
  const [questions, setQuestions] = useState<QuestionInfo[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      const msg: ServerMessage = JSON.parse(event.data);
      switch (msg.type) {
        case "sync":
          setQuestions(msg.questions);
          break;
        case "question_added":
          setQuestions((prev) => [...prev, msg.question]);
          break;
        case "question_removed":
          setQuestions((prev) => prev.filter((q) => q.id !== msg.id));
          break;
        case "answer_rejected":
          setError(`Answer rejected: ${msg.reason}`);
          setTimeout(() => setError(null), 3000);
          break;
      }
    };

    ws.onclose = () => {
      setConnected(false);
      setTimeout(connect, 2000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, [connect]);

  const handleAnswer = (id: string, text: string) => {
    wsRef.current?.send(JSON.stringify({ type: "answer", id, text }));
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Pingu</h1>
        <span className={`status ${connected ? "connected" : "disconnected"}`}>
          {connected ? "Connected" : "Disconnected"}
        </span>
      </header>

      {error && <div className="error">{error}</div>}

      {questions.length === 0 ? (
        <div className="empty">No pending questions</div>
      ) : (
        <div className="questions">
          {questions.map((q) => (
            <QuestionCard key={q.id} question={q} onAnswer={handleAnswer} />
          ))}
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);

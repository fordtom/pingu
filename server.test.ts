import { test, expect, beforeAll, afterAll, describe } from "bun:test";

// Use short timeout for tests
process.env.PINGU_TIMEOUT_MS = "500";
process.env.PINGU_PORT = "8001";
process.env.PINGU_TLS = "0";

import { createServer, shutdown } from "./src/server";

let server: ReturnType<typeof createServer>;
const baseUrl = "http://localhost:8001";

beforeAll(() => {
  server = createServer();
});

afterAll(() => {
  shutdown();
  server.stop();
});

describe("POST /ask", () => {
  test("happy path: question answered via WebSocket returns 200", async () => {
    const ws = new WebSocket(`ws://localhost:8001/ws`);
    await new Promise<void>((resolve) => {
      ws.onopen = () => resolve();
    });

    // Wait for sync message
    await new Promise<void>((resolve) => {
      ws.onmessage = () => resolve();
    });

    // Start the ask request
    const askPromise = fetch(`${baseUrl}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Test question?", cwd: "/test/path" }),
    });

    // Wait for question_added message and answer it
    await new Promise<void>((resolve) => {
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "question_added") {
          ws.send(JSON.stringify({ type: "answer", id: msg.question.id, text: "Test answer" }));
          resolve();
        }
      };
    });

    const response = await askPromise;
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("Test answer");

    ws.close();
  });

  test("timeout returns 504", async () => {
    const response = await fetch(`${baseUrl}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Will timeout", cwd: "/timeout" }),
    });

    expect(response.status).toBe(504);
    expect(await response.text()).toBe("Timed out");
  });

  test("answering non-existent question returns not_found", async () => {
    const ws = new WebSocket(`ws://localhost:8001/ws`);
    await new Promise<void>((resolve) => {
      ws.onopen = () => resolve();
    });

    // Skip sync message
    await new Promise<void>((resolve) => {
      ws.onmessage = () => resolve();
    });

    // Answer a fake question
    ws.send(JSON.stringify({ type: "answer", id: "fake-id", text: "No such question" }));

    const response = await new Promise<{ type: string; reason?: string }>((resolve) => {
      ws.onmessage = (event) => {
        resolve(JSON.parse(event.data));
      };
    });

    expect(response.type).toBe("answer_rejected");
    expect(response.reason).toBe("not_found");

    ws.close();
  });

  test("bad request: missing text returns 400", async () => {
    const response = await fetch(`${baseUrl}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cwd: "/test" }),
    });

    expect(response.status).toBe(400);
  });

  test("bad request: missing cwd returns 400", async () => {
    const response = await fetch(`${baseUrl}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Question?" }),
    });

    expect(response.status).toBe(400);
  });

  test("bad request: invalid JSON returns 400", async () => {
    const response = await fetch(`${baseUrl}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });

    expect(response.status).toBe(400);
  });
});

describe("WebSocket", () => {
  test("receives sync on connect", async () => {
    const ws = new WebSocket(`ws://localhost:8001/ws`);
    await new Promise<void>((resolve) => {
      ws.onopen = () => resolve();
    });

    const msg = await new Promise<{ type: string; questions: unknown[] }>((resolve) => {
      ws.onmessage = (event) => {
        resolve(JSON.parse(event.data));
      };
    });

    expect(msg.type).toBe("sync");
    expect(Array.isArray(msg.questions)).toBe(true);

    ws.close();
  });

  test("multiple concurrent questions are isolated", async () => {
    const ws = new WebSocket(`ws://localhost:8001/ws`);
    await new Promise<void>((resolve) => {
      ws.onopen = () => resolve();
    });

    // Skip sync
    await new Promise<void>((resolve) => {
      ws.onmessage = () => resolve();
    });

    const questions: { id: string; text: string }[] = [];

    // Listen for question_added
    const collectPromise = new Promise<void>((resolve) => {
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "question_added") {
          questions.push({ id: msg.question.id, text: msg.question.text });
          if (questions.length === 2) resolve();
        }
      };
    });

    // Start two concurrent questions
    const ask1 = fetch(`${baseUrl}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Question 1", cwd: "/q1" }),
    });

    const ask2 = fetch(`${baseUrl}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Question 2", cwd: "/q2" }),
    });

    await collectPromise;

    // Answer in reverse order
    const q2 = questions.find((q) => q.text === "Question 2")!;
    const q1 = questions.find((q) => q.text === "Question 1")!;

    ws.send(JSON.stringify({ type: "answer", id: q2.id, text: "Answer 2" }));
    ws.send(JSON.stringify({ type: "answer", id: q1.id, text: "Answer 1" }));

    const [res1, res2] = await Promise.all([ask1, ask2]);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(await res1.text()).toBe("Answer 1");
    expect(await res2.text()).toBe("Answer 2");

    ws.close();
  });
});

describe("health", () => {
  test("GET /health returns ok", async () => {
    const response = await fetch(`${baseUrl}/health`);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("ok");
  });
});

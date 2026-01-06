# Pingu

Minimal blocking question/answer server for human-in-the-loop automation.

Agents send a question, wait, and receive exactly one answer — or a timeout.

## Quick Start

```bash
bun install
bun run start
```

Server runs on http://localhost:8000. Open in browser for the human UI.

## CLI

```bash
./cli/pingu "Should I proceed with the deployment?"
```

Blocks until answered or timeout (1 hour default). Returns answer text on stdout, non-zero exit on timeout/error.

Requires `curl` and `jq`. Set `PINGU_URL` to point to your server if not localhost.

## Notifications

When a question arrives, Pingu pushes to ntfy (default: `http://localhost:9000/pingu`).

Message format: `[dirname] question text`

Subscribe on your phone via ntfy app to get notified when questions need answers.

## Config

| Env Var | Default | Description |
|---------|---------|-------------|
| `PINGU_PORT` | 8000 | Server port |
| `PINGU_TIMEOUT_MS` | 3600000 | Question timeout (1 hour) |
| `PINGU_NTFY_URL` | http://localhost:9000/pingu | ntfy endpoint |
| `PINGU_URL` | http://localhost:8000 | CLI server URL |

## API

**POST /ask**
```json
{"text": "Deploy now?", "cwd": "/home/user/project"}
```

Blocks until answered. Returns plain text answer.

| Status | Meaning |
|--------|---------|
| 200 | Answered (body = answer text) |
| 504 | Timed out |
| 410 | Question expired/not found |
| 409 | Already answered |
| 503 | Server unavailable |

## Agent Skill

See `skills/afk.md` for a Claude Code / Codex skill that teaches agents to use Pingu when you're AFK.

## Design

- Transient: no history, no persistence, in-memory only
- Single question → single answer
- First answer wins, late answers rejected
- WebSocket for real-time UI updates (overkill but works)

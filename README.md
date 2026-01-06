# Pingu

Minimal blocking question/answer server for human-in-the-loop automation.

Agents send a question, wait, and receive exactly one answer — or a timeout.

## Quick Start

```bash
bun install
bun run start
```

Open http://localhost:3000 for the human UI.

## CLI

```bash
./cli/pingu "Should I proceed with the deployment?"
```

Blocks until answered or timeout (1 hour default). Returns answer text on stdout, non-zero exit on timeout/error.

## Config

| Env Var | Default | Description |
|---------|---------|-------------|
| `PINGU_PORT` | 3000 | Server port |
| `PINGU_TIMEOUT_MS` | 3600000 | Question timeout (1 hour) |
| `PINGU_URL` | http://localhost:3000 | CLI server URL |

## API

**POST /ask**
```json
{"text": "Deploy now?", "cwd": "/project"}
```

Returns plain text answer. Status codes: 200 (answered), 504 (timeout), 410 (expired), 409 (conflict), 503 (unavailable).

## Design

- Transient: no history, no persistence, in-memory only
- Single question → single answer
- First answer wins, late answers rejected

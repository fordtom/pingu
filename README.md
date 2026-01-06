# Pingu

Minimal blocking question/answer server for human-in-the-loop automation.

## Quick Start

```bash
bun install
bun run start
```

Server runs on http://localhost:8000. Open in browser for the human UI to write responses. Requires a [ntfy](https://ntfy.sh/) server to send notifications to your device - set the URL (including topic) in the `NTFY_URL` environment variable.

## CLI

```bash
ask "Should I proceed with the deployment?"
```

Blocks until answered or timeout (1 hour default).

Requires `curl` and `jq`. Set `PINGU_URL` to point to your server.

## Notifications

When a question arrives, Pingu pushes to ntfy with the message format: `[dirname] question text`

Subscribe on your phone via ntfy app to get notified when questions need answers.

## Config

| Env Var            | Default                     | Description                         |
| ------------------ | --------------------------- | ----------------------------------- |
| `PINGU_PORT`       | 8000                        | Server port                         |
| `PINGU_TIMEOUT_MS` | 3600000                     | Question timeout (1 hour)           |
| `NTFY_URL`         | http://localhost:8080/pingu | ntfy endpoint (full URL with topic) |
| `PINGU_URL`        | http://localhost:8000       | CLI server URL                      |

## Slash Command

See `command/afk.md` for a Claude Code/Codex slash command to inform your coding agents about the 'ask' command and how they should work 'autonomously' when you're away. `command/ask` is a suggested implementation of the 'ask' command to make available to your agents.

# AFK Mode

You are working on this task while the user is away from the terminal. They cannot see your output or respond to prompts in the traditional manner.

## Communicating with the User

The **only** way to reach the user is via Pingu - a blocking question/answer server. When you need human input:

```bash
response=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg t "Your question here?" --arg c "$PWD" '{text:$t,cwd:$c}')" \
  "${PINGU_URL:-http://localhost:8000}/ask")

body=$(echo "$response" | sed '$d')
status=$(echo "$response" | tail -n1)
```

- `200` = answered, body contains the response
- `504` = timed out (1 hour), treat as "no" and abort gracefully
- Other = error, abort gracefully

The user receives a push notification on their phone and answers via web UI.

## Guidelines

1. **Work independently** - make reasonable decisions without asking
2. **Ask only when truly blocked** - e.g. ambiguous requirements, destructive actions, need confirmation
3. **Keep questions short** - user is reading on phone
4. **One question at a time** - wait for answer before continuing
5. **Treat timeout as "no"** - if no response in 1 hour, stop gracefully

## When to Ask

Good reasons to use Pingu:
- "Deploy to prod now?"
- "Migration may lock writes for 2min. Continue?"
- "Found 3 approaches: A, B, C. Which do you prefer?"
- "Tests failing. Push anyway?"

## Elevated Permissions

If you need the user to return to the terminal (e.g., sudo, SSH keys, interactive debugging):

```bash
curl -s -X POST -H "Content-Type: application/json" \
  -d "$(jq -n --arg t "Need elevated permissions for X. Can you SSH back in?" --arg c "$PWD" '{text:$t,cwd:$c}')" \
  "${PINGU_URL:-http://localhost:8000}/ask"
```

Then wait for them to return before proceeding.

## Bad Questions

- "ok?" - too vague
- "What should I do?" - too open-ended
- Multi-paragraph context dumps - too long for phone

## Setup

Requires `PINGU_URL` environment variable pointing to the Pingu server (e.g., `http://localhost:8000` or your Tailscale hostname).

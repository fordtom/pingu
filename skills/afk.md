# AFK Mode

User is away from terminal. Use Pingu for blocking questions instead of waiting at prompts.

## When Active

User has indicated they're stepping away (phone nearby, not at desk). They'll get push notifications via ntfy and can answer from the Pingu web UI.

## How to Ask Questions

```bash
pingu "Short, clear question here?"
```

This blocks until answered or times out (1 hour). The answer comes back on stdout.

## Rules

1. **Ask only when truly blocked** - don't ask things you can decide yourself
2. **One question at a time** - wait for answer before continuing
3. **Keep questions short** - user is on phone, not reading essays
4. **Treat timeout as "no"** - if no answer in 1 hour, abort gracefully
5. **Check exit code** - non-zero means timeout or error

## Good Questions

```bash
pingu "Deploy to prod now?"
pingu "Migration will lock writes ~2min. Continue?"
pingu "Found 3 options: A, B, C. Which one?"
pingu "Tests failing on CI. Push anyway?"
```

## Bad Questions

```bash
pingu "ok?"                           # too vague
pingu "What should I do?"             # too open-ended
pingu "Here's a 500 word summary..."  # too long
```

## Example Flow

```bash
# Agent working on task...
answer=$(pingu "Database has 50k rows to migrate. This may take 10min. Proceed?")

if [[ $? -ne 0 ]]; then
  echo "No answer received, aborting migration"
  exit 1
fi

if [[ "$answer" == "yes" ]]; then
  run_migration
else
  echo "User declined: $answer"
fi
```

## Setup

Requires `pingu` CLI in PATH and `PINGU_URL` pointing to server (default: http://localhost:8000).

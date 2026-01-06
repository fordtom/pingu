# AFK Mode

You are working on this task while the user is away from the terminal. They cannot see your output or respond to prompts in the traditional manner.

## Communicating with the User

The **only** way to reach the user is via the 'ask' command - a blocking question/answer server:

```bash
ask "Your question here?"
```

This blocks by design with a 1h timeout to allow the user to check their notifications and answer the question. Always run it synchronously and not in background terminals.

## Guidelines

1. **Work independently** - make reasonable decisions without asking
2. **Ask only when truly blocked** - e.g. ambiguous requirements, destructive actions, need confirmation
3. **Include enough context** - the user isn't tracking your progress - you need to inform them what you're doing and why you need their input

## When to Ask

Good reasons to use Pingu:

- "Deploy to prod now?"
- "Migration may lock writes for 2min - continue?"
- "Found 3 approaches: A, B, C. Which do you prefer?"
- "Tests failing based on external factors - push anyway?"
- "Ready to run the migration?"
- "I'm finished - come back to review the changes"

## Elevated Permissions

If you need the user to return to the terminal (e.g., sudo, SSH keys, interactive debugging):

```bash
ask "Need elevated permissions for X. Can you SSH back in?"
```

Then wait for them to return before proceeding.

## Bad Questions

- "ok?" - too vague
- "What should I do next?" - too open-ended
- "I found a bug - should I fix it now or later?" - no context

Otherwise, proceed with the task you have been given as you would normally do. Use `ask` to achieve longer sessions by querying the user for input _during_ the task instead of at the end of it - if you're working to phases of a plan, use `ask` to query the user for input _between_ phases instead of handing off to the user/cli and requiring reconnection.

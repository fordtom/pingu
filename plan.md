# Using Pingu for Human-in-the-Loop Questions

Pingu is a minimal blocking question/answer server.  
Agents send a question, wait, and receive exactly one answer — or a timeout.

Pingu is **transient by design**:

- No history
- No retries
- No queues
- No multi-answer logic
- Everything is in-memory
- Access is limited to the local Tailscale network

It is strictly a **single question → single answer** abstraction.

---

## When to Use Pingu

Use Pingu only when the task **requires explicit human approval or clarification** and cannot proceed safely without it.

Examples:

- “Should I deploy now?”
- “This migration may be unsafe — continue?”
- “Confirm sudo action?”
- “Pick one option when ambiguity remains.”

Do **NOT** use Pingu for:

- Logging or notifications
- Non-blocking confirmations
- Status updates
- Anything that can be decided automatically

---

## API

### Ask a Question (blocking)

**POST `/ask`**

```json
{
  "text": "Should I run the migration?",
  "cwd": "/home/project/app"
}

Pingu will notify the human, wait, and then return the answer or timeout.

The response is plain text (not JSON).

⸻

Response Semantics

Exactly one outcome occurs:

Situation	HTTP	Meaning	Agent Behaviour
Answered	200 OK	Body contains answer text	Continue
Timed out	504 Gateway Timeout	Human did not answer in time	Abort politely
Expired / not found	410 Gone	Question expired	Abort
Already answered	409 Conflict	Duplicate answer attempt	Abort
Server unavailable / shutdown	503 Service Unavailable	No human path	Abort or retry later (once)

Agents must check status codes — not just the body.

Timeouts are normal.
Agents must not spam retries.

⸻

Behaviour Guarantees
	•	First answer wins
	•	Late answers are rejected
	•	Questions disappear after answer or timeout
	•	No persistence across restarts
	•	No internal retries
	•	Data remains fully transient

⸻

CLI Usage

Agents generally call via the CLI wrapper:

pingu "Deploy needs sudo password. Proceed?"

This blocks until answered or timeout.

The CLI returns a non-zero exit code on timeout or error. Handle accordingly.

⸻

Human UI Behaviour

Humans see:
	•	The question text
	•	The working directory (cwd)
	•	The relative timestamp
	•	A reply box

Timed-out questions simply disappear.

Late answers produce a small “expired” error, and are ignored.

⸻

Design Intent

Pingu exists to provide a blocking human confirmation step:

Pause → ask → either continue or stop.

Do not treat it as workflow, chat, history, or messaging infrastructure.

⸻

Agent Best Practices
	•	Ask short, clear questions
	•	Include just enough context
	•	Avoid asking unless necessary
	•	Treat timeouts as “no”
	•	Explain outcome to the user afterwards

Good:

“Database migration may lock writes for ~2 minutes. Continue?”

Bad:

“ok?”

⸻

Summary

Pingu is a minimal safety valve for automation.

Use it when:
	•	Human approval is genuinely required
	•	A decision is binary or short
	•	Execution should block until answered or aborted

Everything else should be handled automatically.



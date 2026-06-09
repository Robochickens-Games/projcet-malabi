# Process: Project status ("where are we")

How the AI tells anyone — especially someone who just cloned the repo — where the
project stands, and keeps the status snapshot fresh. Backs the `/catchup` command.

## When to trigger
- A member (or newcomer) runs `/catchup`.
- Someone asks "where are we", "what's the status", "what's left", "catch me up".

## Steps

1. **Gather the current state** from:
   - `brain/memory/shared/project-status.md` — the living snapshot.
   - `brain/decisions/` — accepted decisions (what's settled and why).
   - `brain/memory/index.md` — what the team knows.
   - `git log --since` over `brain/**` — what changed recently.

2. **Report a tight, scannable status** covering:
   - **TL;DR** — one or two lines.
   - **Done** — what's built and working.
   - **In progress / open** — active threads and unanswered questions.
   - **Parked** — deliberately on hold, and what would unblock it.
   - **Next steps** — the obvious moves.
   Lead with what a newcomer needs to act; don't dump everything.

3. **Refresh the snapshot.** If anything has changed since `project-status.md` was
   last updated, rewrite it with today's date and commit
   (`status: refresh project status`). The snapshot should always reflect reality.

## Quality bar
- Honest about what's *not* done and what's blocked — status is for decisions, not
  for looking good.
- Keep `project-status.md` the single source of truth; don't scatter status across files.

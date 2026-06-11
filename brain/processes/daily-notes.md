# Process: Daily notes — letters to the editor

How a team member attaches **content or comments to any piece of info** in the
Malabi Daily, and how the brain **ingests and addresses** every note. Free, no
backend: notes are GitHub issues on the brain repo.

## Writing a note (any member, no AI session needed)

1. Open the Malabi Daily, open any article (memory / decision), and click
   **✍️ Add a note** — or **✍️ Write to the editor** on the front page for a
   note not tied to one piece.
2. That opens a prefilled GitHub issue. The conventions (the buttons set these
   automatically):
   - **Title:** `[note] <slug>: <subject>` — `<slug>` is the memory/decision the
     note is about (the file's `name:`), or `general`.
   - **Label:** `daily-note` (nice for filtering; the title prefix is what's
     canonical).
   - **Body:** the content — extra context, a correction, new material, a
     question. Markdown welcome. Teammates can discuss in the issue's comments.
3. Open notes appear immediately in the Daily: on the article they're about and
   in the front page's **Letters to the Editor** section.

## Ingesting notes (the AI, at every sync)

At the start of any work session (sync protocol step), fetch open notes — no
auth needed, the repo is public:

```
curl -s "https://api.github.com/repos/Robochickens-Games/projcet-malabi/issues?state=open&per_page=100"
```

Filter to issues (not PRs) whose title starts with `[note]`. Then:

1. **Brief the member** — open letters are part of the *Waiting* bucket: who
   wrote each, about what, the gist.
2. **Address each note** (with the member, or directly when it's unambiguous):
   - Fold the content into the memory/decision it's about — update the file,
     following the normal memory format and scoping rules.
   - A note that's really a new idea → route through the proposals gate
     (`brain/proposals/`). A note disputing a decision → surface it; it may need
     an ADR update.
   - If a note needs discussion before it can be folded in, say so in the
     briefing and leave it open — open letters keep resurfacing every sync and
     every edition until resolved, by design.
3. **Close by committing.** The commit that folds a note in must include
   `Closes #<issue-number>` in its message — GitHub auto-closes the letter when
   the commit lands on `main`, the Daily then shows it as **✓ addressed**, and
   the closed issue links straight to the addressing commit. Never close a note
   without a commit that actually addresses it.

## Why this shape

- **Zero infra, zero spend** — GitHub issues + the existing Pages wiki.
  ([[budget-constraint]])
- **Nothing gets lost** — a note is either open (and resurfaces in every brief
  and every edition) or closed by the exact commit that absorbed it.
- **Tool-agnostic** — any member can write or read notes from a browser; any AI
  session can ingest them with one HTTP call.

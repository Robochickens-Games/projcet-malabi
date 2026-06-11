# Process: Daily notes — letters to the editor

How a team member attaches **content or comments to any piece of info** in the
Malabi Daily, and how the brain **ingests and addresses** every note. Free, no
backend: notes are written **in the page** via the utterances widget and stored
as GitHub issues + comments on the brain repo.

## Writing a note (any member, in the page, no AI session needed)

1. Open the Malabi Daily, open any article (memory / decision) — the drawer has a
   **Letters on this piece** comment box at the bottom. The front page has a
   **Write to the editor** box for a general note.
2. Sign in with GitHub (one-time OAuth via the utterances app — free, no token)
   and type the note right there: extra context, a correction, new material, a
   question. Markdown welcome. Posting happens in place; no leaving the page.
3. Under the hood, the first note on a piece creates a GitHub issue titled
   `[note] <slug>` (slug = the memory/decision's `name:`, or `general`) with the
   `daily-note` label; **each note is a comment** on that issue. Teammates reply
   in the same thread.
4. The team is pinged on **Telegram instantly** (the `notify-note` Action), and
   the note shows in the Daily right away — in the article's thread and in the
   front-page **Letters to the Editor** mailbag (which auto-refreshes ~90s).

## Ingesting notes (the AI, at every sync)

At the start of any work session (sync protocol step), fetch open note threads
and their comments — no auth needed, the repo is public:

```
# threads (one issue per piece)
curl -s "https://api.github.com/repos/Robochickens-Games/projcet-malabi/issues?labels=daily-note&state=open&per_page=100"
# the notes themselves (comments) on a given thread #N
curl -s "https://api.github.com/repos/Robochickens-Games/projcet-malabi/issues/N/comments"
```

Each issue is a thread for one piece (`[note] <slug>`); **each comment is a
note**. The issue body may also hold the first note. Then:

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
3. **Close by committing.** Once every note in a thread is folded in, the commit
   that does it includes `Closes #<issue-number>` in its message — GitHub
   auto-closes the thread when the commit lands on `main`, the Daily then shows it
   as **✓ addressed**, and the closed issue links straight to the addressing
   commit. Never close a thread while it still has unaddressed notes.

## Why this shape

- **In the page** — notes are written and read inside the Daily via utterances;
  no bouncing to GitHub's issue form.
- **Near-real-time** — the team is pinged on Telegram the instant a note posts
  (`notify-note` Action), and the mailbag auto-refreshes; the utterances widget
  shows new notes live. Folding into memory stays a human-reviewed sync step.
- **Zero infra, zero spend** — utterances (free GitHub App) + GitHub issues +
  the existing Pages wiki. ([[budget-constraint]])
- **Nothing gets lost** — a thread is either open (and resurfaces in every brief
  and every edition) or closed by the exact commit that absorbed its notes.
- **Tool-agnostic** — any member writes/reads notes from a browser; any AI
  session ingests them with a couple of public HTTP calls.

## One-time setup

- Install the **utterances GitHub App** on the brain repo
  (https://github.com/apps/utterances → Install → this repo only). Until then the
  in-page box shows "utterances is not installed on …".
- The `daily-note` label is auto-ensured by the `build-wiki` Action.
- Telegram pings reuse the existing `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID`
  secrets.

---
name: daily-notes
description: Letters to the Editor — anyone can attach notes/content to any piece of info via the Daily; the brain ingests open notes at every sync and closes them by commit
owner: team
scope: shared
created: 2026-06-11
tags: [gazette, notes, comments, feedback, sync, infra]
---

# Daily notes — letters to the editor

Team members add **notes/content to any piece of info right in the Malabi Daily**.
Every article (memory, decision) has a **Letters on this piece** comment box; the
front page has a general **Write to the editor** box. Posting is in-page via the
**utterances** widget (free GitHub App, GitHub login, no token/backend). Under the
hood each piece is a GitHub issue titled `[note] <slug>` (label `daily-note`) and
**each note is a comment** on it.

The loop that makes it part of the brain (full process: `brain/processes/daily-notes.md`):

- **Post in the page** — no bouncing to GitHub's issue form.
- **Near-real-time** — the team is pinged on **Telegram the instant** a note
  posts (`notify-note` Action); the mailbag auto-refreshes and the widget shows
  new notes live.
- **Every sync ingests them**: the AI fetches open threads + comments, briefs the
  member (Waiting bucket), folds the content into the right memory/proposal/
  decision, and the addressing commit says `Closes #N` — GitHub auto-closes the
  thread, which the Daily then shows as ✓ addressed.
- A note is therefore never lost: the thread stays open and keeps resurfacing
  until a real commit absorbs it.

**Why:** team members consume the brain through the Daily and Telegram, but had
no write path back without opening an AI session. This closes that gap at zero
infra cost ([[budget-constraint]]). **One-time setup:** install the utterances
GitHub App on the repo.

Related: [[project-gazette]], [[architecture-of-the-brain]], [[north-star]].

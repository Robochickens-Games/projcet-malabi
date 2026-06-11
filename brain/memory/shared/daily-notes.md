---
name: daily-notes
description: Letters to the Editor — anyone can attach notes/content to any piece of info via the Daily; the brain ingests open notes at every sync and closes them by commit
owner: team
scope: shared
created: 2026-06-11
tags: [gazette, notes, comments, feedback, sync, infra]
---

# Daily notes — letters to the editor

Every article in the Malabi Daily (memories, decisions) carries an **✍️ Add a
note** button; the front page has **Letters to the Editor** plus a general
**Write to the editor** button. A note is a GitHub issue titled
`[note] <slug>: <subject>` with the `daily-note` label — extra context,
corrections, new content, or questions, written from a browser with no AI
session needed.

The loop that makes it part of the brain (full process: `brain/processes/daily-notes.md`):

- **Open notes render in the Daily** — on their article and on the front page —
  so the whole team sees them.
- **Every sync ingests them**: the AI fetches open notes, briefs the member
  (Waiting bucket), folds the content into the right memory/proposal/decision,
  and the addressing commit says `Closes #N` — GitHub auto-closes the letter,
  which the Daily then shows as ✓ addressed.
- A note is therefore never lost: it stays open and keeps resurfacing until a
  real commit absorbs it.

**Why:** team members consume the brain through the Daily and Telegram, but had
no write path back without opening an AI session. This closes that gap at zero
infra cost ([[budget-constraint]]).

Related: [[project-gazette]], [[architecture-of-the-brain]], [[north-star]].

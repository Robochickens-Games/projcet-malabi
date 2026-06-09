---
name: team
description: Who's on the team, their roles, and how we work together
owner: team
scope: shared
created: 2026-06-09
tags: [team, people, norms]
---

# The team

Three members. Names are used as lowercase slugs everywhere (`dor`, `gidi`, `ohad`).

| Member | Slug | Role | Notes |
|--------|------|------|-------|
| Dor    | dor  | Design | Design-oriented — owns look, feel, and UX. See [[dor-role]]. |
| Gidi   | gidi | Product Management | Owns product direction, priorities, and scope. See [[gidi-role]]. |
| Ohad   | ohad | Tech | The technical lead — architecture and engineering. See [[ohad-role]]. |

> Keep adding strengths and focus areas as we learn them. Each member also has a
> working space under `brain/memory/members/<slug>/` for preferences and personal
> context.

## Working norms

- **The brain is shared and always-on.** Anything worth the team knowing goes in
  `brain/`, captured as you work — not held in one person's head.
- **Sync before you start.** Run `/sync` at the top of a session so you're working
  from the latest team context. See [[architecture-of-the-brain]].
- **Decisions are written down.** Directional calls become ADRs in `brain/decisions/`.
- **Commits are the notification channel.** A commit touching `brain/**` is how
  the others find out something changed.

---
description: Pull latest team context and brief me on what changed since I last worked
---

Run the team sync protocol defined in `brain/processes/sync-protocol.md`:

1. `git pull --rebase` (surface, don't clobber, any local uncommitted brain changes).
2. Identify who I am from git config and read my member memory under
   `brain/memory/members/<slug>/`.
3. Read `brain/memory/index.md`.
4. Brief me in three short buckets (the standard post-clone/sync catch-up), pulled
   from `brain/memory/shared/project-status.md` and recent `git log` over `brain/**`:
   - **What's new** — changes since I last worked (new decisions, memory, updates).
   - **Built / created** — what's done and ready now.
   - **Waiting** — what's open, parked, or needs me next.
5. Flag any conflicts or open loops (pending PRs, proposals awaiting review).

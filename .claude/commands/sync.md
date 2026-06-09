---
description: Pull latest team context and brief me on what changed since I last worked
---

Run the team sync protocol defined in `brain/processes/sync-protocol.md`:

1. `git pull --rebase` (surface, don't clobber, any local uncommitted brain changes).
2. Identify who I am from git config and read my member memory under
   `brain/memory/members/<slug>/`.
3. Read `brain/memory/index.md`.
4. Summarize what changed in `brain/**` since my last commit — lead with new
   decisions (ADRs), then shared memories, then updates to projects I'm in.
5. Give me a short, prioritized catch-up digest and flag any conflicts or open loops.

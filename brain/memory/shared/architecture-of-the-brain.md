---
name: architecture-of-the-brain
description: How the shared brain is structured — three layers and the sync loop
owner: team
scope: shared
created: 2026-06-09
tags: [architecture, infra, meta]
---

# Architecture of the brain

The system is **three layers** plus **one loop**. Full rationale in the first
ADR: [decisions/0001-shared-brain-architecture.md](../../decisions/0001-shared-brain-architecture.md).

## Three layers

1. **Brain (`brain/`)** — single source of truth, tool-agnostic markdown. Holds
   memory, skills, agents, processes, decisions. Designed to be extracted into
   its own repo later, so its boundary stays clean.
2. **Adapters (`.claude/`, `.cursor/`)** — thin config pointing each editor into
   the brain. A new tool = a new adapter; the brain doesn't change.
3. **Sync fabric (git + GitHub)** — pull on session start, structure on brain
   dump, notify the team on push (CODEOWNERS + Actions).

## The loop

```
brain dump (in session) → AI structures into memory → commit / PR
   → GitHub notifies the team → they pull → AI briefs them on what changed
```

## Memory scopes
- `memory/shared/` — team-wide truth
- `memory/members/<slug>/` — personal working context & preferences
- `memory/projects/<slug>/` — per-initiative context

**How to apply:** Keep `brain/` free of any tool-specific assumptions. When in
doubt about where a fact goes, prefer the narrowest correct scope.

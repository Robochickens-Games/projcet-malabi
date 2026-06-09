---
name: 0001-shared-brain-architecture
description: Adopt a three-layer (brain / adapters / git-sync) architecture for the shared AI workspace
owner: team
status: accepted
created: 2026-06-09
supersedes: -
tags: [decision, architecture, infra, meta]
---

# 0001. Shared brain architecture

## Status
Accepted — 2026-06-09

## Context
Dor, Gidi, and Ohad want a shared AI workspace where any member can sit down in
their editor and immediately have the team's full context — memory, decisions,
project state — without manual handoffs. It must work across Claude Code and
Cursor today, accommodate more tools later, and stay sustainable as projects
multiply. Brain dumps happen conversationally inside editor sessions.

## Decision
Adopt **three layers + one sync loop**:

1. **Brain (`brain/`)** — single source of truth in tool-agnostic markdown:
   memory, skills, agents, processes, decisions. Boundary kept clean so it can be
   extracted into its own repo later.
2. **Adapters (`.claude/`, `.cursor/`)** — thin config that points each tool into
   the brain. New tool = new adapter.
3. **Sync fabric (git + GitHub)** — pull on session start, structure-on-braindump,
   notify-on-push (CODEOWNERS + Actions). The repo is the source of truth; no
   separate hosted service for now.

Memory is scoped `shared` / `member` / `project`. Brain dumps are ingested
in-session by the AI per `processes/braindump-ingestion.md`.

Repo strategy: **monorepo now, extract the brain later** — `product/` holds
eventual product code alongside the brain until a real product justifies a split.

## Consequences
- **Easier:** zero hosting; full version history of all team knowledge; offline
  work; adding tools is cheap; the brain is portable.
- **Harder:** real-time notifications are limited to GitHub's cadence (acceptable
  for a 3-person async team); members must `git pull` to sync (mitigated by the
  SessionStart hook and `/sync`).
- **Commitment:** keep `brain/` free of tool-specific and product-specific code so
  the future extraction stays cheap.

## Alternatives considered
- **Git + hosted bot/DB** for real-time sync — more power, but ongoing
  maintenance not justified for three people. Revisit if async latency hurts.
- **Brain + product fully separate from day one** — cleaner, but slower to start;
  chose monorepo-now/split-later for momentum.
- **Chat-channel-centric ingestion (Slack/Discord)** — rejected for now; the team
  works inside editors, so in-session capture is lower friction.

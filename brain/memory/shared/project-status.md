---
name: project-status
description: Current status of the project — where we are, what's done, parked, and next
owner: team
scope: shared
created: 2026-06-09
tags: [status, project, onboarding]
---

# Project status — where we are

_Living snapshot. **Last updated: 2026-06-09.** Refresh it any time with `/status`._

## TL;DR
The shared AI brain is **built and usable**. What we're actually building — theme,
product direction, tech stack — is **still open**. Dudu (the WhatsApp bot) is built
but **not deployed**.

## Done ✅
- **Shared brain infra:** three-layer architecture (brain / adapters / git-sync),
  memory model, processes, decisions, slash commands (`/sync` `/braindump` `/decide`
  `/standup` `/status`), SessionStart hook, GitHub brain-sync workflow + CODEOWNERS.
  See [[architecture-of-the-brain]].
- **Team & roles:** Dor — design [[dor-role]], Gidi — product [[gidi-role]],
  Ohad — tech [[ohad-role]].
- **Decisions recorded:** ADR 0001 (architecture), ADR 0002 (Dudu).
- **Dudu (WhatsApp bridge):** code built and compiling; POC self-mode + member
  allowlist guard.

## In progress / open ⏳
- **Product direction:** theme, tech stack, and what we're building are still being
  explored — no decision yet. This is the big open question.

## Parked 🅿️
- **Dudu deployment:** needs a free always-on host or a dedicated number; not
  currently running. See [[0002-dudu-whatsapp-bridge]] and [[budget-constraint]].

## Constraints
- **No spend on infra** right now — free tools/hosting only. [[budget-constraint]]

## Next steps
- Decide a first **product direction** → `/decide` (becomes ADR 0003).
- Each member: run `/sync`, then `/braindump` your context.
- Revisit Dudu hosting if a free option or a budget appears.

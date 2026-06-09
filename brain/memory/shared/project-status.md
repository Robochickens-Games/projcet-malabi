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
- **Live on GitHub:** `Robochickens-Games/projcet-malabi` — clone → `/status` → caught up.
- **Team & roles:** Dor — design [[dor-role]], Gidi — product [[gidi-role]],
  Ohad — tech [[ohad-role]].
- **Decisions recorded:** ADR 0001 (architecture), ADR 0002 (Dudu).
- **Dudu (WhatsApp bridge):** code built and compiling; POC self-mode + member
  allowlist guard.
- **Skills:** `product-designer` (Dor), `project-management` (Gidi), `brain-dump`
  (ideas → team-reviewed proposals) — all usable by anyone.
- **Auto-briefing:** every session / clone opens with **What's new / Built / Waiting**
  (SessionStart hook + `/sync`).
- **Proposals gate:** `brain/proposals/` — ideas are logged and surfaced but not
  acted on until the team reviews and agrees.

## In progress / open ⏳
- **Product direction:** theme, tech stack, and what we're building are still being
  explored — no decision yet. This is the big open question.

## Parked 🅿️
- **Dudu:** Dor flagged it isn't going as hoped (phone-number + hosting friction) —
  accepted and parked, not a problem to fix. See [[dudu-direction-note]],
  [[0002-dudu-whatsapp-bridge]], [[budget-constraint]].

## Constraints
- **No spend on infra** right now — free tools/hosting only. [[budget-constraint]]

## Next steps
- Decide a first **product direction** → `/decide` (becomes ADR 0003). *This is the
  one that actually moves the project.*
- **Onboard the team:** add Gidi & Ohad as repo collaborators; fill real GitHub
  usernames in `.github/CODEOWNERS`.
- Each member: run `/status` then `/braindump` your context.
- (Optional) Revisit Dudu only if a free host or budget appears.

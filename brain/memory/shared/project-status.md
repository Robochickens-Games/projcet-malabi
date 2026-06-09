---
name: project-status
description: Current status of the project — where we are, what's done, parked, and next
owner: team
scope: shared
created: 2026-06-09
tags: [status, project, onboarding]
---

# Project status — where we are

_Living snapshot. **Last updated: 2026-06-09.** Refresh it any time with `/catchup`._

> 🌟 **North star:** make us money · make it fun. ([[north-star]]) — everything below
> should serve it.

## TL;DR
The shared AI brain is **built and usable**. What we're actually building — theme,
product direction, tech stack — is **still open**, but Dor has put up the first
product thesis (below) for team review.

## Done ✅
- **Shared brain infra:** three-layer architecture (brain / adapters / git-sync),
  memory model, processes, decisions, slash commands (`/sync` `/braindump` `/decide`
  `/standup` `/catchup`), SessionStart hook, GitHub brain-sync workflow + CODEOWNERS.
  See [[architecture-of-the-brain]].
- **Live on GitHub:** `Robochickens-Games/projcet-malabi` — clone → `/catchup` → caught up.
- **Team & roles:** Dor — design [[dor-role]], Gidi — product [[gidi-role]],
  Ohad — tech [[ohad-role]].
- **Decisions recorded:** ADR 0001 (architecture), ADR 0002 (Dudu — abandoned).
- **Skills:** `product-designer` (Dor's domain), `project-management` (team-wide
  coordination — *not* product, which is Gidi's), `brain-dump` (ideas →
  team-reviewed proposals) — all usable by anyone.
- **Auto-briefing:** every session / clone opens with **What's new / Built / Waiting**
  (SessionStart hook + `/sync`).
- **Proposals gate:** `brain/proposals/` — ideas are logged and surfaced but not
  acted on until the team reviews and agrees.

## In progress / open ⏳
- **Product direction:** theme, tech stack, and what we're building are still being
  explored — no decision yet. This is the big open question.
- **Proposals under review (from Dor, 2026-06-09) — reviewers: Gidi + Ohad:** a
  linked product thesis — none acted on until the team agrees:
  - [[science-games-for-kids]] — aim the first product at science games for kids.
  - [[aso-keyword-research-to-pick-topic]] — use App Store keyword research to pick
    the exact topic.
  - [[design-for-app-of-the-year]] — design bar = Apple feature (App of the Year/Month).
  - **Next:** Gidi (product) + Ohad (tech) review → if agreed, promote to ADR 0003.

## Parked 🅿️
- _(nothing parked.)_ **Dudu was dropped** — code removed; only the decision trail
  remains. See [[dudu-direction-note]], [[0002-dudu-whatsapp-bridge]].

## Constraints
- **No spend on infra** right now — free tools/hosting only. [[budget-constraint]]

## Next steps
- Decide a first **product direction** → `/decide` (becomes ADR 0003). *This is the
  one that actually moves the project.*
- **Onboard the team:** add Gidi & Ohad as repo collaborators; fill real GitHub
  usernames in `.github/CODEOWNERS`.
- Each member: run `/catchup` then `/braindump` your context.

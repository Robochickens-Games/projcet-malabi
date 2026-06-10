---
name: project-status
description: Current status of the project — where we are, what's done, parked, and next
owner: team
scope: shared
created: 2026-06-09
tags: [status, project, onboarding]
---

# Project status — where we are

_Living snapshot. **Last updated: 2026-06-10.** Refresh it any time with `/catchup`._

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
- **Proactive sync push (live + verified):** GitHub Action posts every `brain/**`
  change to the team's Telegram group. CI false-fail fixed; confirmed working.
  See [[proactive-sync-push-telegram]].
- **Natural-language Telegram digests (live):** daily digest written in plain English
  via GitHub Models (free tier) — not raw diffs. Members stay synced without a session.
- **Design inspirations captured:** Loom, Monkey Island, Leisure Suit Larry —
  specifically the **exploration mechanic**, not their art/humor style.
  See [[design-inspirations]].

## In progress / open ⏳
- **ADR 0003 (proposed — Ohad review pending):** first product direction locked as
  proposed by Dor + Gidi: kids' science games niche, ASO keyword research to pick
  the specific topic, Apple feature-worthy design bar. See [[0003-first-product-direction-science-games-for-kids]].
- **Gidi — keyword research (2026-06-10):** running OpenAI deep-research on App Store
  keywords in the kids science games space to find a high-demand, low-competition topic.
  Results will drive the specific game/topic choice and move ADR 0003 to accepted.

## Parked 🅿️
- _(nothing parked.)_ **Dudu was dropped** — code removed; only the decision trail
  remains. See [[dudu-direction-note]], [[0002-dudu-whatsapp-bridge]].

## Constraints
- **No spend on infra** right now — free tools/hosting only. [[budget-constraint]]

## Next steps
- **Gidi:** finish OpenAI deep-research on keywords → pick a topic → update ADR 0003.
- **Ohad:** review ADR 0003 → agree or push back → move status to accepted.
- **Onboard the team:** add Gidi & Ohad as repo collaborators; fill real GitHub
  usernames in `.github/CODEOWNERS`.
- Once ADR 0003 is accepted: start first initiative, create `brain/memory/projects/<slug>/`.

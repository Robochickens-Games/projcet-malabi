---
name: project-status
description: Current status of the project — where we are, what's done, parked, and next
owner: team
scope: shared
created: 2026-06-09
tags: [status, project, onboarding]
---

# Project status — where we are

_Living snapshot. **Last updated: 2026-06-16.** Refresh it any time with `/catchup`._

> 🌟 **North star:** make us money · make it fun. ([[north-star]]) — everything below
> should serve it.

## TL;DR
Brain infra is complete. Product concept is taking shape: **Science Museum Mystery —
a tap-and-explore adventure with three wings (Dinosaurs, Space, Inventions), no ads,
ages 5–10.** Waiting on Ohad to review ADR 0003 and accept.

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
  team-reviewed proposals), `paleontologist` (scientific fact-check / accuracy
  review for the dino game — verdicts claims, corrects errors, cites sources),
  `astronomer` (the space-side sibling: planets, missions, spacecraft — guards the
  Space Wing's catalog content) — all usable by anyone.
- **Auto-briefing:** every session / clone opens with **What's new / Built / Waiting**
  (SessionStart hook + `/sync`).
- **Proposals gate:** `brain/proposals/` — ideas are logged and surfaced but not
  acted on until the team reviews and agrees.
- **Proactive sync push (live + verified):** GitHub Action posts every `brain/**`
  change to the team's Telegram group. CI false-fail fixed; confirmed working.
  See [[proactive-sync-push-telegram]].
- **Team onboarded:** Gidi & Ohad added as repo collaborators; everyone is cloned in
  and synced. (`.github/CODEOWNERS` still uses `@*-gh` placeholder handles — deferred,
  low priority; review routing works via collaborator access.)
- **Natural-language Telegram digests (live):** daily digest written in plain English
  via GitHub Models (free tier) — not raw diffs. Members stay synced without a session.
- **Design inspirations captured:** Loom, Monkey Island, Leisure Suit Larry —
  specifically the **exploration mechanic**, not their art/humor style.
  See [[design-inspirations]].
- **Letters to the Editor (live):** anyone can attach notes/content to any piece
  of info in the Malabi Daily (✍️ Add a note); the brain ingests open letters at
  every sync and closes them by commit. See [[daily-notes]].

## In progress / open ⏳
- **Space Wing — plan READY, awaiting Dor to execute (2026-06-16, Gidi):** the
  **second wing** is fully spec'd by Gidi (8-page comic) and has a detailed, ready-to-build
  plan (`product/prototypes/museum-parallax/SPACE-WING-PLAN.md`). Same loop as the dino wing
  (restore 5 dioramas) plus **three new systems** — an economy (Space Supply Desk: sell rocks
  → buy tools), cross-room item dependencies, and new puzzle types + 5 mini-games. Wireframe
  art now, painted later. **Gidi approves starting; Dor's design sign-off pending** before/while
  building. See [[space-wing]]. <!-- resolved-when: path-exists:product/prototypes/museum-parallax/src/economy.js -->
- **First playable prototype built (2026-06-11, Dor):** scenario 1 in the game's
  chosen format — **wide side-scrolling platformer parallax** (walk the lobby →
  tooth reveals from behind a planter → jungle trail → match the tooth in the
  field guide). Wireframe blockout art for now; painted layers drop in 1:1 later.
  Vite + Pixi.js + GSAP, in `product/prototypes/museum-parallax/` (`npm i && npm run dev`).
  Team: play it and judge the feel. See [[prototype-parallax-first-slice]].
- **ADR 0003 (proposed — Ohad review pending):** product = **Science Museum Mystery**,
  tap-and-explore, three wings (Dinosaurs / Space / Inventions), no ads, ages 5–10,
  design bar = Apple feature-worthy. See [[0003-first-product-direction-science-games-for-kids]].
- **First concept image in (2026-06-11, Dor):** warm illustrated museum interior, Art
  Deco, amber/gold + teal/space palette, back-facing child with magnifying glass.
  Art direction captured — see [[art-direction]].
- **ASO keyword research: complete (rounds 1 + 2).** Museum umbrella with dinosaur wing
  as lead ASO hook confirmed. Projected 6k–10k downloads in 6 months on $8k–$12k UA.
  See [[aso-research-findings]], [[game-concepts]].

## Parked 🅿️
- _(nothing parked.)_ **Dudu was dropped** — code removed; only the decision trail
  remains. See [[dudu-direction-note]], [[0002-dudu-whatsapp-bridge]].

## Constraints
- **No spend on infra** right now — free tools/hosting only. [[budget-constraint]]

## Next steps
- **Dor:** review the Space Wing spec + plan ([[space-wing]]) → approve so execution starts.
- **Ohad:** review ADR 0003 → agree or push back → move to accepted.
- **Team:** first project folder now exists — `brain/memory/projects/science-museum-mystery/`. <!-- resolved-when: path-exists:brain/memory/projects/science-museum-mystery -->
- **Onboard the team:** add Gidi & Ohad as repo collaborators; fill real GitHub
  usernames in `.github/CODEOWNERS`. <!-- resolved-when: codeowners-filled -->

<!--
  Reconcile markers: append an HTML comment containing  resolved-when: CHECK  to any
  "Next up" / "In progress" bullet that is machine-verifiable. At wiki build time the
  board auto-moves it to Done (marked auto-verified) once the check passes, so finished
  work stops lingering here. Supported checks: path-exists:REPO-RELATIVE-PATH and
  codeowners-filled. See scripts/build-wiki.mjs (reconcileStatus).
-->


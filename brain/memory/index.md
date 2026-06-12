# Memory Index

The table of contents for everything the team knows. **Load this first**, then
open the specific memory files relevant to your task. Keep it to one line per
memory — never put memory content here.

## Memory format

Each memory is **one file, one fact**, with frontmatter:

```markdown
---
name: <short-kebab-case-slug>
description: <one-line summary — used to judge relevance during recall>
owner: dor | gidi | ohad | team
scope: shared | member | project
project: <slug>            # only when scope: project
created: YYYY-MM-DD
tags: [comma, separated]
---

<the fact. For decisions/feedback, add **Why:** and **How to apply:** lines.
Link related memories with [[their-name]].>
```

After writing a memory, add a one-line pointer below under the right section.

---

## Shared (team-wide truth)
- [north-star](shared/north-star.md) — 🌟 our guiding goals (make money · make fun); align everything to it
- [team](shared/team.md) — who's who, roles, contact, working norms
- [architecture-of-the-brain](shared/architecture-of-the-brain.md) — how this whole system is structured
- [budget-constraint](shared/budget-constraint.md) — no spend on infra right now; default to free
- [project-status](shared/project-status.md) — where we are: done / in progress / parked / next
- [dudu-direction-note](shared/dudu-direction-note.md) — Dudu isn't going as Dor hoped; accepted, parked
- [design-inspirations](shared/design-inspirations.md) — games the team likes: Loom, Monkey Island, Larry
- [visual-language-references](shared/visual-language-references.md) — inspiration games for the VISUAL language (illustrated adventure, premium tactile, hidden-object, kids-explorable) + what to steal from each
- [aso-research-findings](shared/aso-research-findings.md) — ASO keyword research results: dinosaurs are the strongest launch theme; full report in brain/research/
- [project-gazette](shared/project-gazette.md) — the newspaper-style wiki auto-published to GitHub Pages; visualizes the brain + what changed when
- [daily-notes](shared/daily-notes.md) — Letters to the Editor: post notes/content on any piece of info in-page (utterances); Telegram-pinged instantly, brain ingests at every sync, closes by commit
- [click-to-play-engagement-concern](shared/click-to-play-engagement-concern.md) — open design concern: will the click-to-play exploration loop create the engagement we want (kids/touch)? + mitigations + prototype-to-resolve
- [gameplay-principles](shared/gameplay-principles.md) — the six gameplay principles we design toward (every tap rewards, drip of aha, obvious-tappable, no dead ends, collection layer, soft guidance)
- [game-concepts](shared/game-concepts.md) — current concept: Science Museum Mystery, three wings (Dinosaurs/Space/Inventions), tap-and-explore, ages 5–10, no ads
- [art-direction](shared/art-direction.md) — visual direction: warm illustrated museum, Art Deco, amber/gold + teal/space palette, back-facing child protagonist with magnifying glass
- [art-scientific-realism](shared/art-scientific-realism.md) — all imagery depicts REAL, scientifically accurate subjects (actual spacecraft, real devices, true specimens); painterly style stays, no toy/fantasy/made-up objects
- [status-board-reconcile](shared/status-board-reconcile.md) — the status board self-corrects at build: done Next-up items auto-move to Done via resolved-when markers
- [prototype-parallax-first-slice](shared/prototype-parallax-first-slice.md) — first playable feel-prototype (parallax lobby → tooth → dino hall → catalog match) is built + live on Vercel (malabi-museum-parallax.vercel.app, linked from the gazette masthead); stack = Vite + Pixi.js + GSAP, in product/prototypes/museum-parallax
- [daily-dispatch-2026-06-11](shared/daily-dispatch-2026-06-11.md) — special-edition roundup of June 11: dinosaurs confirmed, Science Museum Mystery named, 15 dino mechanics, first playable prototype, gazette glow-up

## Members
### Dor
- [dor-role](members/dor/dor-role.md) — Dor's role: design
### Gidi
- [gidi-role](members/gidi/gidi-role.md) — Gidi's role: product management
### Ohad
- [ohad-role](members/ohad/ohad-role.md) — Ohad's role: tech

## Proposals (under review)
- [dinosaur-section-mechanics](../proposals/dinosaur-section-mechanics.md) — 15 mechanic ideas for the dino wing; recommended trio: Time Lens + Fossil Detective Board + Living Diorama
- [puzzle-brush-away-the-dust](../proposals/puzzle-brush-away-the-dust.md) — first dino puzzle: find brush → brush rock in layers → reveal out-of-place ammonite
- [asset-generation-pipeline](../proposals/asset-generation-pipeline.md) — manifest-driven AI pipeline for style-consistent transparent-PNG assets at scale; free ComfyUI primary, scaffold built in product/asset-pipeline/

## Decisions
- [0003-first-product-direction-science-games-for-kids](../decisions/0003-first-product-direction-science-games-for-kids.md) — proposed: kids science games niche, ASO topic research, Apple feature design bar, click-to-play gameplay held to six engagement principles (Ohad review pending)

## Projects
_(none yet — first initiative creates `memory/projects/<slug>/` and a section here)_

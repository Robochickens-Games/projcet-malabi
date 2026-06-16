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
- [coach-learning-loop](shared/coach-learning-loop.md) — the coach skill teaches lessons learned into the other skills'/agents' own definitions, so the system improves instead of repeating mistakes
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
- [prototype-concept-asset-driven](shared/prototype-concept-asset-driven.md) — second concept test: an asset-driven parallax scaffold (one config + drop-in art folders, placeholders show drop-paths) in product/prototypes/museum-concept; vanilla JS + Vite, sibling to the wireframe prototype, deployed at malabi-museum-concept.vercel.app
- [clue-design-deduction-not-naming](shared/clue-design-deduction-not-naming.md) — puzzle clues must make the player deduce from a dino's traits; never name the answer item or its location (rules applied to museum-parallax)
- [puzzle-challenge-match-the-reference](shared/puzzle-challenge-match-the-reference.md) — assembly puzzles should make the player match a catalog reference by moving + rotating pieces, not drop them into obvious telegraphed slots (T-rex foot puzzle reworked)
- [prototype-ptero-fish-run-minigame](shared/prototype-ptero-fish-run-minigame.md) — one-tap "Fish Run" flappy mini-game in the Pteranodon room of museum-parallax: tap to flap (wings swing), snatch fish that porpoise out of an opaque sea, touch water = game over, 5/10/20 confetti celebrations; bright cartoon scene with Dor-supplied pixel-art sprites (Pteranodon + tuna/coelacanth/anglerfish); self-contained canvas overlay in src/pteroGame.js, launched from a cliff placard
- [prototype-brachio-endless-runner-minigame](shared/prototype-brachio-endless-runner-minigame.md) — low-poly 3D endless runner for the Brachiosaurus: walks ACROSS the forest canopy weaving its long neck between treetops (3 lanes, NO jumping) to browse leaves/berries at head height + dodge boughs (mechanic embodies the real trait); standalone Vite + Three.js in product/prototypes/brachio-runner, ALSO wired into museum-parallax (a "BRACHIO RUN" placard in the Brachiosaurus room opens it as an overlay, runner reused via cross-folder import — no code dup); deliberately departs from painterly-2D art to validate feel fast
- [prototype-game-ui-3d](shared/prototype-game-ui-3d.md) — game-UI design system + showcase in product/prototypes/game-ui-3d; pivoted from chunky toon to a "museum-placard" feel (carved depth, aged brass/parchment, Art-Deco framing, gold-leaf Cinzel titles) to match the painterly assets; now drives museum-concept's UI (bottom dock for mobile, inventory + menu)
- [daily-dispatch-2026-06-11](shared/daily-dispatch-2026-06-11.md) — special-edition roundup of June 11: dinosaurs confirmed, Science Museum Mystery named, 15 dino mechanics, first playable prototype, gazette glow-up
- [daily-dispatch-2026-06-12](shared/daily-dispatch-2026-06-12.md) — Breaking: local AI art pipeline built, four painted wings live on Vercel, the Great Monkey Incident documented
- [prototype-completion-states](shared/prototype-completion-states.md) — museum-parallax now finishable end-to-end: each exhibit stamps a "SOLVED" seal on its diorama when all its challenges are done, the two mini-games gained win goals (Fish Run = catch 10, Brachio Run = survive 20s), and clearing all five rooms fires a Dinosaur-Wing grand finale (lobby door seal + finale card + confetti); redeployed to Vercel
- [success-reel-fossil-fit](shared/success-reel-fossil-fit.md) — the shared fossil-fit celebration clip (Triceratops fleshes out from bare bones), playable inline; plays when a clue snaps into place
- [success-reel-velociraptor](shared/success-reel-velociraptor.md) — the Velociraptor celebration clip (feathered hunter builds up from bones), playable inline; plays when the feather is placed
- [success-reel-trex-foot](shared/success-reel-trex-foot.md) — the T-rex celebration clip (tyrant builds up from bones to muscle), playable inline; plays when the foot-assembly puzzle is solved
- [scientific-realism-rule](shared/scientific-realism-rule.md) — all game imagery depicts real, scientifically accurate artifacts; painterly style stays, subjects must be real
- [dino-accuracy-rulings](shared/dino-accuracy-rulings.md) — settled paleontology verdicts for the dino roster (Velociraptor feathered, Triceratops scaly, tooth-shape→diet); don't re-litigate, append new rulings
- [mobile-shipping-webview-wrap](shared/mobile-shipping-webview-wrap.md) — path to App Store / Play is a WebView wrapper (Capacitor / Expo-webview), reuses ~95% of the web code; native React Native would only salvage game logic, so keep building web-first
- [blender-asset-experiment-flop](shared/blender-asset-experiment-flop.md) — 🎈 Flop watch: Dor's try at auto-generating game assets straight from Blender produced a balloon-blob "Triceratops" (pink sphere up front, hornless aardvark in profile); off art-direction + accuracy bar, lessons logged, paid hosted-API pipeline still the path

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
- [asset-generation-pipeline](../proposals/asset-generation-pipeline.md) — DECIDED: manifest-driven pipeline adopted, but free-local ComfyUI engine dropped (see 0004); manifest + post-process + product kept, paid API is the path

## Decisions
- [0003-first-product-direction-science-games-for-kids](../decisions/0003-first-product-direction-science-games-for-kids.md) — proposed: kids science games niche, ASO topic research, Apple feature design bar, click-to-play gameplay held to six engagement principles (Ohad review pending)
- [0004-drop-local-comfyui-engine](../decisions/0004-drop-local-comfyui-engine.md) — accepted: removed the local ComfyUI + SDXL engine (~22 GB freed, off-target quality); manifest/post-process/product kept engine-agnostic, paid hosted API when generation resumes

## Projects
_(none yet — first initiative creates `memory/projects/<slug>/` and a section here)_

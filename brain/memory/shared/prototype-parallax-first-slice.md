---
name: prototype-parallax-first-slice
description: First playable feel-prototype is built — parallax lobby → tooth → dino hall → catalog-deduction diorama match; stack = Vite + Pixi.js + GSAP, lives in product/prototypes/museum-parallax
owner: dor
scope: shared
created: 2026-06-11
tags: [prototype, parallax, stack, design, gameplay, dinosaurs]
---

# First feel-prototype: parallax museum slice (built, working)

**What:** A playable web prototype of scenario 1 lives in
`product/prototypes/museum-parallax/` (`npm install && npm run dev`):

1. **Lobby** (warm Art Deco, per [[art-direction]]) with real parallax depth —
   mouse / touch-drag / device tilt shifts layers at different rates, so things
   hide *behind* things. A fossil tooth is half-hidden behind the foreground
   planter; you must look around to spot it.
2. Tap the tooth → flies into a collection slot.
3. **Catalog** shows 3 dinos + diets + tooth shapes — the tooth is wide and
   flat → plant eater (the deduction is the teaching moment).
4. **Dinosaur hall**: 3 dioramas (Spinosaurus / Allosaurus / Triceratops).
   Wrong guesses shake + teach; Triceratops celebrates and awards
   **Fossil Fragment 1/4** (the collectible spine from [[puzzle-brush-away-the-dust]]).

**Stack decision (Dor, 2026-06-11):** **Vite + Pixi.js (WebGL) + GSAP**, all
free ([[budget-constraint]]); deploys as a static URL anyone can open on a
phone. Chosen over Unity/Godot (slow to share/iterate) and CSS-only (caps out
on masking/particles/feel). The brush-reveal puzzle's layer masking is native
to this stack.

**Art:** code-authored layered SVG in the captured palette — placeholder for
painted illustration later; the layer/depth structure is the deliverable.

**Why:** test the *feel* (parallax discovery + tap rewards, per
[[gameplay-principles]] and [[click-to-play-engagement-concern]]) before
investing in real art or engine work.

**How to apply:** judge the prototype against the anchors in
[[visual-language-references]]; iterate on feel here before any engine
decision. Copy says "ferns and leaves," not grass (paleo-accurate — vet final
content with the `paleontologist` skill).

**Gotcha worth keeping:** with Vite/Rollup, a top-level `await` in the entry
chunk deadlocks Pixi v8's dynamically-imported renderer chunks (circular
chunk wait, build-only — dev mode works). Boot via an async function instead.

Related: [[game-concepts]], [[art-direction]], [[design-inspirations]],
[[0003-first-product-direction-science-games-for-kids]], [[north-star]].

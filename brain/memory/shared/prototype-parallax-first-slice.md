---
name: prototype-parallax-first-slice
description: Playable prototype of scenario 1 — wide side-scrolling platformer-parallax format (Dor's format decision), wireframe blockout art now, painted assets to drop in later; in product/prototypes/museum-parallax
owner: dor
scope: shared
created: 2026-06-11
updated: 2026-06-11
image: brain/images/landscape dino.png
tags: [prototype, parallax, platformer, stack, design, gameplay, dinosaurs]
---

# Playable prototype: wide platformer-parallax slice (built, working)

**What:** A playable web prototype of scenario 1 lives in
`product/prototypes/museum-parallax/` (`npm install && npm run dev`):

1. **Lobby** — a 2880px walkable hall (drag / fling / scroll / arrow keys with
   acceleration / tilt). A fossil tooth hides behind a planter **on a slower
   parallax layer — walking past it IS the reveal**.
2. **Nesting Grove** — a 3840px jungle trail. Layer stack: clouds+sun 0.1× ·
   mountains 0.3× · treeline 0.5× · trail+scene 1.0× · foreground 1.42×.
3. Arrive at a skeleton + **field guide with four tooth-type cards**
   (carnivore/piscivore/insectivore/herbivore); the wide flat tooth → herbivore
   → Triceratops match. Wrong cards shake + teach; success awards Fragment 1/4.

**Format decision (Dor, 2026-06-11):** the game uses a **wide, continuous
side-scrolling world with platformer parallax** — not a static screen with a
tilt lens. Walking the world is the core feel; depth comes from layer speeds.

**Art decision (Dor, 2026-06-11):** prototype stays **low-fi wireframe**
(outlines + labels, each layer carries its speed tag) until real assets arrive;
painted layers will replace wireframe layers 1:1 (same world widths). World
layout constants in `src/wireframe.js` drive both drawings and hotspots.

**Stack:** Vite + Pixi.js (WebGL) + GSAP, all free ([[budget-constraint]]).
A painted-art experiment using Gidi's Nesting Grove mock
(`brain/images/landscape dino.png`) validated that the art direction works in
engine; its slicing pipeline (feathered layer cuts + inpainted base) is kept in
`scripts/generate-assets.mjs` for when final art lands.

**Live (2026-06-11):** deployed to Vercel, public + always reachable at
**https://malabi-museum-parallax.vercel.app** — linked from the masthead of
[[project-gazette]] ("▶ Play the prototype", visible on every tab). The Vercel
project is `malabi-museum-parallax` under Dor's `dortaldts-projects` scope.
**Auto-deploy is on:** the project is connected to the GitHub repo (production
branch `main`, root directory `product/prototypes/museum-parallax`, framework
Vite). **Every push that touches the prototype path rebuilds and republishes
automatically** — no manual step (an Ignored-Build-Step skips pushes that don't
touch the prototype, so routine brain commits don't trigger builds). Because the
build host has no access to the brain's image pipeline, the prototype's
`public/img/` assets are **committed** to the repo (un-gitignored) so builds are
self-contained.

**Art handoff (Dor, 2026-06-11):** a single master vector asset board lives at
`product/prototypes/museum-parallax/assets/asset-board.svg` — **generated**, not
hand-drawn, by `node scripts/build-asset-board.mjs`, which pulls every swappable
layer + prop straight from `src/wireframe.js`/`src/art.js` so each frame is the
exact 1:1 export size the engine expects (frames are named: `lobby-back`,
`grove-main`, `tooth-leaf-herbivore`, `skeleton-trike`…). Imports natively into
Figma/Illustrator/Affinity as named layers; an artist traces over the blockout,
matches the bottom "painted-direction" reference section, and exports each to
`public/img/<id>.png`. Rebuild whenever the world layout changes so the handoff
never drifts from live geometry. See `assets/README.md`.

**Shipping path (reconciled 2026-06-16, was "throwaway caveat"):** this was first
logged (Dor, 2026-06-11) as a Vite **feel test** to be **thrown away** when the app
moved to **Expo (React Native)**. That has been **superseded** — the decided route
to the stores is a **WebView wrapper** (Capacitor / Expo-webview), which reuses
**~95% of this web code as-is**, so the Vite + Pixi/GSAP work is **carried forward,
not discarded**; a native RN rewrite is *not* the plan ([[mobile-shipping-webview-wrap]]).
It's still a feel test, so keep investment proportionate and port the learnings
(world widths, layer speeds, reveal timing) — but the code itself now has a path
forward. (Addresses the open letter re-raising the throwaway worry.)

**Why:** test the walk-and-discover feel ([[gameplay-principles]],
[[click-to-play-engagement-concern]]) before investing in art or engine work.

**Gotcha worth keeping:** with Vite/Rollup, a top-level `await` in the entry
chunk deadlocks Pixi v8's dynamically-imported renderer chunks (circular chunk
wait, build-only — dev mode works). Boot via an async function instead.

Related: [[game-concepts]], [[art-direction]], [[design-inspirations]],
[[visual-language-references]],
[[0003-first-product-direction-science-games-for-kids]], [[north-star]].

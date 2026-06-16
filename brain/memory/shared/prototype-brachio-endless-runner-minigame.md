---
name: prototype-brachio-endless-runner-minigame
description: Low-poly 3D endless-runner mini-game for the Brachiosaurus — walks ACROSS the forest canopy weaving its long neck between treetops (3 lanes, no jumping) to browse leaves/berries at head height + dodge boughs; Three.js, standalone in product/prototypes/brachio-runner AND wired into museum-parallax
owner: dor
scope: shared
created: 2026-06-15
tags: [prototype, minigame, gameplay, brachiosaurus, three-js, low-poly]
---

# "Brachio Run" — low-poly 3D endless runner (built, local mechanics test)

**What:** A lane-based endless runner for the **Brachiosaurus**, Subway-Surfers /
Temple-Run style, but reframed to fit the animal (Dor's refinement): the teal sauropod
walks *across the forest canopy*, **weaving its long neck between the treetops** to
**browse leaves & berries at head height** across 3 lanes and **steer around boughs**.
Controls are lane-weave only — **no jumping** (the long neck doing the reaching is the
point; an obstacle in your lane can only be avoided by switching lanes). HUD: 3-life
leaf pips, a left-side leaf meter, score + combo multiplier, distance-in-metres +
finish-flag. Brief i-frame blink after a hit (no hard stop on one hit), difficulty
ramps with speed and never blocks all 3 lanes; out of lives → game-over → tap to run
again (best score persists in localStorage).

**Design note — why canopy + head-height:** the first cut was a ground dirt-trail
runner with jumping over logs/rocks. Dor refined it to match Brachiosaurus's real
trait: a treetop browser on a giant neck. So food + obstacles all sit at `HEAD_Y`, the
ground became a green canopy path through a sea of treetops, and jumping was removed.
The mechanic now embodies the science (long neck → treetop feeding), per
[[clue-design-deduction-not-naming]].

**Deliberately low-poly, deliberately a mechanics test:** built entirely from
Three.js primitives (box torso, pillar legs, raised tapered neck, long tail; cone
trees, treetop blobs, boughs). This **departs on purpose** from the team's settled
painterly-2D art direction ([[art-direction]], [[scientific-realism-rule]]) — the goal
was to validate how the runner *feels* (lane-weave snappiness, head-height browsing,
spawn density, speed ramp) fast, not to propose a 3D art pivot. Final art would be
re-skinned. Flagged as a north-star tradeoff up front.

**Shape / where it lives:**
- **Standalone** prototype `product/prototypes/brachio-runner/` (Dor's call: doesn't
  matter that it's a separate folder, but it should *feel* part of the game). Stack =
  **Vite + Three.js** (mirrors museum-parallax's vite config), separate from the
  Pixi-based museum-parallax. ES modules, one RAF loop, delta-time normalized.
- Module split: `config.js` (lanes/speeds/`HEAD_Y`/colors; forward axis is -Z, dino
  fixed at z=0, canopy scrolls toward camera), `dino.js` (primitive Brachiosaurus +
  lane-lerp + speed-scaled run cycle, no jump), `world.js` (scrolling green canopy
  path + recycling sea of treetops), `spawner.js` (pooled boughs/food at HEAD_Y,
  scroll+recycle, difficulty scales with speed, never blocks all lanes), `game.js`
  (ready→play→over state machine, lives,
  score, combo multiplier, leaf meter, i-frames, tiny Web-Audio blips), `hud.js`
  (builds its own scoped DOM HUD — kept out of canvas so it's easy to restyle),
  `runner.js` (**`mountBrachioRunner(container, {onExit})`** — the single reusable
  engine entry, returns `{dispose}`), `main.js` (thin standalone bootstrap).

**Now wired into the museum** (Dor asked to "wire to prototype"): a glowing
**"BRACHIO RUN — tap to play ▸"** placard sits on the open plain of the Brachiosaurus
room in `museum-parallax` (x:850 in `buildBrachio`), opening the runner as a
full-screen overlay (`‹ Back to the trail` / Esc closes), exactly mirroring the Fish
Run placard pattern (`buildPteroGameEntry` → `pteroGame.js`). **No code duplicated**:
`museum-parallax/src/brachioGame.js` (open/close/isOpen overlay, like pteroGame)
imports `mountBrachioRunner` from the sibling `brachio-runner/src/runner.js`. The
cross-folder reuse resolves in dev + prod via two lines in
`museum-parallax/vite.config.js` — a `three` alias (pins all bare `three` imports,
incl. the sibling's, to museum-parallax's three) and `server.fs.allow` for the sibling
dir; `three` is now a museum-parallax dependency. Room drag-to-walk is suppressed while
open via an `isBrachioGameOpen()` guard (alongside the existing `isPteroGameOpen()`).

**Gotcha fixed:** the start/game-over modal is a DOM overlay above the canvas with
`pointer-events:auto`, so it **swallowed the tap** before it reached the canvas input
— tap-to-start silently failed on touch (only the keyboard Space start worked). Fixed
by wiring a `pointerdown` on the modal straight to the start path.

**Verified:** both `vite build`s pass (standalone + museum-parallax, the latter
proving the cross-folder import + three alias resolve in production). Headless Chrome
confirms: standalone renders/plays the full loop to game-over ("Out of leaves! Score
498 · 196m", best persisted); and inside museum-parallax the placard's open path
mounts the overlay (canvas + HUD), tap-to-start plays, the back button closes and
restores room input — all with no JS console errors.

**Why:** second arcade mini-game pattern after the Pteranodon Fish Run
([[prototype-ptero-fish-run-minigame]]) — a different interaction shape (3D
into-the-screen runner vs side-view flappy) to probe what a Brachiosaurus mini-game
could feel like. Aligns with [[gameplay-principles]] and [[north-star]] (fun, fast to
iterate). Paleontology accuracy pass on the sauropod silhouette is a deliberate
follow-up.

Related: [[prototype-ptero-fish-run-minigame]], [[prototype-parallax-first-slice]],
[[prototype-game-ui-3d]], [[art-direction]], [[scientific-realism-rule]], [[north-star]].

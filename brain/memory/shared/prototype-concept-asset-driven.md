---
name: prototype-concept-asset-driven
description: Second concept-test prototype — asset-driven parallax scaffold (config + drop-in art folders) in product/prototypes/museum-concept; sibling to the wireframe museum-parallax; deployed at malabi-museum-concept.vercel.app
owner: dor
scope: shared
created: 2026-06-14
tags: [prototype, parallax, concept-test, design, scaffold, art-pipeline]
---

# Concept test 2: asset-driven parallax scaffold (built, working, deployed)

**Deployed (2026-06-15):** live as its **own** Vercel project
`malabi-museum-concept` (org `team_fY4JShMvAfHC1ZKJANujayIj`, same scope as the
wireframe) at **https://malabi-museum-concept.vercel.app** — separate from the
wireframe's `malabi-museum-parallax.vercel.app`. Linked locally via `.vercel/`
(git-ignored); deploy with `vercel deploy --prod` from the prototype dir. The
Gazette masthead now links both side by side ("Play the prototype" + "Concept
demo") via `scripts/build-wiki.mjs`. **Gotcha (fixed):** edit-mode positions
live in `.layout.json` (dev-server only, git-ignored), so the first deploy showed
props in their `config.js` default spots — looked like the art had "moved." Fix:
a `prebuild` step (`scripts/sync-layout.mjs`) bakes `.layout.json` →
`public/layout.json` so the production build ships `/layout.json` and the deploy
matches the last local layout. Re-running `vercel deploy --prod` after edit-mode
changes now carries them through.

**Mobile-Safari crash fixed (2026-06-15):** the deployed concept hit iOS Safari's
"A problem repeatedly occurred" (tab killed on memory pressure, reload-loops).
Cause: the painted props were authored at 3000+px / 4–7.6 MB each (~22 images),
≈**310 MB of decoded RGBA bitmaps** held at once — over the per-tab budget;
amplified by a per-`.prop` `drop-shadow` filter + fullscreen blur/blend FX. Fix
(done): downscaled every oversized PNG to a **1600px long-edge cap** with `sips`
(tooth → 800), no format/path change. Decoded memory **310 → 76 MB**, on-disk
**97 → 29 MB**; redeployed, layout intact. Originals backed up at
`product/prototypes/_museum-concept-orig-assets/` (sibling, outside the Vercel
project root so it's never uploaded). **Asset rule going
forward:** keep dropped-in art ≤~1600px on the long edge — full-res exports crash
the phone.

**Round 2 — still crashed; low-FX mobile mode (2026-06-15):** shrinking assets
alone wasn't enough because the concept renders in **DOM layers** (unlike the
Pixi/WebGL [[prototype-parallax-first-slice]], which is one canvas). Each of
~16 parallax layers rides its own `translate3d` compositing layer under a
`scale()`-d world, every `.prop` carries a `drop-shadow` filter, and the
cinematic FX are fullscreen `blur(22px)` + `mix-blend-mode` overlays driven every
rAF frame — on iOS those filtered/blended backing stores pile up and blow the
budget regardless of image bytes. Fix: a `LOW_FX` flag
(`matchMedia('(hover:none) and (pointer:coarse)')`) adds a `.lowfx` body class on
touch devices that (a) **skips `setupFx()`** entirely and (b) CSS-removes the
per-prop `drop-shadow`, the FX overlays, and the modal `backdrop-filter`. Desktop
keeps the full look. **Lesson:** DOM-layer parallax is memory-cheap to author but
GPU-heavy on mobile — filters/blends are the cost, not just pixels.

**What:** A second concept test in `product/prototypes/museum-concept/`
(`npm install && npm run dev` to run locally).
Sibling to the wireframe [[prototype-parallax-first-slice]]: same
walk-and-discover parallax feel, but rebuilt as a **drop-in art pipeline** so
painted directions and new scene ideas can be tried without touching engine code.

**Shape:**
- **One config drives everything** — `src/config.js` declares scenes, their
  parallax `layers` (image `src` + `speed`), and clickable `hotspots`
  (`x,y,w,h` rect + an `action`: `goto` / `collect` / `toast` / `link`).
- **Drop-in folder tree** — `public/assets/{backgrounds/<scene>, props, ui, audio}`,
  each with a README stating naming + sizing rules (layers authored at
  `sceneWidth × 1080`).
- **Always runs, even empty** — any layer/hotspot whose art isn't dropped yet
  renders as a **labelled placeholder showing the exact drop-path**, so flow and
  pacing are testable before a single asset lands.
- Input: drag/fling, scroll wheel, ← → keys with inertia. Hotspots are real DOM
  buttons (clickable/accessible); a drag over one is ignored, not treated as a tap.

**Stack:** vanilla JS + CSS + Vite — **no Pixi, no GSAP** (deliberately lighter
than the wireframe prototype; the goal is an art-drop sandbox anyone can edit).
Seeded with the lobby + Dinosaur-Wing grove scenes as placeholders.

**Why:** the wireframe prototype bakes its (procedural SVG) art into code; this
one separates art from engine so the team can drop real backgrounds/props/UI and
audition visual concepts fast. Same throwaway caveat applies — it's a feel/look
test, not the Expo foundation; port learnings, not code.

**First painted art in (2026-06-14):** the lobby now runs on real concept art —
a wide grand-hall painting (2912×416, shown full-height as a ~7560px world) plus
three alpha cut-out **props** (Ionic column, palm-in-terracotta-pot, wooden
signpost) parallaxing on faster planes. This added a second layer kind to the
engine: **PROP layers** (a positioned cut-out at a world `x`/`y`/`h` on its own
`speed`, optional `flip`) alongside the original full-width **BAND** layers — so
set-dressing can be dropped in and given depth without engine changes. A stone
**archway prop at the end of the hall is the doorway into the Dinosaur Wing**
(its enter-hotspot rides the same 1.0 plane so it stays locked to the arch); the
mounted T-rex skeleton is a "look" hotspot. A **foreground colonnade** of
full-height columns (same art, alternately flipped) sweeps past as you walk.

**Visual edit mode (2026-06-14):** an in-browser layout tool (✎ button / press
`E`) — tap a prop to select, drag (or arrow-keys) to move, and a draggable panel
for full control of **depth (parallax speed)**, size, flip, and z-order. **Edits
auto-save** to `.layout.json` via a tiny Vite dev-server endpoint and reload on
boot, so layouts persist across refreshes (`.layout.json` is git-ignored and
overrides `config.js` while present). "Copy config" emits a ready-to-paste
`layers` block to commit a layout back into `config.js`. Lets the team dress
scenes with dropped-in art without hand-editing coordinates.

**Grove built too (2026-06-14):** Dinosaur Wing now runs on art — a dino-gallery
panorama backdrop, a **Triceratops skeleton main display** (hero exhibit, room
to its right reserved for clue items), and the four tropical ferns as the
foreground "front layer." The lobby clue (a horned ceratopsian skull) matches
the Triceratops, so find-the-fossil → match-the-skeleton lines up.

**Verified (2026-06-14):** production build clean; headless tests confirm both
scenes build from art (0 placeholders), parallax walks, arch enters the wing,
clue collects, and edit mode moves props + exports valid config — zero console
errors.

**Toon-3D UI + depth-z fix (2026-06-14):** the prototype's whole UI chrome now
runs on the shared [[prototype-game-ui-3d]] design system (copied in as
`src/ui-3d.css`, imported before `style.css`): HUD buttons, title/scene pills,
toast, plus a new **inventory** modal (collected clues as tiles + empty slots,
badge count on the 🎒 button) and a **menu** modal (Resume, Sound/Music toggles,
How-to-play, Restart tour). The edit-mode panel was reskinned to match (parchment
chunk + gold ribbon head, toon buttons). Engine rule added: **paint order follows
depth** — a layer's parallax `speed` sets its `z-index` (`depthZ`), so nothing far
back can render over something nearer; same-speed layers keep authoring order (so
the clue still tucks behind its column). This fixed a bug where edited depths left
stale z-order (e.g. the low-speed palm pot painting over the columns), which also
made drag-to-pan feel broken in edit mode.

**Cinematic FX (2026-06-14):** added a scroll-reactive overlay layer driven by the
camera loop — a **lens flare** (drifting light core + bloom + three ghosts on the
center→light line + an anamorphic horizontal streak) whose intensity rises with
scroll velocity, a cinematic **vignette** (multiply), and parallaxing **dust motes**.
Pure overlay (screen/multiply blend, `pointer-events:none`), dims to 25% in edit
mode, and respects `prefers-reduced-motion`. Sells the candlelit-hall mood as you walk.

Related: [[prototype-parallax-first-slice]], [[prototype-game-ui-3d]],
[[visual-language-references]], [[art-direction]], [[gameplay-principles]],
[[north-star]].

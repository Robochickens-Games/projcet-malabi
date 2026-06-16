---
name: prototype-ptero-fish-run-minigame
description: One-tap "Fish Run" flappy-style mini-game in the Pteranodon room of museum-parallax — tap to flap, snatch fish that porpoise out of the sea; bright cartoon art using Kenney CC0 fish sprites; bounces off water (no death)
owner: dor
scope: shared
created: 2026-06-15
tags: [prototype, museum-parallax, minigame, gameplay, ptero]
---

# "Fish Run" — one-tap mini-game in the Pteranodon room (built, local)

**What:** A flappy-bird-style mini-game inside the **PTERODACTYL / sea-cliffs room**
of the `museum-parallax` prototype. You fly the Pteranodon with **one tap** (tap /
space = flap up; gravity pulls you down) and **snatch fish that porpoise out of the
sea** with your beak. **Touch the water and it's game over** (tap to play again);
hitting **5 / 10 / 20 / …** fish fires a confetti celebration ("5 FISH!"). Ties to
the room's real science beat — Pteranodon is a toothless, fish-eating pterosaur
("Eats fish 🐟"), so the mechanic teaches the trait.

**Art (Dor's call — cartoon over painterly):** a **bright sunny cartoon sea**, a
deliberate departure from the dark painterly room (internal-demo latitude). Sprites
are **Dor-supplied pixel art** in `public/game/`: a Pteranodon (`pterodactyl.png`,
mirrored to face right) and three real fish — `tuna`, `coelacanth`, `anglerfish`
(sliced from one ChatGPT-generated sheet via a downscaled flood-fill in Python;
the right-facing coelacanth is flipped at draw time so all fish swim left). These
**replaced** an earlier interim set of Kenney CC0 Fish Pack sprites.

**Mechanic iterations (each a real fix):**
1. First cut had fish leap in a parabola — with the bird at a fixed x they fell back
   into the sea before ever reaching it → **uncatchable**. 
2. Reworked to **realistic porpoising**: fish swim low, breach in true ballistic
   arcs (varied heights), and dive back in. They're **clipped to above the waterline
   so they're hidden while submerged** (the opaque sea "swallows" them).
3. Water first **bounced** (no death), then water = death, then softened to a brief
   grace window: the bird can dip in and bob (drag + depth cap + splashes) and only
   **drowns if submerged past `DROWN_MS` (300 ms)** — flap out in time and you live.
   A **depleting droplet timer bar** (💧, green→amber→red) floats above the bird
   while it's in the water. Catch radius ~52u; verified catchable + milestone +
   grace-survive + 300 ms drown + indicator + restart via aim-bot.

**Shape / where it lives:**
- New self-contained module `product/prototypes/museum-parallax/src/pteroGame.js`
  — owns its own full-screen DOM `<canvas>` overlay, RAF loop, input, and tiny
  Web-Audio SFX. **No Pixi / GSAP dependency** — deliberately isolated from the
  1.6k-line `main.js`. Exports `openPteroGame()` / `isPteroGameOpen()` /
  `closePteroGame()`.
- Renders a bright cartoon scene on `<canvas>` 2D (sky/sun/clouds/opaque sea +
  fish sprites + confetti). Fish are **drawn clipped to above the foam line** so
  they emerge from / vanish into the sea. Everything scales off `U = H/600`.
- **Wing-flap on a static sprite:** the Pteranodon is drawn in two horizontal bands
  split at a shoulder line (`WING_LINE`) — the lower band (body/head/beak) stays
  static while the upper band (wings) is vertically scaled, anchored at the shoulder
  line, at **uniform width** (a whole-sprite scale skewed the head — wrong; banding
  isolates the wings). Constant-frequency sine = smooth beat; deepens after a flap.
- Launched from a glowing **"FISH RUN — tap to play ▸"** placard on the cliff
  ledge (built in `buildPtero` via `buildPteroGameEntry`). While the game is open,
  the room's drag-to-walk input is suppressed (`isPteroGameOpen()` guard, mirroring
  the `puzzleOpen` pattern used by the T-rex foot puzzle).
- Debug hooks added: `window.__goScene(name)` and `window.__pteroGame()`.

**Verified:** `vite build` passes; headless Chrome run confirms the launcher
renders, the game opens over the room, the bird flaps/catches, and there are no JS
console errors.

**Why:** first arcade-style mini-game in the prototype — a second interaction
verb beyond the drag-the-clue puzzles, and a model for per-room mini-games that
reinforce each animal's real trait. Aligns with [[gameplay-principles]] and
[[clue-design-deduction-not-naming]] (mechanic embodies the trait rather than
naming it).

Related: [[prototype-parallax-first-slice]], [[scientific-realism-rule]],
[[prototype-game-ui-3d]], [[north-star]].

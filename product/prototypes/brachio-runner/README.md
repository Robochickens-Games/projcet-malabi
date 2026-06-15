# Brachio Run — low-poly endless-runner prototype

A lane-based endless runner for the **Brachiosaurus**, in the Subway-Surfers /
Temple-Run mould — but the twist plays to the animal: the sauropod walks *across the
forest canopy*, **weaving its long neck between the treetops** to browse leaves &
berries at **head height** across three lanes, steering around boughs. **No jumping** —
the long neck doing the reaching is the whole point.

> **This is a mechanics test, not final art.** The whole thing is built from low-poly
> Three.js primitives on purpose — to validate how the runner *feels* (lane weaving,
> head-height browsing, spawn density, difficulty ramp) fast. The team's real art
> direction is painterly 2D illustration; this look is throwaway and would be
> re-skinned later.

## Run it

```bash
npm install
npm run dev        # vite dev server, --host for phone testing on your LAN
```

Then open the printed URL. `npm run build && npm run preview` checks the portable
static build.

## Controls

| Action       | Desktop                     | Touch              |
| ------------ | --------------------------- | ------------------ |
| Weave lane   | `←` `→` or `A` `D`          | swipe left / right |
| Start / retry| `Space` / `↑` / `Enter`     | tap                |
| Restart/exit | `Esc`                       | —                  |

## How it works

Self-contained ES modules, one RAF loop, delta-time normalized:

- `config.js` — lanes, speeds, `HEAD_Y` (the browse height), colors. The world's
  forward axis is **-Z**; the dino stays at `z = 0` and the canopy scrolls toward the
  camera (+Z).
- `dino.js` — `createDino` from primitives (box torso, pillar legs, raised tapered
  neck, long tail), plus lane-lerp and a speed-scaled run cycle (no jump).
- `world.js` — scrolling green canopy path tiles + a recycling sea of treetop blobs
  with the odd taller emergent crown.
- `spawner.js` — pools boughs/foliage-knots (obstacles) and leaves/berries (food) into
  lanes, all at `HEAD_Y`; scrolls + recycles them and reports hits/pickups. An obstacle
  in your lane can only be avoided by switching lanes. Difficulty (row gap + obstacle
  count) scales with speed, and never blocks all three lanes.
- `game.js` — state machine (`ready → play → over`), lives, score, combo multiplier,
  distance, leaf meter, i-frames after a hit, and tiny Web-Audio blips.
- `hud.js` — `createHud(root)` builds its own scoped DOM (lives, leaf meter, score,
  distance, modals) + CSS inside any container. DOM, not canvas, so it's easy to restyle.
- `runner.js` — **`mountBrachioRunner(container, { onExit })`**, the single reusable
  entry: builds the renderer/scene/lights/camera, wires input + pickup-pop particles,
  runs the loop, and returns `{ dispose() }`. Used by both consumers below.
- `main.js` — thin standalone bootstrap: `mountBrachioRunner(document.getElementById('app'))`.

Hitting a bough costs a life with a brief invulnerability blink (no hard stop on a
single hit) — your only defence is weaving to a clear lane in time. Out of lives →
game over → tap to run again. Best score persists in `localStorage`.

## Wired into the museum prototype

This runner is **also playable inside `../museum-parallax`** — there's a glowing
**"BRACHIO RUN — tap to play ▸"** placard on the open plain of the Brachiosaurus
room. Tapping it opens the runner as a full-screen overlay (close with the
"‹ Back to the trail" button or `Esc`), mirroring how the Fish Run placard opens
`pteroGame.js`.

No code is duplicated — `museum-parallax/src/brachioGame.js` imports
`mountBrachioRunner` from this folder's `src/runner.js` (single source of truth).
That cross-folder reuse is made to resolve in dev and in the production build by two
lines in `museum-parallax/vite.config.js`: a `three` alias (so bare `three` imports —
including the ones in this prototype's files — resolve to museum-parallax's copy) and
`server.fs.allow` (so the dev server may read this sibling folder). museum-parallax
therefore lists `three` as a dependency; you do **not** need to `npm install` this
folder separately for the museum build to work.

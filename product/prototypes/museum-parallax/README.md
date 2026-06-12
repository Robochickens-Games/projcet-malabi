# Museum Parallax — playable prototype (wireframe / blockout)

First playable slice of **Science Museum Mystery**, in the format the game will
use: a **wide, continuous side-scrolling world with platformer parallax** —
layers scroll at different speeds as you walk. Art is intentionally low-fi
wireframe (outlines + labels on ink); real painted layers replace it 1:1 later.

## Run it

```bash
npm install
npm run dev
```

Open the printed URL (works on a phone over the same Wi-Fi).

## The slice

1. **Lobby** (2880px world) — walk right past three wing doors. A fossil tooth
   hides behind the PLANTER on a *slower* layer than the planter: walking past
   reveals it. Tap it → collection slot.
2. **Dinosaur Wing → Nesting Grove** (3840px world) — a jungle trail. Layer
   stack: clouds+sun 0.1× · mountains 0.3× · treeline 0.5× · trail+scene 1.0× ·
   canopy/bush foreground 1.42×. Each wireframe layer carries its speed tag.
3. Arrive at the **skeleton + field guide**: four tooth-type cards
   (carnivore / piscivore / insectivore / herbivore). Wrong picks shake and
   teach; **broad & flat → herbivore** glows the skeleton (Triceratops) and
   awards Fossil Fragment 1/4.

**Controls:** drag / fling, scroll wheel, arrow keys (with acceleration), or
device tilt. BAG opens the dino field-notes; HINT nudges.

**Mobile:** the game is landscape — phones held in portrait get a
rotate-your-phone overlay. The ⛶ HUD button enters fullscreen and (on Android)
locks landscape. iPhone Safari has no fullscreen API, so the button hides
there; "Add to Home Screen" gives true fullscreen instead.

## Structure (for the art handoff)

- `src/wireframe.js` — all blockout art + the world layout constants
  (`LOBBY_SPOTS`, `GROVE_SPOTS`, `GUIDE`). Drawings and hotspots share these,
  so repositioning is one edit. Replacing a wireframe layer = swapping the SVG
  string for a painted texture of the same world width.
- `src/main.js` — camera/scroll engine, input, game flow. Scene = a world width
  + layers with `_speed`; nothing else is scene-specific.
- `scripts/generate-assets.mjs` — the painted-asset slicing pipeline from the
  earlier art experiment (cuts concept paintings into parallax layers with
  feathered masks + inpainted base). Re-use it when real art lands
  (`public/img/` output is gitignored; needs `npm i -D playwright-core` + Chrome).

## Notes

- No top-level `await` in the entry: it deadlocks pixi's dynamically-imported
  renderer chunks in the Rollup build (dev mode masks it). Boot via `boot()`.
- Science note: herbivore copy says **ferns and leaves**, not grass — grass
  barely existed in the dinosaurs' era. Vet final copy with the
  `paleontologist` skill.

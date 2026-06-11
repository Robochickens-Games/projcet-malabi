# Asset board — art handoff

`asset-board.svg` is the single master vector file for replacing the prototype's
blockout shapes with real painted art. **It's generated, not hand-drawn** — run
`node scripts/build-asset-board.mjs` from the prototype root to rebuild it
straight from the live layout code (`src/wireframe.js` + `src/art.js`), so every
frame stays exactly the size the engine expects.

## How to use it

1. **Open** `asset-board.svg` in Figma (drag the file onto the canvas, or
   File → Place/Import), Illustrator, or Affinity Designer. Each frame imports as
   its own named layer/group (`lobby-back`, `grove-main`, `tooth-leaf-herbivore`…).
2. **Trace / paint over** each blockout frame, keeping to its bounding box. The
   blockout geometry is the under-drawing — match the placement, then paint to the
   fidelity shown in the **PAINTED DIRECTION** section at the bottom (the captured
   Art-Deco target: amber/gold + deep teal, see `brain/memory/shared/art-direction`).
3. **Export each layer 1:1** at the dimensions printed in its frame label, as a
   PNG (transparent where it should be) into `public/img/<id>.png`.
4. **Swap it in** — replacing a wireframe layer = handing the engine a painted
   texture of the same world width. `scripts/generate-assets.mjs` is the existing
   slicing pipeline for cutting full concept paintings into these layers.

## What's in the file

**Blockout (paint over these — this is what ships now):**

| Section | Frame | Export size | Parallax |
|---|---|---|---|
| Lobby | `lobby-back` | 2200×1080 | 0.25× |
| | `lobby-main` | 2880×1080 | 1.0× |
| | `lobby-fore` | 3300×1080 | 1.4× |
| Grove | `grove-clouds` | 2150×1080 | 0.1× |
| | `grove-mountains` | 2520×1080 | 0.3× |
| | `grove-treeline` | 2900×1080 | 0.5× |
| | `grove-main` | 3840×1080 | 1.0× |
| | `grove-canopy` / `grove-bush` | sprites | 1.42× (tiled) |

**Prop library:** `tooth-floor-clue` + the four field-guide teeth
(`tooth-leaf-herbivore` is the correct match) · dino skeleton mounts
`skeleton-trike` / `skeleton-allo` / `skeleton-spino` (700×520, facing left).

**Painted-direction reference (don't ship — match the mood):** finished
Art-Deco lobby + teal dino-hall layers, the three dioramas, and the catalog cards.

## Rebuild

```bash
node scripts/build-asset-board.mjs   # -> assets/asset-board.svg
```

Re-run it whenever the world layout in `src/wireframe.js` changes, so the handoff
frames never drift from the live geometry.

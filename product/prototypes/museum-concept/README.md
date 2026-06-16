# Museum Concept Test — asset-driven parallax

A second concept test for **Science Museum Mystery**, sibling to
[`../museum-parallax`](../museum-parallax). Same feel — a wide, scrollable,
clickable parallax world — but built to **drop real art into**: every layer and
hotspot is declared in one config file, and anything you haven't dropped yet
shows as a labelled placeholder telling you exactly where the file goes. So it
runs immediately, empty, and fills in as art arrives.

Lightweight vanilla JS + CSS + Vite. No game engine, no build to understand —
just edit a config and drop PNGs.

## Run it (local only — not deployed)

```bash
npm install
npm run dev
```

Opens the printed URL. Walk right: **drag / fling, scroll wheel, or ← → keys**.
Tap any glowing dashed marker — those are the clickable hotspots.

## Where things go

```
public/assets/
  backgrounds/<scene>/   parallax layer images (one per layer, back→front)
  props/                 art for individual clickable objects
  ui/                    HUD / button / frame art
  audio/                 sounds (optional, not wired yet)
src/
  config.js   ← EDIT THIS: scenes, layers, hotspots, actions
  engine.js      runtime (parallax, input, hotspots, placeholders) — rarely touched
  style.css      UI chrome + layer/hotspot look
```

Each `assets/` subfolder has its own README with naming + sizing rules.

## Building out the concept — the 3 moves

1. **Add a parallax layer** → drop `public/assets/backgrounds/<scene>/<file>.png`
   (author at `sceneWidth × 1080`) and add an entry to that scene's `layers` in
   `config.js` with a `speed` (0 = pinned, 1 = walks with you, >1 = foreground).
2. **Add a clickable** → add a `hotspots` entry with an `x,y,w,h` rect and an
   `action` (`goto` a scene / `collect` an item / `toast` a message / `link`).
   Optionally give it `art:` from `props/`.
3. **Add a scene** → add a key to `SCENES`, set its `width`, list `layers` and
   `hotspots`, and point a hotspot's `goto` action at it.

No art yet? It still runs — placeholders show every layer's drop-path and every
hotspot's hit-area, so you can test flow and pacing before a single asset lands.

## Edit mode — drag props, set depth, export config

Click the **✎** button (top-right) or press **E** to toggle edit mode. Then:

- **Click a prop** to select it (or pick it from the panel's dropdown — that also
  scrolls it into view).
- **Drag** it to move, or use **arrow keys** for fine nudges (**Shift** = ×10).
- The panel gives full control: **X / Y**, **Size**, **Depth** (the parallax
  speed — 0 = pinned far back, 1 = walk plane, >1 = foreground), **Flip**, and
  **Z-order** (send back / bring forward). Drag the panel's header to move it
  out of the way.

**Your changes save automatically.** Every edit is written to `.layout.json`
(via the dev server) and reloaded on boot, so your layout survives refreshes —
there's also a **💾 Save** button. `.layout.json` is git-ignored and *overrides*
`config.js` while it exists.

To **commit** a layout to source: hit **⧉ Copy config**, paste the block over
that scene's `layers` in `src/config.js`, then delete `.layout.json`.

## Relationship to the other prototype

`museum-parallax` is the wireframe-blockout playable (procedural SVG art, baked
scenario). **This one** trades the baked art for a clean asset pipeline — the
place to try painted directions and new scene ideas without touching engine code.

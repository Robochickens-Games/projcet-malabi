# backgrounds/ — parallax layer art

One folder per scene (`lobby/`, `grove/`, …). Inside, one image per layer,
named in back→front order. The filenames here must match the `src` paths in
[`src/config.js`](../../../src/config.js).

**Author each layer at `sceneWidth × 1080`** (e.g. lobby = 2880×1080). PNG with
transparency for everything except the farthest layer; that one can be an opaque
JPG/PNG. Slow "sky" layers can be a seamless tile — set `fit: 'tile'` on the
layer in config and the engine repeats it horizontally.

Until you drop a file, that layer renders as a dashed placeholder showing the
exact path it wants — so the prototype always runs.

## Two kinds of layer

- **BAND** — a full-width background image (`fit: 'cover'` default, or `'tile'`).
  Author at `sceneWidth × 1080`. This is the hall / sky / floor.
- **PROP** — a cut-out (transparent PNG) placed at a world position. In config
  give it an `x` (world centre), `h` (height in design px), optional `y`
  (baseline, default = floor). Put it on a faster `speed` than the background so
  it slides past as you walk. Author tall, portrait, alpha-trimmed.

## Current files (see config)

```
lobby/hall.png       BAND  speed 1.0   ← the grand-hall painting (2912×416, the world)
lobby/signpost.png   PROP  speed 1.12  x 2700
lobby/column.png     PROP  speed 1.28  x 900
lobby/pot.png        PROP  speed 1.42  x 5400

grove/gallery.png    BAND  speed 1.0   ← dino-gallery panorama (2912×416, the world)
props/skeleton.png   PROP  speed 1.0   x 3300  ← Triceratops main display (hero exhibit)
props/fern-*.png     PROP  speed ~1.5  front layer — foreground ferns sweeping past
```

Clue items go in as PROP layers + hotspots just to the RIGHT of the display
(around world x 4300+).

Drop more lobby props by adding a PROP layer to `lobby.layers` in config and an
image here — no engine changes needed.

# Malabi Asset Pipeline

Manifest-driven, **style-consistent** AI generation of **transparent PNG** assets
for *Science Museum Mystery*. The control surface is two files; the engine is
swappable.

```
style.yaml      ← LOCKED style DNA, shared by every asset (the consistency contract)
assets.yaml     ← the work-list: one line per asset. Grow the game by growing this.
scripts/        ← postprocess.mjs (raw → clean transparent) + image utilities
out/raw/        ← generated candidates (gitignored)
out/final/      ← chosen, clean transparent PNGs (committed — these are the product)
```

**Why this shape:** assets are treated like code — declared, version-tracked.
Consistency lives in `style.yaml`, not in a person remembering the prompt. The
manifest and post-processing are engine-agnostic, so the generator behind them is
swappable.

This is the *upstream* of the prototype's `generate-assets.mjs` slicer: this
**creates** isolated transparent sprites; the slicer **cuts painted scenes** into
parallax layers.

> **No generator is wired up right now.** The original local engine (ComfyUI +
> SDXL/ControlNet/IP-Adapter models, ~22 GB) was removed — too heavy, too much
> disk, and off-target results. The manifest (`assets.yaml`), the style contract
> (`style.yaml`), the post-processing scripts, and the committed product in
> `out/final/` all remain. To resume generation, plug a generator into a new
> `scripts/generate.mjs` (see **Adding a generator** below).

---

## Setup

```bash
cd product/asset-pipeline
npm install            # yaml, sharp, @imgly/background-removal-node
```

## Post-process existing/raw candidates

The post-processing step is engine-independent — it turns any raw PNG into a
clean, tightly-trimmed transparent sprite:

```bash
npm run postprocess               # strips bg → alpha, trims tight
```
→ clean PNGs in `out/final/<wing>/<id>-vN.png`. **Pick the winning variant per
asset** and copy it into the game.

The remaining `scripts/*.mjs` (chroma-key, cut-by-mask, key-magenta, pixelate,
verify-cutout, render-control helpers) are standalone `sharp`-based image
utilities and do not depend on any generation engine.

---

## Adding a generator

Write `scripts/generate.mjs` that reads `assets.yaml` + `style.yaml` and writes
candidates to `out/raw/<wing>/<id>-vN.png`. Keep the manifest and `postprocess`
untouched. The recommended path is a paid hosted API:

- **OpenAI `gpt-image-1`** — `background:transparent`, `output_format:png`,
  ~$0.02–0.19/image. No local models, no GPU.

Derive each asset's seed from its id for reproducibility. **Flag the spend per the
team budget constraint before wiring up a paid engine.**

## Consistency: the three levels

1. **Locked prompt + seed:** `style.yaml` prefix/suffix + per-id seed. Baseline.
2. **Style reference:** feed the per-wing `stylerefs` panorama as a style anchor
   (most hosted APIs support a reference/edit input).
3. **Style fine-tune:** once ~20 final assets exist, fine-tune on them for true
   one-artist coherence at scale. *Do this after first output, not now.*

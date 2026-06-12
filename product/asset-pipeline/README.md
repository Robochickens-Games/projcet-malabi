# Malabi Asset Pipeline

Manifest-driven, **style-consistent** AI generation of **transparent PNG** assets
for *Science Museum Mystery*. The control surface is two files; the engine is
swappable.

```
style.yaml      ← LOCKED style DNA, shared by every asset (the consistency contract)
assets.yaml     ← the work-list: one line per asset. Grow the game by growing this.
workflows/      ← the ComfyUI node graph (transparent-painterly.json)
scripts/        ← generate.mjs (manifest → ComfyUI → raw PNG) · postprocess.mjs (→ transparent)
out/raw/        ← generated candidates (gitignored)
out/final/      ← chosen, clean transparent PNGs (committed — these are the product)
```

**Why this shape:** assets are treated like code — declared, generated
deterministically (seed derived from id), version-tracked. Consistency lives in
`style.yaml`, not in a person remembering the prompt. Engine lives behind
`generate.mjs`, so you can swap ComfyUI ↔ a paid API without touching the manifest.

This is the *upstream* of the prototype's `generate-assets.mjs` slicer: this
**creates** isolated transparent sprites; the slicer **cuts painted scenes** into
parallax layers.

---

## Setup (one time, ~1 day incl. downloads)

### 1. This pipeline's deps
```bash
cd product/asset-pipeline
npm install            # yaml, sharp, @imgly/background-removal-node
```

### 2. ComfyUI (the free local engine — runs on Apple Silicon)
```bash
# anywhere outside this repo, e.g. ~/tools
git clone https://github.com/comfyanonymous/ComfyUI
cd ComfyUI
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

### 3. The model (~6.5 GB, free)
Download **SDXL base 1.0** into `ComfyUI/models/checkpoints/`:
- https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0 → `sd_xl_base_1.0.safetensors`

(The filename in `workflows/transparent-painterly.json` must match.)

### 4. Run the ComfyUI server
```bash
cd ComfyUI && source venv/bin/activate
python main.py            # serves http://127.0.0.1:8188  — leave it running
```
On Apple Silicon it auto-uses MPS (the GPU). First run is slow; later runs cache.

---

## Generate

With the ComfyUI server running, in another terminal:
```bash
cd product/asset-pipeline
npm run generate                  # every asset in assets.yaml (3 candidates each)
npm run generate clue-tooth       # just one id
node scripts/generate.mjs --wing dinosaurs
```
→ candidates land in `out/raw/<wing>/<id>-vN.png`.

## Make them transparent
```bash
npm run postprocess               # strips bg → alpha, trims tight
```
→ clean PNGs in `out/final/<wing>/<id>-vN.png`. **Pick the winning variant per
asset** and copy it into the game.

---

## Consistency: the three levels

1. **Now (locked prompt + seed):** `style.yaml` prefix/suffix + per-id seed. Baseline.
2. **Better (style reference):** add an IP-Adapter node fed your concept art —
   every generation inherits the painting's DNA.
3. **Best (style LoRA):** once ~20 final assets exist, train a LoRA on them
   (free, local, `kohya_ss`) and reference it in the workflow. True
   one-artist coherence at scale. *Do this after first output, not now.*

## Transparency upgrade (optional)
Day 1 uses background removal in postprocess. For **native alpha**, add
[LayerDiffuse](https://github.com/huchenlei/ComfyUI-layerdiffuse) nodes to the
workflow and set `transparency.native: true` in `style.yaml`.

## Swapping to a paid engine
Set `style.yaml engine: openai` and point `generate.mjs` at `gpt-image-1`
(`background:transparent`, `output_format:png`). ~$0.02–0.19/image. The manifest
and postprocess stay identical. Flag the spend per the team budget constraint first.

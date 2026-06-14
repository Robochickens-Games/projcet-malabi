---
name: 0004-drop-local-comfyui-engine
description: Drop the local ComfyUI + SDXL engine for asset generation; keep the manifest/post-process/product and move to a paid hosted API when generation resumes
owner: dor
status: accepted
created: 2026-06-14
supersedes: -
tags: [decision, design, tooling, assets]
---

# 0004. Drop the local ComfyUI engine for asset generation

## Status
Accepted — 2026-06-14

## Context
[[asset-generation-pipeline]] proposed a manifest-driven asset pipeline with a
**free local ComfyUI + SDXL** engine as the recommended path (aligning with
[[budget-constraint]]'s $0 primary). We built it and ran it for real.

In practice the local engine was a poor trade: the install plus models
(SDXL/Juggernaut checkpoints, ControlNet, CLIP-vision, IP-Adapter, LayerDiffuse)
ran to **~22 GB of disk**, was heavy to run, and — most importantly — **did not
produce on-style results good enough** for the art bar the [[north-star]] demands.
The "$0" path cost a lot in disk, setup, and iteration time while missing on the
one thing that matters (quality).

## Decision
**Remove the local ComfyUI engine entirely** — from the machine (~22 GB of
ComfyUI installs + models freed) and from the repo (`workflows/` node graphs and
`scripts/generate.mjs` deleted; per-asset `workflow:` keys and the `host:`/engine
config stripped from the manifest and `style.yaml`).

**Keep everything engine-agnostic:** `assets.yaml` (the work-list), `style.yaml`
(the style contract), the `sharp`-based post-processing/cutout scripts, and the
committed product in `out/final/` + `demo/`. No generator is wired up right now.

When generation resumes, **plug in a paid hosted API** (e.g. OpenAI
`gpt-image-1`, transparent PNG, ~$0.02–0.19/image) behind a new
`scripts/generate.mjs`. No local models, no GPU.

## Consequences
- **Money/north-star:** trades [[budget-constraint]]'s $0-primary for a small
  per-image API spend in exchange for quality and velocity. The spend is metered
  and should be flagged per the team budget constraint before wiring up. Net: we
  optimize for the art bar (downloads/quality) over a $0 path that wasn't meeting it.
- Frees ~22 GB of disk and removes a heavy local runtime/setup burden.
- The pipeline's value (manifest-as-code, locked style, deterministic seeds,
  engine-swappability) is preserved; only the engine changed — exactly the
  swap the original design anticipated.
- Re-introducing local generation later is still possible but would be a new ADR.

## Alternatives considered
- **Keep ComfyUI, tune harder** (better checkpoints/LoRA/workflows): rejected —
  open-ended time sink with no guarantee of clearing the quality bar, while the
  disk/runtime cost stays.
- **Midjourney `--sref`** (~$10/mo): viable paid path; deferred in favor of a
  per-image API that needs no subscription and plugs straight into the manifest.
- **Keep the local install dormant**: rejected — 22 GB for an engine we've
  decided against is exactly the waste this decision removes.

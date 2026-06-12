---
name: asset-generation-pipeline
description: A manifest-driven, style-consistent AI pipeline that generates transparent-PNG game assets at scale; free local engine (ComfyUI) primary, paid API as escape hatch
owner: dor
status: under-review
area: design
created: 2026-06-12
reviewers: [gidi, ohad]
---

# Asset generation pipeline

**Context:** We need many on-style assets for *Science Museum Mystery* — clues,
collectibles, props, characters across the three wings. Doing them by hand or
ad-hoc-prompting won't stay consistent or scale. Serves [[north-star]] (an
Apple-feature-worthy art bar drives downloads = money; a rich, tappable world =
fun) and respects [[budget-constraint]] (primary path is $0). Builds on
[[art-direction]] and complements the prototype's `generate-assets.mjs` *slicer*
(this is the upstream piece that **creates** isolated transparent sprites; the
slicer **cuts** painted scenes into parallax layers).

## The idea — treat assets like code
A **manifest-driven pipeline**: declare each asset in a file, generate
deterministically, version-track the output. Control + scale + consistency come
from the manifest, not from a person remembering the prompt.

```
style.yaml   ← LOCKED style DNA, shared by every asset (the consistency contract)
assets.yaml  ← work-list, one line per asset (grow the game = grow this file)
generate.mjs → ComfyUI → raw candidates → postprocess.mjs → transparent PNG
```

Built and ready to try in `product/asset-pipeline/`.

## The three requirements, solved
- **Transparent PNG:** day-1 via background removal (rembg/@imgly) in
  post-process; upgrade to native alpha with LayerDiffuse nodes later.
- **Style consistency:** locked `style.yaml` prefix/suffix + per-id deterministic
  seed now → IP-Adapter style-reference next → **trained style LoRA** once ~20
  finals exist (the real one-artist-at-scale win).
- **Controlled + scale:** git-tracked manifest, idempotent reruns, batch by id/wing.

## Engine — the tradeoff to decide
| Path | Consistency | Cost | Setup |
|---|---|---|---|
| **ComfyUI + SDXL + LoRA** (local) — *recommended* | ★★★ | **$0** | ~1 day |
| Midjourney `--sref` | ★★★ | ~$10/mo | ~30 min |
| OpenAI `gpt-image-1` | ★★ | ~$0.02–0.19/img | minutes |

Recommendation: build on **free local ComfyUI** (aligns with [[budget-constraint]]);
keep Midjourney `--sref` as the cheapest paid escape hatch if setup friction
blocks velocity. The manifest/postprocess are engine-agnostic, so swapping is free.

## Open question for reviewers
Accept free-local ComfyUI as the path, or spend ~$10/mo on Midjourney to skip the
~1-day setup? (Gidi: product velocity vs. cost. Ohad: any infra/runtime concerns.)

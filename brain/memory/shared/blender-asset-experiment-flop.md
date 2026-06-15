---
name: blender-asset-experiment-flop
description: "Flop watch: Dor tried to auto-generate game assets straight from Blender — the first Triceratops came out a pink-balloon blob up front and a hornless aardvark in profile. Filed as a cheerful failure, lessons logged."
owner: dor
scope: shared
created: 2026-06-15
updated: 2026-06-15
image: brain/images/blender-triceratops-flop.png
tags: [dispatch, flop, assets, blender, pipeline, experiment, lessons-learned]
---

# 🗞️ FLOP WATCH: The Blender-Bot Builds a Triceratops, Gets a Balloon Animal

**MALABI HQ, June 15** — In the ongoing hunt for an **asset pipeline that doesn't
cost money** (see [[budget-constraint]]), Dor pointed Blender at a simple brief —
*"make me a Triceratops"* — and hit render. The machine obliged. The result did not.

**Head-on,** our would-be tyrant of the Cretaceous is a **pink party balloon** with
two confused horns poking out and a tiny snout. **In profile,** it's a serene
**hornless aardvark** that wandered in from a different museum entirely. Two views,
two different animals, zero Triceratopses.

It's a flop — and a *good* one. We document those.

## What was tried

A first stab at **auto-generating 3D game assets directly from Blender** (geometry
+ a quick clay render, two camera angles) instead of hand-modeling or paying a
hosted image API. The dream: type a creature, get a usable model. This run produced
`triceratops.blend` plus front/side renders in `product/assets/blender/`.

## Why it flopped

- **No anatomy reference fed in.** The generator guessed silhouette from the name
  alone — so the frill became a sphere and the body a featureless bean.
- **Front and side don't agree.** The two renders describe different creatures,
  which means there's no coherent 3D form underneath — a non-starter for a real asset.
- **Off our bar.** It badly misses both [[art-direction]] (warm, painterly museum)
  and [[scientific-realism-rule]] / [[dino-accuracy-rulings]] (a Triceratops has
  three horns and a *scaly*, real silhouette — not a balloon).

## Why we're keeping it

The team's standing pattern is to **document failures cheerfully** — the Great
Monkey Incident ([[daily-dispatch-2026-06-12]]) is the precedent. A logged flop is
a saved hour for the next person who reaches for "just let Blender do it."

## Lessons logged

- **Reference-in or it's noise.** Procedural/auto geometry needs real anatomy
  guidance (silhouette, proportions, horn/frill placement) before it's worth a render.
- **Multi-view consistency is the bar.** If front and side disagree, there's no
  asset — only two unrelated pictures.
- This nudges us back toward the decided direction: the **manifest-driven pipeline
  with a paid hosted image API** is still the path (see
  [0004](../../decisions/0004-drop-local-comfyui-engine.md)); free-local-Blender
  joins free-local-ComfyUI on the "tried it, off-target" shelf.

**Verdict:** 🎈 *Adorable. Not a Triceratops.* Filed, laughed at, moved on.

---

### The evidence

Front view — the balloon:

![Blender auto-Triceratops, front view: a pink balloon body with two small horns](../../images/blender-triceratops-front.png)

Side view — the aardvark:

![Blender auto-Triceratops, side view: a smooth hornless body like an aardvark](../../images/blender-triceratops-side.png)

Source files: `product/assets/blender/triceratops.blend` + `triceratops_front.png` /
`triceratops_side.png`.

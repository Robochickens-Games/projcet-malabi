---
name: art-scientific-realism
description: All game imagery must depict real, scientifically accurate subjects — actual spacecraft, real devices, true-to-science specimens; painterly style stays, but no toy/fantasy/made-up objects
owner: dor
scope: shared
created: 2026-06-12
tags: [design, art, science-accuracy, asset-pipeline]
---

# Art rule — every subject must be real and scientific

All generated/illustrated game imagery must show **real, scientifically accurate
things**: actual named spacecraft (e.g. Saturn V, Mercury-Redstone, Apollo lunar
samples), real historical devices and instruments, true-to-science specimens.
The painterly *rendering style* ([[art-direction]]) is unchanged — what's
*depicted* must exist or have existed. No toy rockets, no steampunk fantasy
contraptions, no made-up sci-fi gadgets.

**Why:** this is a *science* museum game ([[game-concepts]]) — its educational
credibility is the product. Kids should walk away having seen the real thing,
the same way the dino content is held to paleontological accuracy
(the `paleontologist` skill). Stated by Dor, 2026-06-12.

**How to apply:**
- Asset generation: the rule is baked into `product/asset-pipeline/style.yaml`
  (style_prefix + negative) and noted atop `assets.yaml`; per-asset prompts name
  the real object and carry `negative_extra: steampunk, fantasy, sci-fi, toy…`.
- New assets/content: prompt with the actual artifact's name and reference
  features; when unsure an object is real/accurate, check before generating.
- Applies beyond the pipeline: copy, placards, and hand-made art too.

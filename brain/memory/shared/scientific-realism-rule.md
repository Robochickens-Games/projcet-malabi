---
name: scientific-realism-rule
description: All game imagery must depict real, scientifically accurate artifacts — actual spacecraft, real devices, true anatomy. Painterly style stays; subjects must be real.
owner: dor
scope: shared
created: 2026-06-12
tags: [art, design, science, accuracy, content-rule]
---

# Scientific realism rule

Every exhibit and asset in *Science Museum Mystery* must depict a **real,
scientifically accurate subject**: actual spacecraft (e.g., early NASA launch
vehicles, Apollo lunar samples), real historical devices and inventions, true
dinosaur anatomy. No fantasy props, no generic sci-fi, no whimsical inventions.

**Why:** it's a *science* museum — the game's credibility and educational value
(see [[0003-first-product-direction-science-games-for-kids]] and the
`paleontologist` skill) depend on exhibits being real. "Actually scientific" is
a core trust signal for parents.

**How to apply:**
- The painterly art *style* stays ([[art-direction]]); realism applies to the
  *subject*, not the rendering.
- Encoded in the asset pipeline: `product/asset-pipeline/style.yaml` carries the
  rule in `style_prefix` ("a real scientifically accurate museum exhibit") and
  bans fantasy/sci-fi/whimsical in the global negative prompt.
- When adding assets, name the real artifact in the prompt (e.g., "Apollo lunar
  sample", "early NASA launch vehicle") rather than a generic ("moon rock",
  "rocket").
- Fact-check content with the `paleontologist` skill (and equivalent rigor for
  space/inventions).

---
name: puzzle-brush-away-the-dust
description: Dino-section puzzle — find brush → find dusty block → brush to reveal an out-of-place ammonite that's also master-fossil fragment #1
owner: dor
status: under-review
area: design
created: 2026-06-11
reviewers: [gidi, ohad]
---

# Puzzle: "Brush Away the Dust" (dinosaur section)

**Context:** Part of the **Museum Exploration** game shape — kid lost in a natural
history museum, hub lobby → science wings, starts in the **dinosaur section**.
Exploration mechanic in the spirit of [[design-inspirations]] (Monkey Island /
Loom). Serves [[0003-first-product-direction-science-games-for-kids]] (dino launch
theme) and the [[north-star]] (fun discovery loop + a science hook that earns the
"actually scientific" credibility).

**The idea:** A two-beat hidden-object → tactile-reveal puzzle.
`find the brush` → `find the dusty block` → `swipe to brush away dust in layers`
→ reveal.

## Screen flow
1. **Find the brush** — inside a closed paleontologist's tool-kit on a roped-off
   worktable (with decoy tools: chisel, magnifier). Teaches "look around."
2. **Find the block** — a grey "doorstop" rock by the excavation pit that reads as
   scenery; it only starts sparkling with dust motes *after* the brush is in hand.
3. **Brush (the toy)** — swipe back-and-forth; dust clears in strokes with particles
   + a soft *shhk*; clears in **2 layers** (loose sand → packed grit) = sneaky
   "digging down through time."
4. **Reveal** — a coiled **ammonite** (a *sea* creature) emerges, half-embedded.

## Decisions baked in (Dor, 2026-06-11)
- **The reveal = out-of-place fossil + progress fragment.** The ammonite is both
  (a) Master Fossil Fragment #1 — collect ~4 across the section to unlock the exit
  (the section's spine), and (b) a mystery hook: "why is an ocean animal in the
  dinosaur hall?" Real answer (this ground was once seabed; rock layers = time)
  pays off at the section climax.
- **Difficulty = gentle nudges.** Each step has a fail-safe hint that fires only
  after a short struggle (kit glints; block sparkles post-brush; swipe-ghost after
  3s). Nothing gated behind reading — works for a 5-year-old, still rewards a 7yo.

## Protect these
- The brush **layers** are the magic — one-tap reveal kills it. Spend the
  art/animation budget on the brushing feel.
- Keep **decoy tools** (chisel, magnifier) in the kit — makes "find the brush" a
  real choice and seeds reusable verbs for later puzzles; the kit becomes the
  section's **tool shed**.

## Accuracy
Ammonite is a clean, true pick — abundant, instantly readable spiral, genuinely
found in marine rock now on dry land. Scientifically honest and iconic. Vet
further with the `paleontologist` skill before art.

## Open for team
- Does the "master fossil fragment" spine (hub-and-spoke: each wing = a science
  domain + a collectible) hold up across other sections, or is it dino-only?
- Is the seabed/geologic-time payoff the right climax for section 1, or too deep
  for the youngest target age?

Related: [[design-inspirations]], [[0003-first-product-direction-science-games-for-kids]],
[[aso-research-findings]], [[north-star]].

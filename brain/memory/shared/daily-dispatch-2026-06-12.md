---
name: daily-dispatch-2026-06-12
description: "Breaking: the museum got real — a full AI art pipeline built on a laptop, four painted wings, a playable lobby on Vercel, and the Great Monkey Incident"
owner: dor
scope: shared
created: 2026-06-12
image: brain/images/asset-pipeline-poc.png
tags: [dispatch, daily, prototype, asset-pipeline, ai-art, milestone]
---

# 🗞️ BREAKING: Local Laptop Paints Entire Museum; Monkeys Briefly Seize Newsroom

**MALABI HQ, June 12** — In a single marathon session, the museum went from
wireframe blockouts to a **fully painted, four-wing, parallax-scrolling
prototype** — every brushstroke generated on Dor's laptop, for the grand total
of **zero dollars**. Walk it yourself, right now:

## ▶ [malabi-museum-lobby.vercel.app](https://malabi-museum-lobby.vercel.app)

*(A separate prototype — the beloved wireframe slice lives on, untouched, at its
own address.)*

## How it works (the respectable part)

The team wired a **local AI art factory**: ComfyUI + Stable Diffusion XL running
on the Mac's own GPU. No cloud, no fees, no waiting in line. On top of it, a
pipeline that treats art like code:

- **`assets.yaml`** — a manifest. One line per asset. Add a line, get a sprite.
- **ControlNet** — the prototype's own wireframe vectors *steer* the
  generation, so the AI paints inside our layouts instead of freelancing.
- **IP-Adapter style anchors** — every asset is style-transferred from the
  team's concept paintings, so 100 assets look like one artist on a good day.
- **A gatekeeper script** that measures every cutout's transparency before it's
  allowed anywhere near the game. Trust, but verify pixels.

The lobby's doorways now show the actual wing behind them (with a parallax
peek as you walk past), a Mercury-era rocket towers over the space gallery,
a biplane hangs from the inventions ceiling, and the dinosaur wing has *living
dinosaurs in the mist behind the skeleton*. There's a minimap. There are dust
motes. We're told there's even an inventory.

## The Great Monkey Incident (the educational part)

At approximately mid-afternoon, every generated image began featuring **a
monkey**. Some also featured ships. An investigation revealed the style prompt
proudly declared our art "**Monkey-Island-adjacent**" — a reference to the
classic adventure game's *style*. The AI, which has never played it, simply
painted monkeys. On islands. The phrase has been removed; "monkey" now lives
permanently in the *negative* prompt, where it belongs.

Other casualties of the day, lovingly documented for posterity:

- **The Invisible Cut**: a one-line bug silently deleted the transparency off
  every sprite, turning the demo into a gallery of floating rectangles. The
  library applied "remove alpha" *after* "add alpha." Computers.
- **The Magenta Sky**: asking for objects "on a magenta background" produced
  landscapes with *magenta weather*. Purple mist everywhere. Very moody, very
  wrong.
- **Zombie batches**: three forgotten generation jobs kept painting with
  *outdated prompts* hours after being "stopped," re-introducing monkeys at
  random. All zombies have been put down. New rule: one batch at a time.
- **The Aqueduct**: a treeline drawn as neat scallops was interpreted by the
  AI as a Roman aqueduct. The mountains became pyramids. Geometry is a
  suggestion; the AI is a classicist.

## The new laws of the land

Two rules are now baked into the pipeline itself, not just into memory:

1. **Scientific realism** ([[scientific-realism-rule]]): every exhibit is a
   *real thing* — an Apollo lunar sample, a Mercury-Redstone booster, a
   Wright-era biplane. It's a science museum; the science is non-negotiable.
   (A beefier model, Juggernaut XL, was drafted for accurate hardware.)
2. **Style is anchored, never prompted**: words like "painterly" are wishes;
   a reference image is a contract. Every asset now copies its style from the
   team's own concept art ([[art-direction]]).

## The numbers

~60 generations, 5 model downloads (~18 GB), 4 painted wings, 3 zombie
processes, 2 pipeline laws, 1 monkey infestation — and **$0** spent.

The pipeline lives in `product/asset-pipeline/` ([[asset-generation-pipeline]]).
Tomorrow's problem: making the puzzles as good as the doors.

*— The Malabi Daily, "All the news that's fit to parallax"*

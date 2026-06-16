---
name: coach-rami-log
description: Coach Rami's learning log — the team's running record of lessons, each told as What happened / What was the mistake / What we'll do differently. Rendered as its own section in The Malabi Daily.
owner: team
scope: shared
created: 2026-06-16
updated: 2026-06-16
tags: [learnings, coach, lessons-learned, retro, process]
---

# 🧢 Coach Rami's Learning Log

This is where we track what we learn — out loud, in plain human language, no jargon.
Every entry is a short story with three beats:

- **What happened** — set the scene, what we were trying to do.
- **The mistake** — the honest bit. What went wrong and why.
- **What we'll do differently** — the takeaway we actually carry forward.

> **How to add one:** copy the template below, put the newest at the **top** of the log
> (right under this line). Keep it warm and human — Coach Rami talks like a teammate, not a
> compliance form. The Malabi Daily reads this file and prints each entry as a card under the
> **Coach Rami** section, newest first.
>
> ```
> ## YYYY-MM-DD — Short, plain-language title
> **What happened:** ...
> **The mistake:** ...
> **What we'll do differently:** ...
> ```

---

## 2026-06-16 — Midjourney paints lovely backdrops, then fumbles the actual scene

**What happened:** We've been leaning on Midjourney for art, and it's genuinely good at the
painterly, mood-setting stuff — backgrounds and atmosphere come out beautiful. But when we
needed a *specific, accurate* scene or subject, it kept drifting: pretty, but not the thing
we actually asked for.

**The mistake:** We treated one tool as if it were good at everything. Midjourney's strength
(vibe, backdrops) isn't the same as the thing we most need for our museum — subjects that are
*correct*, not just attractive. Stretching it past what it's good at gave us off-brief output.

**What we'll do differently:** Right tool for the right layer. Keep Midjourney for backgrounds
and ambience, and go find a better option for accurate assets — we're going to evaluate GPT
image generation (or another tool) for the precise, subject-correct pieces. The open question
was never the money; it's which tool actually hits the accuracy bar. See
[[midjourney-good-bg-not-scenes]].

## 2026-06-15 — We asked Blender to "make a Triceratops" and got a balloon animal

**What happened:** We're still hunting for an art pipeline that doesn't cost money, so Dor
pointed Blender at a one-line brief — "make me a Triceratops" — and hit render. Head-on it
came out a pink party balloon with two confused horns; in profile it was a serene, hornless
aardvark. Two views, two completely different animals, zero actual Triceratopses.

**The mistake:** We fed the machine a *name* and expected an *anatomy*. No reference went in —
no silhouette, no proportions, no horn or frill placement — so it guessed, and the front and
side views never agreed. When the two views disagree there's no real 3D form underneath, just
two unrelated pictures.

**What we'll do differently:** Reference-in or it's noise. Any auto/procedural geometry gets
real anatomy guidance before we bother rendering, and we treat multi-view consistency as the
bar — if front and side don't match, it's not an asset yet. For real assets we're back on the
manifest-driven, paid hosted-image pipeline. See [[blender-asset-experiment-flop]].

## 2026-06-12 — The Great Monkey Incident

**What happened:** While generating art we ended up with a confident, well-rendered monkey in
a game that is very much about dinosaurs. It was good art pointed at the wrong target.

**The mistake:** We let the generator run ahead of a tight brief, so "looks great" sailed right
past "is it the thing we actually need?" Polish on the wrong subject is wasted polish.

**What we'll do differently:** Brief first, render second — name the subject, the style, and the
accuracy bar up front, and sanity-check output against the brief before we fall in love with how
it looks. We keep filing these flops cheerfully; a logged failure is a saved hour for the next
person who reaches for "just let the machine do it." See [[daily-dispatch-2026-06-12]].

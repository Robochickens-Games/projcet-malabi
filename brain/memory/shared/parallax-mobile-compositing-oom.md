---
name: parallax-mobile-compositing-oom
description: DOM/CSS parallax prototypes silently crash on mobile Safari when every layer is a full-world composited surface — size layers to their content
owner: team
scope: shared
created: 2026-06-16
tags: [prototype, performance, mobile, parallax, bug]
---

The museum-concept parallax prototype crashed on mobile with **no JS error or
console log** — the tab just died ("A problem repeatedly occurred"). That
signature = the OS killing the tab for **memory**, not a code bug.

Root cause: in the parallax engine, *every* layer div was sized to the full
world (7560×1080) and given a per-frame `translate3d`, which promotes each to
its own GPU compositing layer. With ~15 prop layers + hotspot planes per scene,
that's ~600 MB of composited backing store (measured via CDP `LayerTree`, dpr 3).
Desktop Chrome tiles/survives it; mobile Safari's tight per-tab cap does not.

**Why:** only the BAND background genuinely spans the world. Prop layers hold a
single small cut-out; hotspot planes hold a few buttons. Each was needlessly a
7560×1080 ≈ 31 MB GPU surface.

**How to apply:** let content-only layers shrink-wrap their content (don't set
`width:7560px` on prop layers / hotspot planes) so each composited layer is
~1 MB instead of ~31 MB. Props are `position:absolute` at `left:worldX`, so the
layer origin (not its width) fixes placement — shrinking width doesn't move
anything. This cut backing store 605 MB → 87 MB (-86%) with zero visual change.

General rule for these web prototypes: **a silent mobile-only crash is almost
always a memory/compositing OOM** — count composited layers and their pixel
area before hunting for a JS bug. Reproduce with Playwright + an iPhone device
profile + CDP `LayerTree` (Chrome won't crash, but the layer sizes expose it).

Related: [[mobile-shipping-webview-wrap]], [[prototype-game-ui-3d]].

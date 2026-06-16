---
name: gameplay-principles
description: Core gameplay principles we design toward — keep the exploration loop engaging (esp. kids on touch)
owner: team
scope: shared
created: 2026-06-11
tags: [design, gameplay, principles, engagement, product]
---

# Gameplay principles we want to include

Design constraints for whatever ships under
[[0003-first-product-direction-science-games-for-kids]]. Promoted from the
mitigations in [[click-to-play-engagement-concern]] (Dor, 2026-06-11): the
click-to-play exploration loop only engages if these hold. Treat them as
non-negotiable design checks, not nice-to-haves.

1. **Every tap rewards — make the whole world pokeable.** No empty taps. Every
   object gives back juice (animation + sound + a small reveal), and we make
   *most* things look tappable. This holds **even off the critical path** — décor,
   background creatures, menu buttons, the title/loading screens, the settings
   cog. The ambient stuff counts double: rewarding curiosity on things that don't
   matter is what makes the world feel alive and teaches kids that touching is
   always safe and always rewarded. Cheap juice (a ~200ms tween + one-shot sound),
   not new systems; never punish the poke. See the mobile-game-builder skill's
   "make everything reactive" cross-cutting rule.

2. **A steady drip of "aha."** Pace discovery as many small reveals, not one big
   gated puzzle. The player should always be moments away from the next little win.

3. **Tappable is obvious.** On touch there's no hover — signal what's interactive
   with subtle affordances (shimmer/wiggle), without devolving into
   tap-everything noise.

4. **No dead ends, no fail states.** Progress is always possible. No puzzle
   walls, no "guess the pixel," no losing. Kids quit at friction; remove it.

5. **A collection / progression layer.** A visible goal on top of exploration —
   fill a museum, a fossil-dex, a sticker book. Drives retention and is the
   monetization hook; maps naturally onto dinosaurs.

6. **Soft guidance when idle.** A character or glow gently nudges if the player
   stalls — keep momentum without removing the joy of figuring it out.

**Why:** engagement → retention → the "make money" half of the [[north-star]];
the exploration soul comes from [[design-inspirations]].

**How to apply:** review every scene/feature against these six before it's
considered done. De-risk the core loop with a tiny fully-reactive prototype (one
dino dig site) before building wide — fits [[budget-constraint]].

See [[click-to-play-engagement-concern]], [[design-inspirations]], [[north-star]].

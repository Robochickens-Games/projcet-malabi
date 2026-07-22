---
name: space-wing
description: The Space Wing — second museum wing, fully spec'd (8-page comic) by Gidi; plan ready to build as a wireframe slice. Gidi approved; awaiting Dor's design sign-off to execute.
owner: gidi
scope: project
project: science-museum-mystery
created: 2026-06-16
image: brain/images/space-wing/page-1.jpg
tags: [product, space, wing, spec, prototype, plan, economy]
---

# Space Wing — spec + build plan (ready to execute)

The **second wing** of [[game-concepts]] (Science Museum Mystery). Same core loop as
the Dinosaur Wing ([[prototype-parallax-first-slice]]) — **fix/restore 5 dioramas to
progress** — but a different feel, and it introduces **three systems the dino wing never
had**. Gidi delivered the full design as an 8-page comic spec.

## The spec (8 pages, by Gidi)

1. **The Space Wing** — enter the dim Space Wing; 5 dioramas (Solar System, Mars, Moon
   Missions, Space Station, James Webb), each broken. Mission: restore all 5. Star Atlas
   catalog + inventory introduced; a **Space Supply Desk** and **Lost Astronaut Kiosk**
   appear.
2. **Space Supply Desk** — the economy hub. Find **space rocks** in the lobby + every
   room; each rock has a type and value (Star Shard 10, Mars Rock 7, Lunar Chip 6,
   Meteorite 9, Stardust Cluster 12 coins). Trade rocks for coins → buy tools (Planet
   Model 20, Solar Brush 16, Moon Mission Card 18, Rotate Key 14, Mirror Part — later).
3. **Solar System — Planet Path Puzzle** — place planets on correct orbit rings using
   Star Atlas clues (red planet is fourth; ringed giant is sixth; hottest planet isn't
   closest to the Sun). Planets are scattered: some in other dioramas, one **bought** at
   the desk, one **won** from the **Orbit Balance** tilt mini-game.
4. **Mars — Rover Repair** — find the missing rover wheel (in another diorama), buy a
   **Solar Brush** to clean the dust-covered panel (Star Atlas clue), repair the rover,
   then plan a safe route + scan the correct rock by matching its catalog traits
   (reddish/rusty = iron-rich red rock).
5. **Moon Missions — Rebuild the Landing Sequence** — collect 9 mission-sequence cards
   (in room, traded at desk, won from **Build-a-Rocket** mini-game); the diorama's
   **color-light cycle is the order clue**; arrange the cards in the correct sequence.
6. **Space Station — Fix the Airlock** — find the **oxygen hose** (in the Moon diorama)
   to reconnect the tether, use the **Rotate Key** (from the desk) to turn the solar
   panels to the Sun and restore power, then a **Spacewalk Drift** mini-game to reach the
   airlock (3/3 tools).
7. **James Webb — Align the Golden Mirrors** — gather a mirror support strut (another
   diorama) + a precision actuator (desk), **rotate the hex mirror tiles** to align edges,
   then **adjust focus** until the galaxy sharpens; the universe opens up.
8. **The Space Wing Restored** — all 5 checked off, catalog complete, Space Explorer
   Token awarded, doorway to the next wing. Reinforces the loop: Explore → Collect Rocks
   → Trade for Tools → Solve Mini-Games → Restore Dioramas → Unlock the Next Wing.

### The full comic spec (Gidi, 8 pages)

![Space Wing — Page 1: The Space Wing](../../../images/space-wing/page-1.jpg)
![Space Wing — Page 2: Space Supply Desk](../../../images/space-wing/page-2.jpg)
![Space Wing — Page 3: Solar System — The Planet Path Puzzle](../../../images/space-wing/page-3.jpg)
![Space Wing — Page 4: Mars — Rover Repair Mission](../../../images/space-wing/page-4.jpg)
![Space Wing — Page 5: Moon Missions — Rebuild the Landing Sequence](../../../images/space-wing/page-5.jpg)
![Space Wing — Page 6: Space Station — Fix the Airlock](../../../images/space-wing/page-6.jpg)
![Space Wing — Page 7: James Webb — Align the Golden Mirrors](../../../images/space-wing/page-7.jpg)
![Space Wing — Page 8: The Space Wing Restored](../../../images/space-wing/page-8.jpg)

## Three net-new systems (vs. the dino wing)

1. **Economy** — Space Supply Desk / Lost Astronaut Kiosk: find rocks → sell for coins →
   buy items needed to finish dioramas. Coins + a "Space Rocks" catalog index are new.
2. **Cross-room item dependencies** — items needed in one diorama are hidden in *others*,
   so exploration across rooms gates completion (no room solvable on first visit; no
   deadlocks).
3. **New puzzle types** — multi-slot ordered placement (Planet Path), a card-sequence
   puzzle (Moon landing), a re-readable **Star Atlas with textual clues/riddles**, plus
   **5 new mini-games** (Orbit Balance, Rover Route, Build-a-Rocket, Spacewalk Drift,
   Focus the Stars).

Holds to the six [[gameplay-principles]] and [[art-direction]] / [[scientific-realism-rule]]
(real spacecraft + true planet order / Apollo sequence — verify space facts in the catalog
data; there's no space equivalent of the `paleontologist` skill yet).

## Build plan — READY ✅

Detailed, ready-to-execute plan:
`product/prototypes/museum-parallax/SPACE-WING-PLAN.md`. It maps every page to the existing
engine: reuses the dino wing's scene/world model, inventory, catalog, drag/rotate, mini-game
contract, tilt input, and completion/finale — and lists exactly which files change. Scope
decided with Gidi: **full playable wing** (all 5 dioramas interactive, all 5 mini-games real,
full sell+buy economy), **wireframe SVG art now**, painted layers drop in 1:1 later (team norm).

## Status / approvals

- **Plan:** in build (started 2026-07-22).
- **Gidi (product):** ✅ approved starting execution (2026-06-16), and on 2026-07-22
  waived the wait for Dor's sign-off — build proceeds, design feedback folds in as
  it comes.
- **Ohad (tech):** FYI — second wing generalizes the single-wing engine; no blocker.

## Build progress (2026-07-22)

- ✅ **Wing engine generalized** — a `WINGS` registry drives navigation, seals and
  finales; rooms declare their own challenges. The dino wing is behaviour-identical.
- ✅ **[[astronomer]] skill + [[space-accuracy-rulings]]** — space content has the
  same accuracy guard the dino wing has. Caught the "oxygen hose" error before build.
- ✅ **Economy + Supply Desk** — see [[space-economy-design]], including the
  two-pouch bag (Finds / Rocks).
- ✅ **Space Hall hub + the lobby door** — the SPACE door is no longer roped off.
  The hall has five framed niches (Solar System / Mars / Moon / Station / Webb),
  the Supply Desk counter, and a space rock on the floor, so the whole
  find → sell → buy loop is learnable within sight of the desk that pays for it.
  Unbuilt dioramas say they're being installed rather than failing silently.
- ✅ **Room 1 — Solar System (the Planet Path puzzle)** + its mini-game, **Orbit
  Balance**. The orrery has eight numbered rings; three are empty (2, 4, 6) and the
  Star Atlas describes exactly those three **by trait, never by name**. The three
  missing planets come from **three different sources** — Mars found by exploring
  the room, Saturn bought at the Supply Desk, Venus won in Orbit Balance — so the
  wing's whole loop is taught inside one exhibit.
- ⬜ **Next:** Mars, Moon, Space Station and James Webb rooms (declared in the
  wing already, so the wing can't finish early), their mini-games, then locking
  the cross-room dependency graph.

Regression-tested end to end by `npm run verify` in the prototype (91 checks across
`verify-wings`, `verify-economy`, `verify-spacewing`, `verify-solar`).

### Design notes worth keeping
- **Countability beat realism in the orrery.** The first version fanned the planets
  around the ellipse the way a real orrery does — and it was unusable: you could not
  tell which planet sat on which ring, so "fourth from the Sun" became a guess. Every
  planet now mounts at the same point of its ring, in a straight row, with the ring
  number on a plate directly below. A five-year-old can literally count to four.
- **The difficulty lives in the reasoning, not the fingers.** Sockets are big and
  obvious; what's hard is knowing *which* planet belongs in one. Precise dragging is
  the thing young hands are worst at.
- **A wrong ring costs nothing** — it says why, hands the planet back, and changes
  nothing. No fail state, per [[gameplay-principles]] #4.

If the team treats "two-wing structure + economy" as architectural, promote to an ADR via
`/decide`. Related: [[prototype-parallax-first-slice]], [[game-concepts]],
[[gameplay-principles]], [[art-direction]], [[prototype-completion-states]], [[north-star]].

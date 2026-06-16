---
name: space-wing
description: The Space Wing — second museum wing, fully spec'd (8-page comic) by Gidi; plan ready to build as a wireframe slice. Gidi approved; awaiting Dor's design sign-off to execute.
owner: gidi
scope: project
project: science-museum-mystery
created: 2026-06-16
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

(The comic source is Gidi's; the full transcription lives in the build plan, below.)

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

- **Plan:** ready to execute.
- **Gidi (product):** ✅ approved starting execution (2026-06-16).
- **Dor (design):** ⏳ approval pending — Dor owns design ([[dor-role]]); the Space Wing
  introduces an economy + new puzzle UX, so it wants his sign-off before/while building.
  Requested via this commit (notify-by-committing → gazette + Telegram).
- **Ohad (tech):** FYI — second wing generalizes the single-wing engine; no blocker.

If the team treats "two-wing structure + economy" as architectural, promote to an ADR via
`/decide`. Related: [[prototype-parallax-first-slice]], [[game-concepts]],
[[gameplay-principles]], [[art-direction]], [[prototype-completion-states]], [[north-star]].

---
name: space-economy-design
description: The Space Wing's Supply Desk economy — found-only coins, rocks-only selling, and an affordability audit that makes a soft-lock impossible; the two rules are enforced in code, not by convention
owner: gidi
scope: project
project: science-museum-mystery
created: 2026-07-22
tags: [space, economy, gameplay, kids-ethical, no-dead-ends, build]
---

# Space Wing economy — how the Supply Desk is safe for a 6-year-old

The Space Wing introduces the game's first economy ([[space-wing]]): find space
rocks → sell them at the Space Supply Desk → buy the tools the dioramas need. It's
also the first system where a child can make a choice that **costs** something, so
the design is mostly about what must be **impossible**.

## Settled rules (enforced in code)

1. **Coins are found, never bought.** No real money, no IAP, no paid randomness —
   consistent with the no-ads kids' bar in the mobile-game-builder playbook.
2. **Only rocks can be sold.** `economy.js` filters the sell list to rock items, so
   a child can't trade away a quest item a puzzle still needs. This is the single
   biggest soft-lock risk an inventory economy has, and it's closed structurally
   rather than by careful content authoring.
3. **The world is always affordable.** The rocks placed across the wing are worth
   **143 coins**; every tool combined costs **90**. `auditEconomy()` runs at boot and
   errors loudly if a future edit to either list breaks the margin. The bar isn't
   "possible" but "**a child who finds only 70% of the rocks can still finish**"
   (100 ≥ 90) — a completionist requirement would be a dead end for a 6-year-old.
4. **No purchase is a wrong purchase.** All five tools are needed, so there is
   nothing to regret buying and nothing to punish. Buying is gated on affording it,
   never on guessing right.
5. **You can't pay and get nothing.** The item is handed over *before* coins are
   deducted; if the bag is full the sale is called off. (Found by writing the test,
   not by reading the code.)

## Prices
Rocks: Lunar Chip 6 · Mars Rock 7 · Meteorite 9 · Star Shard 10 · Stardust Cluster 12.
Tools: Rotate Key 14 · Solar Brush 16 · Mission Card 18 · Planet Model 20 · Mirror
Segment 22. Rarer finds pay more, so the ranking is learned by trading rather than
read off a table.

## Design choices worth knowing
- **The desk is a place, not a menu.** It's a counter you walk to in the space hub
  and it opens full-screen — trading stays part of exploring rather than becoming a
  pause-menu action. (Gidi's call, 2026-07-22, over a permanently-available side rail.)
- **The Buy column is also the wing's to-do list.** Every tool is always visible with
  what it's for ("The rover's solar panel is buried in dust"), so a child can see
  what's coming and why it matters — soft guidance, not a quest log.
- **The same rock type appears in several rooms**, so each placed rock is an
  *instance* (`lunarChip@solar`) — the inventory is keyed by item id, and without
  instances only the first Lunar Chip in the game could ever be picked up.

## The bag: two pouches, one rail (decided 2026-07-22, Gidi)
The 6-slot inventory would have overflowed — five tools, plus cross-room quest
items, plus rocks in hand. **Rocks got their own pouch, surfaced as a second tab in
the existing inventory rail** rather than as a second panel.

- **Two tabs, not two rails.** Screen space on a phone is the scarcest thing we
  have, and a child should never have to hunt for a second panel.
- **FINDS** (6 slots) holds puzzle items you drag onto exhibits. **ROCKS** (8 slots,
  scrolls) holds currency you sell at the desk. A full rock pouch can therefore
  never block picking up a quest item — the thing that made this a real problem.
- **Rocks are tapped, not dragged.** They're sold, never used on an exhibit, so a
  tap opens the rock's details instead of starting a drag that could only ever
  fail. Curiosity still gets rewarded, per "every tap rewards".
- **The tab carries the count; the pouch carries the total worth** ("worth 44 🪙").
  A child sees the pile growing without opening it, and reads the total before
  deciding to walk to the desk — the collection layer, doing double duty as the
  economy's feedback.
- **The Rocks tab is hidden until the first rock is found**, so the Dinosaur Wing's
  rail is untouched. Same treatment as the coin purse in the HUD.
- **An item's pouch follows from what it is** (`pouchOf()`), so no code has to
  remember to file a find correctly.

Built in `product/prototypes/museum-parallax/src/economy.js`; guarantees are
regression-tested by `scripts/verify-economy.mjs` (`npm run verify`).

Related: [[space-wing]], [[gameplay-principles]], [[space-accuracy-rulings]],
[[prototype-parallax-first-slice]], [[north-star]].

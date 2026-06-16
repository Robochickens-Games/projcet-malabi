---
name: museum-mechanics-from-beloved-games
description: A second wave of mechanic ideas drawn from famous, beloved games — covering all three wings, picked to NOT overlap the existing 15 dino mechanics; recommended five-to-build-first led by Photo Safari, Hidden Object, and the Creature-Dex
owner: dor
status: under-review
area: design
created: 2026-06-16
reviewers: [gidi, ohad]
---

# More mechanics — from games people already love

**Context:** ideation extension of [[dinosaur-section-mechanics]] (the 15-mechanic
proposal). That list already mines *Gorogoa, Obra Dinn, Golden Idol, The Room,
Monument Valley, Outer Wilds, Scribblenauts*. This wave deliberately brings in
**beloved mechanics those 15 don't cover**, and stretches them **across all three
wings** (Dinosaurs / Space / Inventions), not just dinosaurs — so the
"museum = franchise" promise in [[game-concepts]] holds.

Held against our six [[gameplay-principles]], the mobile-game playbook
(`mobile-game-builder`), and the [[north-star]] (make money · make fun).

Related: [[game-concepts]], [[gameplay-principles]], [[art-direction]],
[[dinosaur-section-mechanics]], [[0003-first-product-direction-science-games-for-kids]].

---

## Recommended five to build first

### 1. Photo Safari — *New Pokémon Snap*
Don't catch the creatures, **photograph** them. Aim a camera at the Living
Diorama, frame a creature mid-behaviour (T-Rex roaring, Pteranodon diving,
Brachio browsing) and snap → the shot fills its field-guide card. Bonus stars for
catching the **real trait** in action.
- **Why:** the **collection engine** the whole game wants — trait-as-verb,
  endlessly shareable (parents post kids' shots = free UA), reuses dioramas we're
  already building. **Signature-mechanic candidate** alongside Time Lens.
- **Cross-wing:** photograph planets through a telescope; snap a machine mid-motion.

### 2. Hidden Object "I Spy" hunt — *Hidden Folks / Where's Waldo*
A busy painted scene + a short list ("find 8 fossils, 1 thing that doesn't
belong"). Everything pokeable wiggles and chirps when tapped.
- **Why:** tailor-made for our **painterly art** and principle #1 (*every tap
  rewards*). Cheapest content to scale — one painting = one level. Screenshot gold.
  Drops into every wing immediately.

### 3. Creature-Dex / sticker album — *Pokédex + Panini stickers*
The meta spine: every discovery fills a collectible card (stats, rarity, "found
June 16"). Completion bars per wing.
- **Why:** principle #5 (*collection layer*) **and the monetization hook** —
  expansion wings = new sticker packs, the kids-ethical premium model. Formalises
  the "fossil-dex" hint with the famous reference behind it. **Highest retention
  leverage.**

### 4. Egg → hatchling → adult care — *Tamagotchi / Nintendogs*
Incubate a fossil egg, then raise the baby: feed correct food, right conditions;
it grows over days into the scientifically accurate adult.
- **Why:** a **healthy daily return hook** (come back to see it grown — *not*
  streak-anxiety; see playbook §3). Embodies real life-cycle science. Extends the
  one-shot Egg Incubation puzzle (#14) into a meta loop.

### 5. Rube Goldberg contraptions — *The Incredible Machine*
The **Inventions wing's signature**: drag gears, ramps, levers, pulleys to send a
ball to the goal and power a machine. Physics you *feel*.
- **Why:** gives Inventions its own identity the way Time Lens anchors dinosaurs.
  Pure embodiment of the science; evergreen and endlessly authorable.

---

## Second tier (worth a look)

- **Cooking-Mama process sequences** — perform a real procedure step-by-step with
  satisfying gestures: prep a fossil (brush → drill → glue → varnish), fuel a
  rocket, mix a compound. *Embody the process.*
- **Constellation connect-the-stars** (*calming line games*) — drag to link stars;
  the constellation animates into the myth, then the real astronomy. The **Space
  wing's** signature-calm mechanic.
- **Spot-the-difference** — "the exhibit changed overnight — what moved?" Ties into
  the mystery framing; near-zero build cost on painted scenes.
- **Evolution slider** (*Spore-lite*) — drag a slider, watch fish → amphibian →
  dino → bird morph across eras. One gesture, big science payload.
- **Build-your-own-museum sandbox** (*Animal Crossing / LEGO*) — arrange and label
  collected exhibits; the museum visibly grows as you fill it. Creativity +
  ownership.
- **Fossil fishing / tar-pit dredge** (*fishing mini-games*) — a dig-site core
  action with variable-but-fair reward (delight, never gambling — playbook §1).
- **Wiring / flow puzzle** (*Flow Free*) — connect circuits to light a machine;
  quick, tactile, mobile-native (Inventions).

## Deliberately skipped (overlap or wrong fit)
- *Simon / rhythm memory* → overlaps Dino Sound Echo (#8 in [[dinosaur-section-mechanics]]).
- *Jenga / stacking physics* → overlaps Skeleton Balance (#4).
- *Match-3 (Candy Crush)* → beloved but generic/themeless for us. A
  **merge-the-bone-fragments** reskin (2048 / Merge Dragons) is the better version
  of that satisfaction, but **hold it** — risks feeling like a cheaper, different game.

---

## North-star read
- **Money-movers:** #1 Photo Safari, #2 Hidden Object, #3 Dex — retention
  (collection), virality (shareable shots), premium expansion model.
- **Franchise integrity:** #4 and #5 give the non-dino wings their own signatures
  so "museum = franchise" actually holds.

## Open for team review
- Does **Photo Safari** rise to a cross-wing *signature* (a peer to Time Lens), or
  stay a per-wing feature?
- Which one tiny prototype proves the most? (Photo Safari and Hidden Object both
  reuse existing dioramas/art — cheapest to test the feel.)
- Ohad: any of these costly to guarantee on the WebView/perf budget (contraption
  physics, sandbox state)?

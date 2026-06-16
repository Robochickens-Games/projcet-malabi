---
name: clue-design-deduction-not-naming
description: Puzzle clues should make the player deduce from a dinosaur's traits — never name the answer item or its location
owner: dor
scope: shared
created: 2026-06-15
tags: [game-design, puzzle, copy, dinosaurs, prototype]
---

In the match-the-find puzzles (find an item → figure out which dinosaur it
belongs to), clues must lead the player to **reason from traits**, not hand over
the answer. Dor flagged the museum-parallax clues as "too obvious and direct,
leading to the solution."

**Why:** the whole point of the loop — and the educational payoff aligned with
the [[north-star]] (make fun + teach real paleontology) — is the deduction. If
the hint says *what* the item is and *where* it's hidden, there's no puzzle left
and nothing is learned.

**How to apply (the rules we set in product/prototypes/museum-parallax/src/main.js):**
- **Placards** stay factual — they're the reference knowledge the player reasons FROM.
- **"Found it" toasts** pose the mystery and rule things out by trait
  ("a feather… but Triceratops had scales — whose is it?"), never name the destination.
- **Skeleton / hint copy** describes the *gap as a trait question* ("what tooth
  grinds tough plants all day?") instead of naming the item or its room.
- **Never name the item to drag** ("DRAG the big serrated tooth →" → "if one of
  your finds fits, drag it here →").
- **Tutorial/location help is tiered:** vague first, explicit only as a delayed
  fallback when the player is stuck (e.g. the lobby names the planter only after ~14s).

**Catalog (field guide) rules (added 2026-06-15):**
- The catalog cards **hide the dino's name** — they show only the trait visual,
  diet, and the trait note. The player matches a trait to a diorama by reasoning,
  not by reading a label. (Names still appear on the in-diorama placards, which
  confirm the answer *after* you've matched — the catalog is the lookup tool, so it
  must not give the answer away.)
- An inventory item's "more info" description is **not** written separately — it's
  pulled from the matching catalog entry (the dino's trait note) via `itemCatalogNote`,
  so the item detail and the field guide are one source of truth.

Known follow-ups:
- The matching room still implicitly confirms itself (the "you hold the right item"
  prompt only fires in the correct room). A truer puzzle would show each room's
  trait-gap regardless of what's held. Left as a mechanic change.
- **Brachio "Giant Egg" vs. catalog note conflict:** the egg puzzle treats a *giant*
  egg as Brachiosaurus's, but the catalog eggNote (accurately) says sauropod eggs were
  "surprisingly small." Now that the inventory pulls the catalog note, the Giant Egg
  detail reads "surprisingly small" — a contradiction to resolve (fix the puzzle premise
  or the note). See [[dino-accuracy-rulings]].

Related: [[prototype-parallax-first-slice]], [[dinosaur-section-mechanics]].

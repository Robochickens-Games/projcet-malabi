---
name: puzzle-challenge-match-the-reference
description: Assembly puzzles should make the player match a catalog reference by manipulating pieces (move + rotate/tilt), not drop them into obvious telegraphed slots
owner: dor
scope: shared
created: 2026-06-15
tags: [design, gameplay, puzzle, museum-parallax]
---

# Puzzles: match the reference, don't fill obvious slots

Dor's ruling (2026-06-15) on the T-rex **foot-assembly** puzzle in
[[prototype-parallax-first-slice]]:

- **The problem with slots.** The first version drew three bright outlined toe
  sockets and matched each bone by length — so only one bone fit each hole, with
  zero orientation needed. That telegraphs the answer; it's sorting, not solving.
- **The fix — manipulate to match.** Remove the obvious sockets. The player's job
  is to **read the catalog** (here: the T-rex three-toed track) and **recreate
  that shape**: drag each piece into rough place *and* spin/tilt it to the right
  angle. A piece only locks when **both position and rotation** match the target
  pose — so the real challenge is spatial orientation, not picking the right-sized
  block.
- **Reference lives in the catalog — and ONLY there.** "See how it should look in
  the catalog, then make it the same." The pedestal carries **no placement clues at
  all** (no sockets, no guide silhouette) — Dor removed the faint guide too. The
  player opens the catalog (Footprints → T-rex three-toed track) and works out the
  shape themselves.
- **Make it a full-screen, immersive moment.** (2026-06-15) The puzzle was promoted
  from a small in-room station to a **dedicated full-screen overlay**: tap a lit
  plinth in the T-rex room → a dark, spotlit pedestal fills the screen with the
  loose bones enlarged, a close button, and the catalog auto-opened as the
  reference. Room chrome (walk cue) is hidden; camera/room input is paused while
  it's open. Big, focused, "this is the puzzle" framing beats a tiny embedded prop.

**Why:** telegraphed slots make a puzzle trivially easy and kill the satisfaction;
a recreate-the-reference task adds real challenge while the answer is always
visible (the catalog), so it stays fair. Full-screen focus makes the beat feel
like a set-piece, not a side-prop.

**How to apply:** for any "rebuild / assemble" beat, prefer move+rotate-to-match
over snap-into-slot, give it a full-screen focused stage, and keep the reference in
the catalog (not as on-mount hints). Tune difficulty with position/angle
tolerances, not by hiding the answer. Stay inside [[gameplay-principles]] #4 — this
is *not* a fail state or guess-the-pixel: the catalog shows the goal, pieces stay
wherever you drop them, and you can keep adjusting until it clicks.

Implemented in `product/prototypes/museum-parallax/src/main.js` (`buildFootStage`
full-screen overlay, `buildFootEntry` room plinth, `openFootPuzzle`/`closeFootPuzzle`,
move/rotate drag handlers). Bones carry a gold "twist grip" at the tip; pieces are
~1.7× scale; lock needs pos < ~70px and angle < ~11°. See
[[clue-design-deduction-not-naming]] for the sibling rule on clue design.

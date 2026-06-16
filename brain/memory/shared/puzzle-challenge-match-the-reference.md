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
move/rotate drag handlers). Bones carry a gold "twist grip" at the tip; lock needs
pos < ~78px and angle < ~13° (`FOOT_POS_TOL`/`FOOT_ANG_TOL`). See
[[clue-design-deduction-not-naming]] for the sibling rule on clue design.

**Art upgrade (2026-06-16, Dor).** Swapped the abstract SVG bones for **real
photographed fossil art** and gave the stage a **background**:
- Stage backdrop is now a sandstone "dig" texture (`public/img/foot-bg.jpg`,
  cover-scaled) under a dark wash + warm spotlight, instead of a flat dark panel.
- The loose bones are **5 individual fossil bones** — metatarsal + 3 toes + a back
  dewclaw — sliced out of one "exploded bone kit" source image via alpha
  connected-component analysis (Python/PIL/scipy), saved to `public/img/foot/`
  (`metatarsal/toe-a/toe-b/toe-c/claw.png`).
- Because these bones are an *exploded kit* (not one assembled photo), each bone's
  seated pose is **hand-authored** in `bonesCfg` (`dx,dy,ang` = centre offset +
  rotation from the foot centre); locking all 5 rebuilds a posed theropod foot.
  Per-bone target angle (`bc.ang`), not 0 — the SVG-era "everything upright"
  assumption is gone. Scale is `FOOT_SC` (~0.62). Pose was tuned by screenshotting
  a temporary `__solveFoot` preview hook (removed) and adjusting offsets/angles.
- To add/replace bones: re-run the component slice on the source kit, drop PNGs in
  `public/img/foot/`, add a `bonesCfg` row, and tune `dx/dy/ang` against a solved
  screenshot. A raster `imgTexture(url)` helper (next to `svgTexture`) loads them.

**Solution in the catalog + connected joints (2026-06-16, Dor).** Two follow-ups:
- The reference is now the **assembled foot itself**, shown in the catalog. Added a
  `T-rex Foot` catalog section (`FOOT_GUIDE_SECTION`) — a single card with an
  `assembled.png` of the rebuilt skeleton + a labelled note. `openFootPuzzle` jumps
  straight to it (`openCatalogSection('trex-foot')`). This refines the earlier
  "reference = Footprints track" framing: the catalog now shows the *actual* goal
  shape, not just a track. Still catalog-only (no on-pedestal hints), so it stays
  inside the "match the reference, don't telegraph slots" rule.
- `assembled.png` is **composited from the exact same `bonesCfg` numbers** (a small
  PIL script mirrors the pixi transform: scale → rotate `-deg(ang)` → place at
  `dx*SC,dy*SC`). So the catalog picture and the in-game solved foot are guaranteed
  identical — change the config, regenerate the image, both move together.
- **Connected joints matter.** First pass had toes floating with gaps. Fix: orient
  each toe so its claw points its fan direction, then position so its *joint end*
  (opposite the claw, found via PCA axis extreme) meets the metatarsal base — toes
  radiate from one hub. Tuned in a fast offline render loop (`/tmp` PIL preview),
  not the full game. Don't anchor a wide block (metatarsal) by its axis-extreme
  point — it lands off-centre; place it by eye and hang the toes off its base.

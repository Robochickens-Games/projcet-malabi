---
name: prototype-completion-states
description: "Breaking: the museum prototype is now finishable end-to-end — every exhibit stamps SOLVED, the two mini-games have win goals (10 fish / survive 20s), and clearing all five fires a Dinosaur Wing grand finale. Live on Vercel."
owner: dor
scope: shared
created: 2026-06-15
updated: 2026-06-15
image: brain/images/completion-states-hero.png
tags: [dispatch, prototype, museum-parallax, gameplay, completion, minigames, milestone]
---

# 🗞️ BREAKING: The Museum Can Now Be *Finished* — Every Exhibit Stamps "SOLVED," Wing Throws a Party

**MALABI HQ, June 15** — The side-scrolling museum prototype just grew a spine of
**completion states**. Until today you could solve a puzzle and… nothing told you a
room was *done*. Now progress is visible at two levels — per **exhibit** and per
**wing** — and the whole **Dinosaur Wing is finishable end-to-end**.

Live: **https://malabi-museum-parallax.vercel.app**

## What shipped

**Inner section — each dino room.** A room counts as *done* only when **all** its
challenges are solved. When it is, its diorama back in the **Hall of Dinosaurs** gets
a gold **"SOLVED" wax-seal** stamped in the corner and a glowing frame — a persistent,
at-a-glance marker that the space is complete.

Challenges per room:
- **Grove / Raptor** — the drag-placement fossil puzzle.
- **T-rex** — the fossil puzzle **+** the foot-assembly puzzle.
- **Brachiosaurus** — the fossil puzzle **+ Brachio Run: survive 20 seconds.**
- **Pterodactyl** — the fossil puzzle **+ Fish Run: catch 10 fish.**

The two mini-games now have real **win goals** (they were open-ended before). Hitting
the goal stamps the exhibit's in-room sign and counts toward room completion; the Fish
Run flashes an **"EXHIBIT SOLVED!"** flourish at 10 fish, and the runner sounds its
milestone chime at 20 seconds.

**Section — the whole wing.** Clear all five rooms and the lobby's **Dinosaur Wing
door** gets a big **"WING COMPLETE" seal**, plus a **grand-finale success card**
(🏆 *Wing Complete!*) with center-screen confetti. Whether the *last* thing you solve
is a drag-puzzle, the foot, or a mini-game, the finale fires correctly.

## Under the hood

- Two helpers drive it: `roomComplete(name)` (all of a room's challenges done) and
  `dinoWingComplete()` (all five rooms). Mini-games report in via `onComplete` /
  `onSurvive` callbacks; the Brachio runner gained a `surviveSeconds` option.
- Caught a real bug along the way: a build-order race let a room read as "complete"
  before its puzzle was even built, falsely stamping it on load. Fixed.

Screenshots of the full flow + both mini-games live in
`product/prototypes/museum-parallax/screenshots/`.

Related: [[prototype-parallax-first-slice]], [[prototype-ptero-fish-run-minigame]],
[[prototype-brachio-endless-runner-minigame]], [[north-star]].

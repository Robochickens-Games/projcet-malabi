---
name: dino-accuracy-rulings
description: Settled paleontology rulings for the museum game's dino roster — verdicts the team should not re-litigate (Velociraptor feathered, Triceratops scaly, tooth-shape→diet, etc.).
owner: team
scope: shared
created: 2026-06-15
tags: [science, accuracy, paleontology, dinosaurs, content-rule]
---

# Dino accuracy rulings

Running list of **settled** paleontology verdicts for *Science Museum Mystery*'s
dino roster, fact-checked via the `paleontologist` skill. Append new rulings here
rather than re-deciding. Upholds [[scientific-realism-rule]] /
[[art-scientific-realism]].

## Velociraptor — feathered (✅, verified 2026-06-15)
*Velociraptor mongoliensis* had **feathers**. Quill knobs (the bumps where wing
feathers anchor) were found on a fossil forearm. **Source:** Turner, Makovicky &
Norell 2007, *Science*, "Feather Quill Knobs in the Dinosaur *Velociraptor*"; AMNH.
- **Art note:** depict it **turkey-sized and feathered**, *not* the scaly,
  human-tall *Jurassic Park* version (that look is closer to *Deinonychus*).
- **Kid line (in use):** "Velociraptor wore feathers like a bird! Bumps on its arm
  bones — called quill knobs — show exactly where its feathers attached."

## Triceratops — scaly, not feathered (✅, verified 2026-06-15)
*Triceratops* (a ceratopsian) shows **scaly** skin impressions; no feathers.
Drives the parallax prototype's feather puzzle ("the feather belongs to the
feathered Velociraptor, not the scaly Triceratops" — scientifically defensible).
- **Nuance rounded off for kids:** a few *distant* ornithischians had
  bristle/filament structures (e.g. *Psittacosaurus* tail bristles), but
  *Triceratops* itself is scaly, so the puzzle holds.

## Tooth shape → diet (✅, in use)
Herbivore = wide/flat (Triceratops); carnivore = sharp/serrated blade (Allosaurus,
Velociraptor); piscivore = smooth cone (Spinosaurus). Drives the grove tooth puzzle.

**Where this shows up:** `product/prototypes/museum-parallax/` — the dino-hall hub,
the Triceratops grove (tooth puzzle), and the Velociraptor badlands room (feather
puzzle). Roster data lives in `src/art.js` `DINOS`.

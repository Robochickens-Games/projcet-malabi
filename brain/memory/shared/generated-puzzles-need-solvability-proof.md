---
name: generated-puzzles-need-solvability-proof
description: Any randomly generated puzzle board must be PROVEN solvable before it's shown to the player — generate, check, re-roll; found when Rover Route could wall off the correct answer
owner: team
scope: shared
created: 2026-07-22
tags: [gameplay, puzzles, procedural, no-dead-ends, lessons-learned]
---

# Randomly generated puzzles must prove they're solvable

**The lesson:** if a puzzle board is generated at random, **generate → verify →
re-roll** before showing it. Never assume the generator's constraints imply
solvability. Cap the retries and have a graceful fallback so the loop can't spin.

**How we found it (2026-07-22).** The Mars room's *Rover Route* mini-game scatters
hazards across a grid, with three candidate rocks in the far column. The generator
looked obviously safe — never more than 2 of 5 rows blocked in any column, so a
path across "must" exist. It didn't follow: hazards in the **second-to-last**
column could wall off a rock completely, because the far column can only be entered
at the rock you're driving to (every other cell there is a different rock, and
touching one scans it). About 1 board in 8 made a rock unreachable — sometimes the
**correct** one.

A child would have planned route after route and never arrived. That's a dead end,
which is exactly what [[gameplay-principles]] #4 forbids, and no amount of "no fail
state" copy makes up for a puzzle with no answer.

**The fix:** a real breadth-first search, used twice — once by the generator to
reject bad boards (rejection sampling, hard cap of 40 tries, empty plain as the
fallback), and once by the test hook. The regression test re-rolls **200 boards** and
asserts all three rocks are reachable every time.

**Why it nearly shipped:** it only appeared as a *flaky test*. The same check passed
when run alone and failed inside the full suite, which reads like a timing problem —
and the first two things I did were lengthen a timeout and replace sleeps with
polling. Neither was the bug.

**How to apply:**
- Any procedural layout (mazes, hazard fields, card shuffles, hidden-object
  placement) ships with a solvability check in the generator **and** a test that
  samples many boards, not one.
- Treat "passes alone, fails in the suite" as a possible *correctness* bug, not
  automatically a timing one. Randomised content fails intermittently by nature.
- The verifier and the game should share one implementation, so a test can't prove
  something the game doesn't actually do.

Related: [[gameplay-principles]], [[space-wing]], [[coach-rami-log]].

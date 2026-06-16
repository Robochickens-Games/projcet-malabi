---
name: coach-learning-loop
description: The coach skill — a meta-skill that teaches lessons learned into the other skills' & agents' own definitions, so the system improves over time instead of repeating mistakes.
owner: team
scope: shared
created: 2026-06-16
tags: [meta, skills, process, learning, quality]
---

# The coach learning loop

We have a **coach** skill (`brain/skills/coach/SKILL.md`, adapter in
`.claude/skills/coach/`) whose whole job is to take a **lesson learned** — a flop, a
ruling, member feedback, a recurring mistake, or a technique that worked — and **teach it
to the other skills and agents** so the whole system gets better instead of relearning the
same things.

**Why:** capturing a lesson in memory isn't enough — memory only helps when something pulls
it. Behavior only changes when the lesson lives inside the instructions a skill/agent reads
*every time it runs*. The coach's real output is therefore **edits to the canonical skill/agent
definitions**, with the brain memory as the record. It teaches the *principle*, not the instance.

**How to apply:** when something is learned and settled, run the coach: distill it
(situation → learning → principle → how to apply) → diagnose which skills/agents it should
change → make a surgical edit to each (a checklist item, rule, or tightened step) →
verify the edit would catch the original mistake → record + index + commit. Teach only
*settled* learnings; route unsettled ideas through brain-dump as proposals first, and
directional calls through an ADR, then coach the skills to follow it.

Related: [[blender-asset-experiment-flop]] (the kind of flop worth teaching from),
[[dino-accuracy-rulings]] and [[clue-design-deduction-not-naming]] (rulings that should
constrain future work), [[architecture-of-the-brain]], [[north-star]].

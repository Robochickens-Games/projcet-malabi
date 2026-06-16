---
name: coach
description: Take a lesson learned and teach it to the team's other skills & agents — durably encode it into their definitions (and the brain) so the whole system stops repeating mistakes and compounds what works. Anyone can use.
---

# Coach — teach the lessons learned to the other skills & agents

The team's **meta-skill**: it makes the rest of the system get better over time.
Every other skill ([[paleontologist]], [[product-designer]], [[project-management]],
[[version-manager]], brain-dump) and every agent does the *work*; the coach makes sure
that whenever we learn something — a flop, a ruling, a piece of feedback, a recurring
mistake, a trick that worked — that lesson is **taught back into the definitions those
skills and agents read next time**, so they apply it automatically without anyone
remembering to.

Anyone on the team can invoke this. Align everything to the north star — *make us money,
make it fun* ([[north-star]]): a lesson is worth teaching if applying it makes the product
better, the team faster, or a costly mistake non-repeatable.

## The principle: teach where it will be read

Capturing a lesson in memory is **not enough** — memory is only loaded when something
pulls it. A lesson only changes behavior when it lives **inside the instructions the
relevant skill/agent reads every time it runs**. So the coach's real output is *edits to
the canonical skill and agent definitions*, not just a note. Memory records the lesson;
the skill edits **enforce** it.

Teach the **principle, not the instance.** "The Blender auto-Triceratops came out a balloon"
is an instance; "validate a generated asset against the art-direction + accuracy bar before
treating the pipeline as proven, and don't claim a pipeline works off one render" is the
transferable lesson. Generalize so it catches the *next* mistake too, not only the one that
happened.

## Before you start

- Be clear on the **lesson**. If it isn't crisp, extract it: *what happened → what was
  wrong or right → the generalizable principle → how to apply it next time.* If the member
  hands you a raw story, do this distillation first and reflect it back for a sanity check.
- Read the targets you're about to teach: the canonical skills in `brain/skills/*/SKILL.md`
  and any agents in `brain/agents/*.md`. You can only teach a definition you've read.
- Read `brain/memory/shared/project-status.md` and the relevant memory so the lesson is
  consistent with what's already settled and doesn't contradict an existing ruling/decision.

## The loop

1. **Intake — state the lesson atomically.** One lesson at a time. Write it as:
   *Situation → What we learned → Principle → How to apply.* Tag whether it's a
   **correction** (stop doing X) or a **confirmation** (keep doing Y — it worked).

2. **Diagnose reach — who needs to learn this?** Map the lesson to the specific skills
   and agents it should change. Most lessons touch one or two; some are cross-cutting
   (e.g. "always verify before claiming done" touches everyone). Be precise about *which*
   definition and *which section* each edit lands in. If a lesson reaches **no** existing
   skill/agent, that's a signal a new one may be needed — say so.

3. **Teach durably — edit the definitions.** For each target, make a **surgical** edit
   that encodes the lesson as something the skill will act on:
   - a new **checklist / watch-out item** (like paleontologist's "Common errors to catch"),
   - a **rule** in its "Before you start" or quality bar,
   - or a tightened step in its loop.
   Keep diffs minimal — extend, don't rewrite. **Reconcile, don't contradict:** if the
   lesson conflicts with an existing instruction, resolve the conflict explicitly (update
   the old line) rather than leaving two rules that fight. Phrase the rule so a future run
   reading it cold would apply it correctly without the backstory.

4. **Verify the lesson took.** Re-read each edited section and ask: *would this skill, run
   fresh, now catch the original mistake or repeat the win?* If the edit is ambiguous,
   buried, or easy to skip, fix the wording. A lesson taught but not verified is not taught.

5. **Record & broadcast.** Write the lesson to the brain as a memory (`type: feedback` for
   how-we-work lessons, or the matching scope/owner), with **Why:** and **How to apply:**
   lines, linking the skills/agents it changed and the source incident with `[[name]]`.
   Add the one-line pointer to `brain/memory/index.md`. Then **commit** — the commit is how
   the team finds out the system got smarter (see [[version-manager]] / the sync protocol).
   Use a clear message, e.g. `coach: teach asset-validation lesson into paleontologist + asset pipeline`.

## What counts as a lesson worth teaching

- A **flop / mistake** we don't want repeated (e.g. [[blender-asset-experiment-flop]]).
- A **ruling or decision** that should now constrain future work (e.g. [[dino-accuracy-rulings]],
  [[clue-design-deduction-not-naming]], [[puzzle-challenge-match-the-reference]]).
- **Member feedback** on how a skill/agent should behave ("don't telegraph puzzle slots",
  "stop asking permission for routine pushes").
- A **recurring error** you notice an agent making across sessions.
- A **technique that worked** and should become default practice.

Not every remark is a lesson. A one-off preference, an open idea, or an unsettled "what if"
is **not** ready to teach — route ideas through the brain-dump skill as a proposal and only
teach them once they're agreed. Teach **settled** learnings.

## Anti-patterns (don't)

- **Don't only write a memory.** If the lesson didn't change at least one skill/agent
  definition (or justify why none applies), the coaching didn't happen.
- **Don't rewrite a skill** to insert one lesson. Smallest edit that enforces it.
- **Don't teach the instance.** Generalize to the principle that transfers.
- **Don't teach unsettled ideas** as if they were rulings. Proposals first, teaching second.
- **Don't leave contradictions.** Two rules that fight are worse than the original mistake.
- **Don't skip the commit.** An untaught-to-the-team lesson stays in one person's head.

## Relation to the rest of the system

- **brain-dump** captures ideas as proposals; **coach** propagates *settled* lessons into
  behavior. Brain-dump grows what we know; coach changes what the skills *do*.
- **decision-record / ADRs** capture *directional* calls. If a lesson is really a new
  direction, route it through `brain/processes/decision-record.md` first, then coach the
  skills to follow the ADR.
- **version-manager** ships the edits to the team. Coach always ends in a commit.

When a lesson reaches a capability that doesn't exist yet, propose it — see the candidate
list in `brain/agents/README.md` — rather than forcing the lesson into a skill it doesn't fit.

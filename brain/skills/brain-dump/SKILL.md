---
name: brain-dump
description: Capture any team member's idea — document, classify, and remember it as a PROPOSAL that needs team review and agreement before it's acted on. Anyone can use.
---

# Brain dump

Turn any idea from Dor, Gidi, or Ohad into a documented, classified, remembered
**proposal** — and make sure it gets surfaced, reviewed, and managed. The core
rule: **an idea is never treated as decided or acted on until the team reviews and
agrees.**

## When to use
Any time someone shares an idea, suggestion, or "what if" — for the product,
design, tech, or process.

## Steps

1. **Capture (verbatim first).** If it's a substantial dump, archive the raw text
   to `brain/inbox/<today>-<member>-<topic>.md` for traceability.

2. **Document as a proposal.** Write one file per idea in `brain/proposals/` using
   the frontmatter in `brain/proposals/README.md` — `status: proposed`, the owner,
   and the area. Capture the idea, the problem it addresses, and **what the team
   would need to agree on**.

3. **Classify.** Tag the `area` (design / product / tech / infra / other) and route
   awareness to the relevant owner — design→Dor, product→Gidi, tech→Ohad — while
   keeping it a team decision. Note briefly how the idea serves the [[north-star]]
   (make money / fun) — that framing helps the team review it.

4. **Do NOT act on it.** Don't implement it, and don't present it as "the plan" or
   fold it into accepted memory/decisions. It stays `proposed` until the team agrees.

5. **Surface it.** Commit the proposal (clear message, e.g.
   `proposal: <title> (from <member>, via session)`) so the team is notified, and
   flag it for review. Proposals awaiting review should show up in `/sync` and `/catchup`.

6. **Manage the lifecycle.**
   - When the team is weighing in → set `status: under-review`, record `reviewers`.
   - When the team **agrees** → set `status: agreed`, then **promote**: directional
     ideas become an ADR via `brain/processes/decision-record.md`; settled facts
     become accepted memory. Only now is it acted on.
   - When declined → `status: rejected` (keep the file for the record).

## Reflect back
Tell the member, in one line, what you captured, where, and that it's logged as a
**proposal pending team review** — so they know it's remembered but not yet acted on.

> Distinct from `/decide`: `/decide` records a call the team has already made.
> This skill handles raw ideas that still need the team's review and agreement.

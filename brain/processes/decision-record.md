# Process: Decision records (ADRs)

Directional calls — architecture, product, process, tooling — get written down
as immutable, numbered ADRs in `brain/decisions/`. This is how the team's "why"
survives over time and across members.

## When
A choice is ADR-worthy if it's **directional and hard to reverse**, or if a
future member would reasonably ask "why did we do it this way?". Small,
reversible choices are just memory, not ADRs.

## Steps
0. **Check it against the [[north-star]].** Does the decision serve "make us money"
   and "make it fun"? If it trades one off, say so in the ADR's Consequences.
1. Next number: `NNNN` = highest existing in `brain/decisions/` + 1, zero-padded.
2. Create `brain/decisions/NNNN-<kebab-title>.md` from the template below.
3. Add a memory pointer in `memory/shared/` (or the relevant project) linking to it.
4. Commit with a message like `decision: NNNN adopt X over Y`.

## Template
```markdown
---
name: NNNN-<kebab-title>
description: <one line — the decision itself>
owner: <member or team>
status: proposed | accepted | superseded
created: YYYY-MM-DD
supersedes: <NNNN or ->
tags: [decision, ...]
---

# NNNN. <Title>

## Status
Accepted — YYYY-MM-DD

## Context
What forces are at play? What problem are we solving?

## Decision
What we're doing.

## Consequences
Trade-offs, what this makes easier/harder, what we're committing to.

## Alternatives considered
What else we looked at and why we passed.
```

## Rules
- ADRs are **append-only**. To change a decision, write a new ADR that
  `supersedes:` the old one, and set the old one's status to `superseded`.

---
description: Record a directional decision as a numbered ADR
argument-hint: [the decision, or leave empty and we'll work it out]
---

Record a decision following `brain/processes/decision-record.md`.

The decision (if provided): $ARGUMENTS

Steps:
1. Determine the next ADR number from `brain/decisions/`.
2. Draft `brain/decisions/NNNN-<kebab-title>.md` using the template — fill in
   Context, Decision, Consequences, and Alternatives considered. Ask me for any
   missing rationale rather than guessing.
3. Add a memory pointer in `memory/shared/` (or the relevant project) linking the ADR.
4. Show me the draft for confirmation, then stage a commit
   (`decision: NNNN <title>`).

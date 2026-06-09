# Proposals — ideas awaiting team review

Every idea any of us has lands here **first** — documented, classified, and
remembered, but **not acted on or treated as decided until the team reviews and
agrees**. This is the gate that keeps one person's brain dump from silently
becoming "the plan."

Driven by the [brain-dump skill](../skills/brain-dump/SKILL.md).

## Lifecycle

```
proposed ──▶ under-review ──▶ agreed ──▶ promoted (becomes an ADR / accepted memory, then acted on)
                          └─▶ rejected ──▶ archived (kept for the record)
```

- **proposed** — captured from a brain dump. Logged, not acted on.
- **under-review** — the team is weighing in.
- **agreed** — the team signed off (record who). Now it gets promoted to a decision
  (`brain/decisions/`) or accepted memory and can be acted on.
- **rejected** — declined; kept here for history so we don't re-litigate it.

## One file per idea

```markdown
---
name: <kebab-slug>
description: <one-line idea>
owner: dor | gidi | ohad
status: proposed        # proposed | under-review | agreed | rejected
area: design | product | tech | infra | other
created: YYYY-MM-DD
reviewers: []           # members who've weighed in / agreed, e.g. [gidi, ohad]
---

# <Idea title>

**The idea:** …
**Why / what problem:** …
**What we'd need to agree on:** …
**Notes / discussion:** …
```

## Rule
Nothing in `proposed` or `under-review` is "the plan." Until an idea is **agreed**,
the AI documents and surfaces it but does **not** act on it or present it as settled.

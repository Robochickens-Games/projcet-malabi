# Memory Index

The table of contents for everything the team knows. **Load this first**, then
open the specific memory files relevant to your task. Keep it to one line per
memory — never put memory content here.

## Memory format

Each memory is **one file, one fact**, with frontmatter:

```markdown
---
name: <short-kebab-case-slug>
description: <one-line summary — used to judge relevance during recall>
owner: dor | gidi | ohad | team
scope: shared | member | project
project: <slug>            # only when scope: project
created: YYYY-MM-DD
tags: [comma, separated]
---

<the fact. For decisions/feedback, add **Why:** and **How to apply:** lines.
Link related memories with [[their-name]].>
```

After writing a memory, add a one-line pointer below under the right section.

---

## Shared (team-wide truth)
- [north-star](shared/north-star.md) — 🌟 our guiding goals (make money · make fun); align everything to it
- [team](shared/team.md) — who's who, roles, contact, working norms
- [architecture-of-the-brain](shared/architecture-of-the-brain.md) — how this whole system is structured
- [budget-constraint](shared/budget-constraint.md) — no spend on infra right now; default to free
- [project-status](shared/project-status.md) — where we are: done / in progress / parked / next
- [dudu-direction-note](shared/dudu-direction-note.md) — Dudu isn't going as Dor hoped; accepted, parked

## Members
### Dor
- [dor-role](members/dor/dor-role.md) — Dor's role: design
### Gidi
- [gidi-role](members/gidi/gidi-role.md) — Gidi's role: product management
### Ohad
- [ohad-role](members/ohad/ohad-role.md) — Ohad's role: tech

## Projects
_(none yet — first initiative creates `memory/projects/<slug>/` and a section here)_

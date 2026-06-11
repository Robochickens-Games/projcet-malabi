---
name: status-board-reconcile
description: The "where things stand" board self-corrects at build time — completed Next-up items auto-move to Done via resolved-when markers
owner: team
scope: shared
created: 2026-06-10
tags: [status, wiki, gazette, automation, infra]
---

# Status board reconcile — keep the board honest automatically

The gazette's **"where things stand"** kanban ([[project-gazette]]) renders
`brain/memory/shared/[[project-status]]` **verbatim**. So a finished task used to
linger as a "Next up" card until a human deleted the bullet — that's exactly how the
stale **"Onboard the team"** card survived after the team was already onboarded.

**Fix (live since 2026-06-10):** any actionable bullet can carry a machine-checkable
marker, and the wiki build reconciles it against the real repo:

```
- **Team:** … create `brain/memory/projects/dino-time-lab/`. <!-- resolved-when: path-exists:brain/memory/projects/dino-time-lab -->
```

At build time `reconcileStatus()` in `scripts/build-wiki.mjs` evaluates the check.
When it passes, the bullet **auto-moves from "Next up"/"In progress" into Done** with a
**✓ auto-verified** badge (and logs `[reconcile] …`). A Done bullet whose check later
fails is flagged **⚠ regressed**. Markers are stripped from every rendered surface
(`stripReconcileMarkers`), so readers never see the bookkeeping.

**Supported checks:** `path-exists:<repo-relative-path>` · `codeowners-filled`
(true once `.github/CODEOWNERS` has no `@*-gh` placeholders). Add more in the
`RECONCILE_CHECKS` map.

**Scope / limits:** it only auto-resolves what a check can *prove* from the working
tree — no network, no guessing. Free-text items without a marker still need a human
(`/catchup`). It's a safety net against drift, not a replacement for writing status.

**Note:** onboarding is recorded **done** (collaborators added); the `@*-gh`
placeholders in CODEOWNERS are deliberately **deferred** (review routing works via
collaborator access), so onboarding is intentionally *not* tagged with
`codeowners-filled` — that would re-raise a card the team chose to defer.

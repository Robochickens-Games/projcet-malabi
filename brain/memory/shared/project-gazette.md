---
name: project-gazette
description: The Project Gazette — a newspaper-style wiki, auto-published to GitHub Pages, that visualizes the brain and what changed when
owner: team
scope: shared
created: 2026-06-10
tags: [wiki, gazette, pages, visualization, infra]
---

# The Project Gazette — visual wiki of the brain

A newspaper-style ("NYTimes" editorial, shadcn warm-grey / stone palette) wiki that
turns `brain/**` into a single, always-current page the whole team can skim.

**What it shows**
- **Front Page** — a dated *dispatch feed* built from `git log` over `brain/**`:
  what changed, when, by whom, with the touched files (click → opens the memory).
  This is the "see what & when changed" view.
- **Status** — the live `project-status.md`, typeset.
- **Knowledge Map** — a d3 force graph of memories + decisions, linked by `[[wikilinks]]`.
- **Decisions** — the ADR ledger with status badges (proposed / accepted / abandoned).
- **The Team** — Dor / Gidi / Ohad masthead.
- **Archive** — every memory, filterable by scope.

**How it's built**
- Generator: [`scripts/build-wiki.mjs`](../../../scripts/build-wiki.mjs) — zero npm deps,
  emits a self-contained `site/index.html` (markdown via marked CDN, graph via d3 CDN).
  `site/` is gitignored; it's rebuilt from source on every deploy.
- Publish: the `build-wiki` GitHub Action re-typesets and deploys to GitHub Pages on
  every push to `main` touching `brain/**` (or the generator). A **new edition prints
  on every commit** — same notify-by-committing model as the rest of the brain.
- The front-page feed needs full history, so the Action checks out with `fetch-depth: 0`.
- **Deep-linkable articles:** any memory/decision opens directly via `…/#/<slug>`
  (the wiki reads `location.hash` on load). The **Telegram brain-update digest**
  uses this — every announcement links to the relevant Malabi Daily article (the
  memory/decision the commit was about), plus the raw commit as source.

**One-time setup (still pending):** repo **Settings → Pages → Source = "GitHub Actions"**
must be switched on once for the site to go live. Until then the Action builds but can't
publish.

Serves the north star by keeping the team synced at a glance. Related: [[project-status]],
[[architecture-of-the-brain]], [[north-star]].

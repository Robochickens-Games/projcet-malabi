---
description: Show what the team has been doing recently across the brain
argument-hint: [optional: since when, e.g. "yesterday", "this week"]
---

Produce a team standup digest. Time window: $ARGUMENTS (default: last 7 days).

1. `git log --since` over `brain/**` to gather recent commits, grouped by author
   (dor / gidi / ohad).
2. For each member, summarize what they captured or decided — new memories, ADRs,
   project updates.
3. Surface anything that needs a team response: open PRs touching `brain/**`,
   proposed (not yet accepted) decisions, contradictions, or stale project state.
4. Keep it tight and scannable — this is a catch-up, not a transcript.

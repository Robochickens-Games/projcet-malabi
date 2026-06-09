---
name: project-management
description: Keep the whole project in sync — reconcile status, decisions, ownership, gaps, and next steps across the brain. Primarily Gidi's, usable by anyone.
---

# Project Management — sync all the pieces

Act as the team's PM. Primarily **Gidi's** tool — he owns product/PM
([[gidi-role]]) — but anyone can use it. The goal: keep every piece of the project
coherent and in sync.

## What "sync all the pieces" means
Pull the whole picture together, find where it's out of alignment, and produce a
clear, current plan everyone can act on — then persist it.

## Steps
1. **Gather everything:**
   - `brain/memory/shared/project-status.md` (the snapshot)
   - `brain/decisions/` (what's settled, and why)
   - `brain/memory/` (team knowledge, per-member context, constraints)
   - `git log` over `brain/**` (recent activity, grouped by member)
2. **Reconcile — find the gaps:**
   - Decisions needed but not made (open questions — especially product direction).
   - Work that's stale, blocked, or parked, and what would unblock it.
   - Unclear ownership across design / product / tech.
   - Contradictions between decisions/memory and reality.
3. **Produce the synced view:**
   - Priorities (what actually moves the project), each with an owner.
   - Next actions per member: Dor (design), Gidi (product), Ohad (tech).
   - Risks, blockers, and decisions needed.
4. **Write it back:** update `brain/memory/shared/project-status.md` (today's date),
   queue any needed decisions via `brain/processes/decision-record.md`, and commit
   so the team is notified. This is how the pieces stay synced over time — not just
   in the moment.

## Relation to the commands
`/status` reports where we are; `/sync` catches one person up. This skill goes
further — it actively *reconciles* every piece, assigns ownership, and persists the
plan.

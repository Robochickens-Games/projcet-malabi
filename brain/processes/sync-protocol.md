# Process: Sync protocol

How a member catches up and stays in sync. Runs at the **start of a work session**
(via `/sync`, or the SessionStart hook) and whenever someone wants the latest.

## Steps

1. **Pull.** `git pull --rebase` on the current branch (default `main`). If there
   are local uncommitted brain changes, surface them first — don't clobber.

2. **Identify the member.** Use the git user (`git config user.name` / email) to
   resolve who's working: `dor`, `gidi`, or `ohad`. Read their member memory.

3. **Compute "what changed since you last worked."** Look at commits to `brain/**`
   since this member's last commit (or the last `/sync` marker). Summarize:
   - New or changed **decisions** (ADRs) — highest priority.
   - New **shared** memories.
   - Updates to **projects** the member is involved in.
   - Anything explicitly addressed to or relevant to this member.

4. **Brief the member in three buckets.** This is the standard catch-up shown
   after any clone or sync — keep it tight and scannable:
   - **What's new** — changes since they last worked (new decisions, memory,
     project updates), who did them.
   - **Built / created** — what's done and ready now (from `project-status.md`).
   - **Waiting** — what's open, parked, or needs them next (open questions, their
     todos, decisions pending).

5. **Fetch open letters.** Pull open daily notes (GitHub issues titled
   `[note] <slug>: …`) and include them in the **Waiting** bucket — then address
   them per [daily-notes](daily-notes.md): fold each into the right memory and
   close it with `Closes #N` in the addressing commit.

6. **Flag conflicts / open loops.** Pending PRs touching `brain/**`, contradictory
   decisions, or stale project state that needs a call.

## Notes
- The summary should be *prioritized*, not exhaustive — lead with decisions and
  anything that changes the member's current work.
- If nothing relevant changed, say so in one line and move on.

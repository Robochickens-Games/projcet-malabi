---
name: version-manager
description: Own git for the brain — stage, commit, integrate the remote, and push automatically when work is in a shareable state. Don't ask permission for routine pushes; just keep the team in sync. Anyone can use.
---

# Version Manager — keep the brain pushed and in sync

The team's notification mechanism is git: **a commit/PR touching `brain/**` is how
everyone finds out** (see CLAUDE.md). So unpushed work is invisible work. This skill
makes the AI own version control end-to-end and **push on its own when the work is in
a shareable state — without asking first**.

## Default posture: push, don't ask

When a unit of work is complete and the tree is in a coherent state, **commit and push
automatically.** Do not stop to ask "should I push?" — pushing is the expected, routine
close of a task. The member can always undo a commit; they cannot act on work they never
received.

## When to auto-push (relevant)

Push automatically after:
- Writing or updating memory, decisions/ADRs, proposals, status, or other `brain/**` content.
- A working code/script change that builds or passes its check (e.g. `scripts/build-wiki.mjs`
  rebuilds cleanly).
- Any change the member explicitly asked to "save," "ship," "push," or "sync."

## When NOT to auto-push (stop and surface instead)

- The tree is mid-task / half-finished, or a build or test is failing.
- Changes contain secrets, credentials, or large/binary junk that shouldn't be tracked.
- A rebase hits **conflicts** — never resolve blindly; stop and show the member.
- The change is destructive or rewrites shared history (no force-push to `main`).
- The member said to hold, draft, or review first.

## Procedure

1. **Inspect:** `git status -sb` and `git diff` — know exactly what's going out and how far
   ahead/behind the branch is.
2. **Group into clean commits:** keep unrelated concerns in separate commits with clear
   messages (a brain-content commit and a tooling commit shouldn't be one blob). Conventional
   prefixes (`feat(wiki):`, `fix:`, `docs(brain):`) match this repo's history.
3. **Integrate the remote first:** the brain is shared and often behind. `git pull --rebase`
   before pushing. On conflict, stop (see above).
4. **Push:** `git push`. Never `--force` to `main`.
5. **Report:** one line on what was pushed and the resulting state — don't ask for permission
   after the fact.

## Notes
- Follow CLAUDE.md and the sync protocol (`brain/processes/sync-protocol.md`); this skill is
  the *write/push* half of staying in sync, `/sync` is the *read/catch-up* half.
- This skill is what the **AI** does with git. The **team's** plain-language, no-experience-needed
  side — the safe daily loop, not stepping on each other, never losing work — lives in
  [[safe-git]]. When a human is unsure or hits a conflict, that skill tells them to hand it here.
- Keep commit messages tool-agnostic and about the change, not the tool.

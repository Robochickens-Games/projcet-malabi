---
name: safe-git
description: Plain-language git & version-control playbook for the team — how to stay in sync, never step on each other's work, keep history clean, and never lose work. Written for people new to git; the AI does the hard parts. Anyone can use.
---

# Safe Git — version control for a team new to git

This is the team's **safety net for working together without git getting scary.** You do
**not** need to learn git to use this. The rule of thumb: **the AI does the hard parts**
(staging, clean commits, rebasing, conflicts — that's [[version-manager]]); you just follow
the safe loop below and ask the AI whenever anything feels off.

**Two promises this skill keeps:**
1. **You can't lose committed work.** Once something is committed and pushed, git keeps it —
   even "deleted" or "overwritten" work is recoverable. The way you lose work is by *not*
   saving it, not by saving it.
2. **The project stays clean.** You save early and often (messy is fine); the AI tidies it
   into clear, well-grouped history before it's shared. Save like nobody's watching; the AI
   makes it presentable.

## The mental model (the whole thing in 4 words)
- **Pull** = *get* everyone's latest work onto your machine.
- **Commit** = *save a checkpoint* of your work (a labelled snapshot you can always return to).
- **Push** = *share* your saved work with the team.
- **Branch** = *a private lane* to work in so big/risky changes don't bump into anyone.

Your copy is local until you **push**; everyone else's work is theirs until you **pull**. Git's
job is to merge the two safely. The brain's whole sync fabric runs on this ([[architecture-of-the-brain]]).

## The daily safe loop (do this every session)
1. **Start by syncing.** Before touching anything, **pull** so you have everyone's latest. Easiest
   way: run **`/sync`** — it pulls and briefs you on what changed (the read half of staying in
   sync). This is the single most important habit for not stepping on toes.
2. **Work in small chunks.** Do one thing at a time. Smaller, focused changes are easier to save,
   share, and never collide.
3. **Save often (commit).** Whenever a piece works or you're about to step away, save a checkpoint.
   Don't wait for "perfect" — frequent saves are how you never lose work. Just ask the AI to commit,
   or let [[version-manager]] do it automatically.
4. **Share when it's coherent (push).** When the chunk is in a working, shareable state, push it so
   the team sees it. A push touching `brain/**` is how the team gets notified. The AI pushes routine
   work automatically — you rarely have to think about it.
5. **End the session clean.** Don't leave hours of unsaved/unpushed work overnight — that's the only
   work that's truly at risk. If you must stop mid-thing, ask the AI to save a checkpoint first.

## The 5 rules that stop you stepping on each other's toes
1. **Pull before you start, push when you pause.** The smaller the gap between what you have and what
   the team has, the less anything collides. Sync at the start, share often.
2. **One person, one chunk at a time.** Avoid two people heavily editing the *same file* at the same
   moment. Glance at `brain/memory/shared/project-status.md` for who owns what; coordinate big
   overlaps in chat first.
3. **Use a branch for anything big or risky.** A branch is a private lane — experiment freely, and it
   can't disturb anyone on `main` until it's ready. Ask the AI: *"put this on a branch."* For small,
   safe edits, working on `main` and pushing often is fine.
4. **Push small and often, not huge and rarely.** Ten small shares beat one giant one — the team sees
   your direction early and nobody builds on top of a surprise.
5. **Let commit messages do the talking.** A clear message ("added dino accuracy ruling", "fixed
   parallax mobile bug") *is* the team notification. The AI writes good ones; just say what you did.

## How to never lose work (the safety nets)
- **Committed = safe.** Anything you've committed can be recovered, even if a later change seems to
  wipe it. Git keeps history. (Recovery tools: `git reflog`, `git restore` — but you don't run these,
  you **ask the AI** and it will.)
- **Pushed = double-safe.** Once it's on GitHub, it's on the team's machines too. Belt and suspenders.
- **Scared you'll break something? Save first.** The safest move before any risky step is to commit
  what you have. Then experiment freely — you can always come back to the checkpoint.
- **The danger zone is *unsaved* work.** Long stretches without a commit are the only real way to lose
  effort. When in doubt, save.

## When something goes wrong — STOP and ask the AI
You will sometimes see scary words: **"conflict," "rejected," "diverged," "detached HEAD."** Do **not**
try random commands and do **not** retype the same command harder. Instead:
- **Stop.** Don't push, pull, or force anything else.
- **Ask the AI:** *"git is showing me X — sort it out safely without losing my work."* The AI will
  inspect the situation and resolve it (or explain the one safe choice).
- **Never force.** Never run a `--force` push or "discard all changes" on shared work. If a command
  warns it will overwrite or throw away work, that's the signal to hand it to the AI.
- A **merge conflict** just means two people changed the same lines; it's normal and fixable — the AI
  walks it through. Nothing is lost while a conflict is open.

## Who does what
- **You:** sync at the start (`/sync`), work in small chunks, say what you did, and ask for help the
  moment anything looks odd. That's the whole job.
- **The AI ([[version-manager]]):** inspects state, groups changes into clean commits, integrates the
  remote with rebase, pushes routine work automatically, and handles conflicts/recovery. It will stop
  and surface to you on conflicts, failing builds, secrets, or half-finished work — otherwise it keeps
  the team in sync for you.

## Golden rules (the short version)
- ✅ Sync at the start, save often, share often, end clean.
- ✅ Branch for big/risky work; coordinate when two people touch the same thing.
- ✅ When it looks scary, **stop and ask the AI** — never force, never discard.
- ❌ Don't sit on hours of unpushed work. ❌ Don't force-push. ❌ Don't fight a conflict alone.

Related: [[version-manager]] (the AI's git automation — the write/push half), the sync protocol
(`brain/processes/sync-protocol.md`), `/sync` (the read/catch-up half), [[architecture-of-the-brain]]
(git is the team's sync fabric).

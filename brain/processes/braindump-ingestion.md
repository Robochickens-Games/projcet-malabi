# Process: Brain dump ingestion

How the AI turns a member's raw thoughts into structured, shared memory. This
runs **in-session** — triggered by `/braindump`, or proactively whenever a member
states something worth keeping.

> **Ideas vs. settled facts — important.** If the dump is an **idea / suggestion /
> "what if"**, it must NOT be acted on or treated as decided. Route it through the
> [brain-dump skill](../skills/brain-dump/SKILL.md): log it in `brain/proposals/`
> as `proposed` and surface it for team review. Only the team's agreement promotes
> it. Use the memory path below only for **settled facts** and context (who's who,
> constraints, things already true/agreed).

## When to trigger
- Member runs `/braindump` (explicit dump).
- Member states a decision, fact, preference, plan, or project update mid-session
  (proactive capture — don't wait to be asked).

## Steps

1. **Capture the raw input.** If it's a substantial explicit dump, archive the
   verbatim text to `brain/inbox/YYYY-MM-DD-<member>-<slug>.md` for traceability.
   Small inline remarks don't need archiving.

2. **Classify each idea.** Split the dump into atomic facts. For each, decide:
   - **Type:** decision · fact · preference · project-update · task/idea · reference
   - **Scope:** `shared` (team truth) · `member` (personal) · `project` (initiative)
   - **Owner:** the member, or `team`

3. **Write structured memory.** One file per fact, with full frontmatter (see
   `brain/memory/index.md`). Put it in the directory matching its scope. Link
   related memories with `[[name]]`.
   - If it's a **directional decision**, route it through
     `decision-record.md` → it becomes an ADR, and leave a memory pointer to it.

4. **Deduplicate.** Before creating a file, check whether an existing memory
   already covers it. Update that file instead of creating a near-duplicate.
   Delete memories that the dump proves wrong.

5. **Update the index.** Add/adjust the one-line pointer in `brain/memory/index.md`.

6. **Reflect back.** Tell the member, in one short list, what you captured and
   where — so they can correct misclassifications immediately.

7. **Commit.** Stage the changes with a clear message (e.g.
   `brain: capture Dor's notes on auth approach + 2 decisions`). The commit is
   the team notification — see `sync-protocol.md`.

## Quality bar
- One fact per file. Atomic, self-contained, recall-friendly `description:`.
- Absolute dates, not relative.
- Don't record what the code or git history already says.

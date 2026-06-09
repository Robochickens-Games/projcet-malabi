---
description: Capture my raw thoughts/notes into structured, shared team memory
argument-hint: [your raw dump, or leave empty and just talk]
---

Ingest my brain dump following `brain/processes/braindump-ingestion.md`.

The dump (if provided): $ARGUMENTS

If any of this is an **idea / suggestion** (not a settled fact), use the
[brain-dump skill](../../brain/skills/brain-dump/SKILL.md): log it in
`brain/proposals/` as `proposed`, surface it for team review, and do **not** act on
it until the team agrees. Settled facts/context follow the memory steps below.

Steps:
1. If this is a substantial dump, archive the verbatim text to
   `brain/inbox/<today>-<my-slug>-<topic>.md`.
2. Split it into atomic facts; classify each by type, scope, and owner.
3. Write one structured memory file per fact in the correct scope directory,
   with full frontmatter; link related memories with `[[name]]`. Route directional
   decisions through `/decide` (an ADR).
4. Deduplicate against existing memory; update rather than duplicate.
5. Update `brain/memory/index.md`.
6. Reflect back a short list of what you captured and where.
7. Stage a commit with a clear message so the team is notified.

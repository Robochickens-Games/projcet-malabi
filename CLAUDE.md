# Malabi — operating instructions for the AI

This is a **shared AI brain** for a three-person team: **Dor**, **Gidi**, **Ohad**.
Your job is to keep every member's context complete and the team in sync.

## Read first, every session

1. The memory index: [brain/memory/index.md](brain/memory/index.md) — the table
   of contents for everything the team knows. Load it, then pull the specific
   memory files relevant to the task.
2. Identify **who you're working with** (the current git user) and read their
   member memory under `brain/memory/members/<name>/`.
3. If this is the start of a work session, follow the **sync protocol**
   ([brain/processes/sync-protocol.md](brain/processes/sync-protocol.md)) before
   anything else: pull, then brief the member on what changed since they last worked.

## Core behaviors

- **Capture as you go.** When the member states a decision, a fact, a preference,
  or project context worth keeping, write it to the brain — don't wait to be asked.
  Follow [brain/processes/braindump-ingestion.md](brain/processes/braindump-ingestion.md).
- **One fact per memory file**, with frontmatter. See the format in
  [brain/memory/index.md](brain/memory/index.md). After writing a memory, update
  the index.
- **Scope correctly.** Team-wide truth → `memory/shared/`. Personal to one member
  → `memory/members/<name>/`. Tied to an initiative → `memory/projects/<slug>/`.
- **Real decisions become ADRs.** Anything architectural or directional goes in
  `brain/decisions/` via [brain/processes/decision-record.md](brain/processes/decision-record.md).
- **Notify by committing.** A commit/PR touching `brain/**` is how the team finds
  out. Write clear commit messages; GitHub fans them out.
- **Keep the brain tool-agnostic.** Never write Claude-specific or Cursor-specific
  assumptions into `brain/`. Tool quirks live in `.claude/` or `.cursor/` only.

## Conventions

- Cross-link memories with `[[memory-name]]` (the file's `name:` slug).
- Convert relative dates ("next week") to absolute ones when writing memory.
- Don't duplicate what git history or the code already records.
- Member names are lowercase slugs: `dor`, `gidi`, `ohad`.

# The Brain

The single source of truth for the team — tool-agnostic markdown. Claude Code,
Cursor, and any future tool read *into* this directory; nothing in here should
depend on a specific tool.

This is also the unit we plan to **extract into its own repo** once a real
product takes shape. Keep the boundary clean: no product code, no tool config.

## Layout

| Dir          | What it holds                                                        |
|--------------|----------------------------------------------------------------------|
| `memory/`    | Structured knowledge. `shared/`, `members/<slug>/`, `projects/<slug>/`. Start at `memory/index.md`. |
| `processes/` | The SOPs the AI follows — ingestion, sync, decisions, onboarding.    |
| `decisions/` | ADRs — numbered, immutable records of directional calls.            |
| `skills/`    | Canonical, tool-agnostic skill definitions.                          |
| `agents/`    | Canonical, tool-agnostic agent definitions.                          |
| `inbox/`     | Raw, unprocessed brain dumps, archived for traceability.             |

## The rule that keeps it sustainable

> If a fact is true for the **team and the work**, it lives in `brain/`.
> If it's true only for a **tool**, it lives in that tool's adapter (`.claude/`, `.cursor/`).

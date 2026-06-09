# Skills (canonical)

Tool-agnostic, reusable procedures the team relies on — written once here, then
surfaced to each tool via its adapter (`.claude/skills/`, Cursor rules, etc.).

## Format
One skill per directory: `brain/skills/<skill-name>/SKILL.md`, with frontmatter:

```markdown
---
name: <skill-name>
description: <when to use this skill — one line>
---

# <Skill name>
Steps / instructions the AI follows. Keep it tool-agnostic; reference brain
processes and memory rather than tool-specific features.
```

## How it reaches the tools
- **Claude Code:** a thin skill in `.claude/skills/<name>/SKILL.md` points here,
  or the canonical SKILL.md is symlinked/copied. Slash commands in
  `.claude/commands/` invoke the team processes directly.
- **Cursor:** referenced from `.cursor/rules/`.

Start by promoting the most-used `brain/processes/` (sync, braindump, decide)
into skills if/when they need richer, parameterized behavior.

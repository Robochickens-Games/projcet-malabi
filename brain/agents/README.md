# Agents (canonical)

Tool-agnostic definitions of specialized agents the team uses — described once
here, then projected into each tool (`.claude/agents/` subagents, Cursor, etc.).

## Format
One agent per file: `brain/agents/<agent-name>.md`, with frontmatter:

```markdown
---
name: <agent-name>
description: <what this agent is for — when to delegate to it>
tools: [optional list, or * for all]
---

# <Agent name>
System prompt / role. What it specializes in, how it should behave, what it
returns. Reference brain memory and processes so it inherits team context.
```

## Candidate agents to define as the team grows
- **brain-librarian** — keeps memory deduplicated, well-linked, and the index fresh.
- **sync-briefer** — runs the sync protocol and produces the catch-up digest.
- **decision-recorder** — drafts ADRs from discussion.

Define these as real needs emerge; don't over-build up front.

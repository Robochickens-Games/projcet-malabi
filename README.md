# Malabi — Shared AI Brain

A collaborative AI workspace for **Dor**, **Gidi**, and **Ohad**. One shared
"brain" — memory, skills, agents, processes — that travels with the team across
Claude Code, Cursor, and whatever tools we add next.

The goal: anyone can sit down, open their editor, and instantly have the **full
team context** — every decision, every note, every project's state — without
asking anyone. Drop a brain dump while you work; the AI structures it, syncs it,
and brings the rest of the team up to speed automatically.

## How it's built (read this once)

Three layers:

1. **The Brain (`brain/`)** — the single source of truth, in plain markdown.
   Tool-agnostic. Memory, skills, agents, processes, decisions all live here.
2. **Adapters (`.claude/`, `.cursor/`)** — thin config that points the editors
   into the brain. New tool later = new adapter, brain untouched.
3. **Sync fabric (git + GitHub)** — `git pull` on session start, structure on
   brain dump, notify the team on push.

The loop:

```
brain dump (in your session)  →  AI structures it into memory  →  commit / PR
   →  GitHub notifies the others  →  they pull  →  AI briefs them on what changed
```

## First time here?

Just cloned this? Run **`/status`** in Claude Code to see exactly where the project
stands, or read [brain/memory/shared/project-status.md](brain/memory/shared/project-status.md).
Then run `/sync` (or read [brain/processes/onboarding.md](brain/processes/onboarding.md)).
That's it — the AI takes over from there.

## Day-to-day

| You want to…                        | Do this                          |
|-------------------------------------|----------------------------------|
| See where the project stands       | `/status`                        |
| Catch up before working            | `/sync`                          |
| Dump a thought / decision / note    | `/braindump` (or just talk)      |
| Record a real decision              | `/decide`                        |
| See what the team did recently      | `/standup`                       |

## Where things live

- `brain/memory/` — structured knowledge (shared / per-member / per-project)
- `brain/processes/` — how we work (the SOPs the AI follows)
- `brain/decisions/` — Architecture/Product Decision Records (ADRs)
- `brain/skills/`, `brain/agents/` — canonical, tool-agnostic definitions
- `product/` — eventual product code (lives here for now; split out later)
- `dudu/` — the **WhatsApp adapter**: a bot that bridges a group chat to the brain
  (read/write). Persona in [brain/agents/dudu.md](brain/agents/dudu.md), runtime in
  [dudu/](dudu/), rationale in [brain/decisions/0002-dudu-whatsapp-bridge.md](brain/decisions/0002-dudu-whatsapp-bridge.md).

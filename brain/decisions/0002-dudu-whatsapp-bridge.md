---
name: 0002-dudu-whatsapp-bridge
description: Build Dudu, a WhatsApp-facing agent on the Claude Agent SDK, as a read/write bridge to the brain
owner: dor
status: accepted
created: 2026-06-09
supersedes: -
tags: [decision, dudu, whatsapp, agent, infra]
---

# 0002. Dudu — the WhatsApp bridge

## Status
Accepted — 2026-06-09

## Context
The team wants an assistant ("Dudu") they can add to a WhatsApp group so the chat
where they already talk becomes a first-class interface to the shared brain —
ask questions, drop brain dumps, record decisions — with full read/write access
to the repo. It must be professional, helpful, and safe with the shared truth.

## Decision
Build Dudu as a long-running service on the **Claude Agent SDK**
(`@anthropic-ai/claude-agent-sdk`, headless Claude Code), running on a small VPS,
with a **WhatsApp transport** via Baileys. Code lives in [`dudu/`](../../dudu);
the persona/guardrails are canonical in [agents/dudu.md](../agents/dudu.md).

Key choices:
- **Agent SDK over Managed Agents / a raw Messages loop.** Dudu runs `query()`
  with `cwd` = a local clone of this repo and `settingSources: ['project']`, so he
  inherits the *entire* brain — CLAUDE.md, the slash-command processes, memory
  conventions — for free. A persistent process can also hold the WhatsApp socket
  and a git working copy on one box; Managed Agents would re-mount the repo per
  session and couldn't keep the chat connection.
- **Baileys (unofficial WhatsApp).** The only realistic way for a bot to read and
  send in a *group* chat. Uses a **dedicated phone number** (not anyone's
  personal one). Accepted tradeoff: against WhatsApp ToS, small ban risk on that
  number — see Consequences.
- **Tiered write policy.** Memory/brain-dumps commit straight to `main` (the whole
  point is frictionless capture; reversible via git). Decisions open a **PR** for
  human review. Implemented as guidance Dudu follows, backed by the brain processes.
- **Small VPS hosting.** Always-on, independent of anyone's laptop. Shipped with a
  Dockerfile.

## Consequences
- **Easier:** the WhatsApp group becomes a zero-friction capture and Q&A surface;
  Dudu reuses all brain infra; adding behaviors = editing the brain, not Dudu's code.
- **Risk — WhatsApp ToS / bans:** Baileys links a real number as a device; Meta may
  ban it. Mitigation: dedicated number, human-like reply cadence, no spam, and the
  transport is swappable (Baileys is isolated behind one module) if we later move
  to an official channel.
- **Security:** Dudu runs headless with elevated tool permissions on the VPS and
  holds an Anthropic API key + a GitHub token. Mitigation: least-privilege GitHub
  token (push + PR only), secrets in env/secret store, decisions gated behind PRs,
  no force-push / no memory deletion.
- **Cost:** one VPS + Anthropic API usage per message.

## Alternatives considered
- **Official WhatsApp Cloud API** — sanctioned and stable, but built for 1:1
  business↔customer messaging; it cannot participate in normal group chats, so it
  fails the core requirement.
- **Managed Agents (CMA)** — great for stateless, repo-mounted tasks, but a poor
  fit for a persistent socket + local working copy on one host.
- **Slack/Discord bot instead of WhatsApp** — lower risk, but the team is on
  WhatsApp; meeting them where they are wins. Revisit if bans become a problem.

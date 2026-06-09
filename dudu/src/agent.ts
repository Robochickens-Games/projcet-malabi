// The Claude Agent SDK bridge.
//
// Dudu runs headless Claude Code against a local clone of the brain repo. By
// pointing `cwd` at the repo and loading `settingSources: ['project']`, he
// inherits the whole brain — CLAUDE.md, the slash-command processes, memory
// conventions — without us re-stating any of it here. This module only adds
// (1) who's speaking, and (2) the WhatsApp-specific output shape + write policy.

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { config } from "./config.js";

const exec = promisify(execFile);

/** Pull the latest brain before acting, so Dudu never works from a stale clone. */
async function pullLatest(): Promise<void> {
  try {
    await exec("git", ["pull", "--rebase", "--autostash"], { cwd: config.repoPath });
  } catch (err) {
    console.warn("git pull failed (continuing with local state):", err);
  }
}

function systemPromptAppend(member: string | null): string {
  const who = member
    ? `You are talking with team member "${member}". Scope and attribute any memory to them.`
    : `You could not map this WhatsApp sender to a known member. If you need to attribute or scope something personal, ask who you're talking to first.`;

  return [
    `You are Dudu, the team's assistant in a WhatsApp group. Your full persona and`,
    `guardrails are defined in brain/agents/dudu.md — read it and follow it.`,
    who,
    ``,
    `Channel rules (WhatsApp):`,
    `- Replies are read on a phone. Be concise and skimmable. No markdown headers,`,
    `  no long code blocks. A few short lines at most. Reply in the sender's language.`,
    `- After capturing memory or recording a decision, confirm in ONE line what you`,
    `  saved and where (or the PR link).`,
    ``,
    `Write policy (enforce strictly):`,
    `- Memory and brain dumps: commit straight to main with a clear message,`,
    `  attributed e.g. "brain: capture ${member ?? "member"}'s note on X (via Dudu)".`,
    `- Directional DECISIONS: do NOT commit to main. Create a branch, commit, push,`,
    `  and open a Pull Request with "gh pr create"; then reply with the PR URL.`,
    `- Never force-push and never delete memory. If a request is ambiguous or`,
    `  destructive, ask a clarifying question instead of acting.`,
  ].join("\n");
}

/**
 * Run Dudu on one incoming message. Returns the text to send back to the group.
 */
export async function runDudu(message: string, member: string | null): Promise<string> {
  await pullLatest();

  const chunks: string[] = [];
  let result = "";

  try {
    for await (const msg of query({
      prompt: message,
      options: {
        cwd: config.repoPath,
        model: config.model,
        // Inherit CLAUDE.md, .claude/ commands, settings from the repo:
        settingSources: ["project"],
        // Headless: no human to approve tool calls. The VPS is trusted; behavior
        // is constrained by the brain processes + the write policy above.
        permissionMode: "bypassPermissions",
        allowedTools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash"],
        systemPrompt: {
          type: "preset",
          preset: "claude_code",
          append: systemPromptAppend(member),
        },
        // Give Dudu room to read, edit, commit, and push within one turn.
        maxTurns: 40,
        env: config.githubToken
          ? { ...process.env, GH_TOKEN: config.githubToken }
          : process.env,
      },
    })) {
      if (msg.type === "assistant") {
        for (const block of msg.message.content) {
          if (block.type === "text") chunks.push(block.text);
        }
      } else if (msg.type === "result") {
        // The SDK's terminal message carries the final result text.
        result = (msg as { result?: string }).result ?? "";
      }
    }
  } catch (err) {
    console.error("Agent run failed:", err);
    return "Sorry — I hit an error handling that. Try again in a moment?";
  }

  const reply = (result || chunks.join("\n")).trim();
  return reply || "Done.";
}

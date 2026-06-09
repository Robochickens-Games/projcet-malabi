// Centralized config, read once from the environment.

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return v;
}

export const config = {
  // Optional: the Claude Agent SDK uses ANTHROPIC_API_KEY if set, otherwise falls
  // back to your existing Claude Code login. Leave blank to use the latter.
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  repoPath: required("DUDU_REPO_PATH"),
  // Optional: only needed once Dudu pushes / opens PRs. Reading + answering and
  // local commits work without it, so a POC can start with just the two above.
  githubToken: process.env.GITHUB_TOKEN || "",

  // Optional, with sensible defaults
  group: process.env.DUDU_GROUP?.trim() || "",
  trigger: (process.env.DUDU_TRIGGER || "dudu").toLowerCase(),
  model: process.env.DUDU_MODEL || "claude-opus-4-8",

  // Map of WhatsApp number (no +, no suffix) -> member slug
  members: parseMembers(process.env.DUDU_MEMBERS_JSON),

  // POC self-mode: link Dudu to YOUR existing WhatsApp (no dedicated number) and
  // let him answer your own ("from me") messages — e.g. in the "Message Yourself"
  // chat. Loop-protected. For testing only; turn OFF for the real shared bot.
  pocSelf: process.env.DUDU_POC_SELF === "true",
  pocMember: process.env.DUDU_POC_MEMBER || "dor",
};

function parseMembers(raw?: string): Record<string, string> {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    console.warn("DUDU_MEMBERS_JSON is not valid JSON — ignoring.");
    return {};
  }
}

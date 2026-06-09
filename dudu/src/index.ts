// Dudu entry point: wire the WhatsApp transport to the Agent SDK brain.

import "dotenv/config"; // load .env before anything reads process.env
import { config } from "./config.js";
import { startWhatsApp, type IncomingMessage } from "./whatsapp.js";
import { runDudu } from "./agent.js";

// All processing is serialized: Dudu writes to one git working copy, so two
// overlapping runs could clobber each other. A simple promise chain is enough
// for a three-person team's message volume.
let queue: Promise<void> = Promise.resolve();

function hasTrigger(msg: IncomingMessage): boolean {
  return msg.mentionedBot || msg.text.toLowerCase().includes(config.trigger);
}

function shouldRespond(msg: IncomingMessage): boolean {
  // If pinned to a specific group, ignore everything else — this applies to
  // everyone, including your own (fromMe) messages in POC self-mode, so Dudu
  // only ever acts in that one group and stays out of your other chats.
  if (config.group) {
    const inGroup =
      msg.chatId === config.group ||
      msg.chatName.toLowerCase().includes(config.group.toLowerCase());
    if (!inGroup) return false;
  }

  // POC self-mode: YOUR own messages on the linked account. Require the trigger
  // keyword so Dudu only reacts when you actually address him.
  if (msg.fromMe) return config.pocSelf && hasTrigger(msg);

  // SAFETY: Dudu runs shell commands on the host. If a member allowlist is
  // configured (DUDU_MEMBERS_JSON), ONLY known members can drive him — a random
  // person who joins the group via an invite link is ignored. Strongly recommended
  // whenever the group isn't fully trusted.
  const hasAllowlist = Object.keys(config.members).length > 0;
  if (hasAllowlist && !config.members[msg.senderNumber]) return false;

  // In a DM, always respond. In a group, only when mentioned or triggered by name.
  if (!msg.isGroup) return true;
  return hasTrigger(msg);
}

/** Remove a leading "dudu" / "@dudu" trigger so the agent gets a clean prompt. */
function cleanPrompt(text: string): string {
  const re = new RegExp(`(^|\\b)@?${config.trigger}[\\s,:-]*`, "i");
  return text.replace(re, "").trim() || text.trim();
}

async function main() {
  console.log(`Starting Dudu…${config.pocSelf ? " (POC self-mode)" : ""}`);
  await startWhatsApp(async (msg, reply) => {
    if (!shouldRespond(msg)) return;

    // In POC self-mode the sender is the linked account itself, so attribute to
    // the configured POC member instead of looking up the number.
    const member = msg.fromMe
      ? config.pocMember
      : config.members[msg.senderNumber] ?? null;
    const prompt = cleanPrompt(msg.text);

    console.log(
      `[${msg.chatName}] ${member ?? msg.senderNumber}: ${prompt.slice(0, 80)}`,
    );

    // Enqueue so runs don't overlap on the shared repo.
    queue = queue.then(async () => {
      try {
        const answer = await runDudu(prompt, member);
        await reply(answer);
      } catch (err) {
        console.error("Failed to handle message:", err);
        await reply("Sorry — something went wrong on my end.");
      }
    });
  }, { allowSelf: config.pocSelf });
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

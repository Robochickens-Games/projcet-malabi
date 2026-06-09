// WhatsApp transport via Baileys. This is the ONLY file that knows about
// WhatsApp — keeping it isolated means we can swap the channel later (per
// ADR 0002) without touching Dudu's brain logic.

import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  type WASocket,
  type proto,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import pino from "pino";

export interface IncomingMessage {
  chatId: string; // JID of the group/DM
  chatName: string; // group subject or sender name
  senderNumber: string; // sender's phone number, digits only
  text: string;
  isGroup: boolean;
  mentionedBot: boolean; // was the bot @-mentioned
  fromMe: boolean; // sent by the linked account itself (POC self-mode)
}

export type MessageHandler = (msg: IncomingMessage, reply: (text: string) => Promise<void>) => Promise<void>;

const logger = pino({ level: "warn" });

function digits(jid: string): string {
  return jid.split("@")[0].split(":")[0];
}

/** Extract plain text from the many Baileys message shapes. */
function extractText(m: proto.IWebMessageInfo): string {
  const msg = m.message;
  if (!msg) return "";
  return (
    msg.conversation ||
    msg.extendedTextMessage?.text ||
    msg.imageMessage?.caption ||
    msg.videoMessage?.caption ||
    ""
  ).trim();
}

export async function startWhatsApp(
  onMessage: MessageHandler,
  opts: { allowSelf?: boolean } = {},
): Promise<WASocket> {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({ version, auth: state, logger });

  // Track IDs of messages Dudu sends, so POC self-mode never reacts to its own
  // outgoing replies (which would otherwise loop, since they're also "fromMe").
  const sentIds = new Set<string>();

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log("Scan this QR with Dudu's WhatsApp (Linked Devices → Link a device):");
      qrcode.generate(qr, { small: true });
    }
    if (connection === "open") console.log("Dudu is connected to WhatsApp.");
    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(`Connection closed. ${shouldReconnect ? "Reconnecting…" : "Logged out — re-scan needed."}`);
      if (shouldReconnect) startWhatsApp(onMessage, opts);
    }
  });

  const botId = digits(sock.user?.id || "");

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const m of messages) {
      if (!m.message) continue;

      const fromMe = !!m.key.fromMe;
      if (fromMe) {
        // Normal mode: ignore our own messages. POC self-mode: allow them, but
        // skip the replies Dudu itself just sent (tracked below) to avoid loops.
        if (!opts.allowSelf) continue;
        if (m.key.id && sentIds.has(m.key.id)) continue;
      }

      const chatId = m.key.remoteJid || "";
      const isGroup = chatId.endsWith("@g.us");
      const text = extractText(m);
      if (!text) continue;

      const senderNumber = digits(m.key.participant || chatId);
      const mentions = m.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
      const mentionedBot =
        !!botId && mentions.some((j) => digits(j) === botId);

      let chatName = chatId;
      if (isGroup) {
        try {
          chatName = (await sock.groupMetadata(chatId)).subject;
        } catch {
          /* ignore */
        }
      } else {
        chatName = m.pushName || senderNumber;
      }

      const reply = async (out: string) => {
        const sent = await sock.sendMessage(chatId, { text: out }, { quoted: m });
        if (sent?.key?.id) sentIds.add(sent.key.id);
      };

      await onMessage(
        { chatId, chatName, senderNumber, text, isGroup, mentionedBot, fromMe },
        reply,
      );
    }
  });

  return sock;
}

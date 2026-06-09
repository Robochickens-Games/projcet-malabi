---
name: proactive-sync-push-telegram
description: Proactive push — Telegram digest on every brain commit + a daily backup digest
owner: dor
status: agreed
area: infra
created: 2026-06-09
reviewers: [dor]
---

# Proactive sync: push brain changes to the team (Telegram + daily backup)

**The idea:** Stop relying only on members opening a session to get synced. Add a
**push** layer so brain changes reach the team where they already look.

Two layers:
1. **Per-commit push (primary).** A GitHub Action triggers on push to `brain/**`,
   composes a short digest (who, what files, commit message / one-line summary),
   and posts it to a shared **Telegram group** via a free bot (BotFather token).
2. **Daily digest (backup).** A scheduled job posts a once-a-day "what changed in
   the brain" summary, so anyone who missed the real-time pings still catches up.

**Why / what problem:** Today's model is pull-only — a teammate is only re-synced
when they open their editor (SessionStart hook / `/sync`). If they don't, they go
stale and nothing reaches out. Push closes that gap. Serves the [[north-star]]:
a team that's actually in sync moves faster and makes fewer wrong-context mistakes.
This is the lightweight successor to the dropped WhatsApp bridge
([[0002-dudu-whatsapp-bridge]]) — notifications only, no risky always-on bot.

**Why Telegram:** free bot API, messaging-app-native (closest to the original
WhatsApp intent), no ToS/ban risk like Baileys, low one-time setup. Fits the
free-only [[budget-constraint]] — GitHub Actions minutes + Telegram are free.

**What we'd need to agree on (team — Gidi, Ohad):**
- Everyone joins one shared Telegram group and is OK with brain activity posted there.
- Create a Telegram bot (BotFather) and store its token + chat ID as **GitHub repo
  secrets** (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`).
- Scope of the digest: which paths trigger it (all of `brain/**`? exclude `inbox/`?),
  and how verbose.
- Daily digest cadence/time (e.g. 09:00 local) and who/what runs it (GitHub Actions
  `schedule:` cron, free).

**Implementation sketch (once agreed):**
- `.github/workflows/notify-telegram.yml` — on `push` to `main` touching `brain/**`,
  build a message from the commit and `curl` the Telegram `sendMessage` API.
- Daily: a second workflow on a `schedule:` cron that diffs the last 24h of
  `brain/**` and posts a summary.
- No new infra, no hosting cost, no per-message API spend.

**Still-open dependencies (separate but related):** real GitHub usernames in
`.github/CODEOWNERS` and adding Gidi + Ohad as repo collaborators — needed for
GitHub-side review routing, independent of this push channel.

**Notes / discussion:** Decided channel = Telegram, with a daily backup digest
(Dor, 2026-06-09). Keeps the brain tool-agnostic — this is an adapter/notification
layer, not brain logic.

**Status — built & live (2026-06-09):** Dor approved and provisioned it.
- Bot **@Project_malabi_bot** ("Malabo brain") created; added to Telegram group
  **"Todo"** (chat id stored as a repo secret, not here).
- Repo secrets `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` set.
- Workflows: `.github/workflows/notify-telegram.yml` (per-commit on `brain/**`) and
  `.github/workflows/daily-digest-telegram.yml` (07:00 UTC daily + manual dispatch).
- Test message confirmed delivered to the group end-to-end.
- **Verified working (2026-06-09 evening):** fixed a CI false-failure (the
  `curl | grep -q` send check tripped `pipefail` and reported red even when the
  message sent) — now captures + logs the Telegram API response. Auto-digests
  confirmed arriving in the group on `brain/**` pushes. Note: the notifier fires
  **only on `brain/**` changes** by design — infra/`.github/` commits don't notify,
  to keep the team channel signal-not-noise.
- **Follow-ups:** Gidi + Ohad to confirm they're in the group; consider renaming the
  group from "Todo" to a dedicated Malabi channel; rotate the bot token via BotFather
  since it passed through a chat session.

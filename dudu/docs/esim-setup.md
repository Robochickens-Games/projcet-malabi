# Setting up Dudu with an eSIM (on your personal phone)

This guide gives Dudu his **own** WhatsApp number — a dedicated eSIM line added to
your existing phone — so he's a real, separate teammate. Your personal WhatsApp
account is untouched and stays on your primary SIM. Dudu runs as a *second*
WhatsApp account on the same phone, then links to the Dudu service on your server.

> Why a separate number (not your personal one): keeps Dudu a distinct identity,
> lets *you* talk to him (a bot can't message its own account), and isolates the
> WhatsApp ban risk away from your personal account. See
> [`../../brain/decisions/0002-dudu-whatsapp-bridge.md`](../../brain/decisions/0002-dudu-whatsapp-bridge.md).

---

## Just want to prove it works first? (free POC, no eSIM)

You can skip the dedicated number entirely for a quick proof-of-concept by linking
Dudu to your **existing** WhatsApp — this is exactly what "WhatsApp Web" does. No
cost, works in minutes. Trade-offs (Dudu acts as you, full account access, ban
risk to your account) make this **testing-only** — for the real bot, use the eSIM
flow below.

1. In `dudu/.env` set:
   ```
   DUDU_POC_SELF=true
   DUDU_POC_MEMBER=dor
   ```
2. Start Dudu (`cd dudu && npm install && npm run build && npm start`) → scan the
   QR from your **personal** WhatsApp: Settings → Linked Devices → Link a Device.
3. Open the **"Message Yourself"** chat (search your own name / "You") and type:
   `dudu, what do you know about the project?`
4. Dudu replies in that same chat. He only reacts to messages containing the
   trigger word ("dudu"), and never to his own replies (loop-protected), so your
   normal self-notes are left alone.

When you're ready to make Dudu a real, separate teammate, set `DUDU_POC_SELF=false`
and follow the full eSIM setup below.

---

## What you'll need
- A phone that supports **dual SIM** (physical SIM + eSIM, or dual eSIM) — most
  phones from ~2020 on do.
- An **eSIM plan that includes a real phone number with SMS** (see Part A — this
  is the one thing to get right).
- The Dudu service installed on a server/VPS (see [`../README.md`](../README.md)).

---

## Part A — Get the eSIM (Dudu's number)

1. Buy an eSIM from a carrier that gives you a **number that can receive SMS**.
   - ⚠️ Most *travel* eSIMs (Airalo, Holafly, etc.) are **data-only** — no number,
     no SMS, so WhatsApp can't verify. Don't use those.
   - Good options: a **second line / multi-SIM** from your own mobile carrier, or a
     local prepaid carrier eSIM, or a provider like Truphone/1GLOBAL that issues a
     real mobile number. A cheap local prepaid eSIM is usually simplest.
2. Install it: **iPhone** → Settings → Cellular → *Add eSIM*; **Android** →
   Settings → Network & internet → SIMs → *Add eSIM*. Scan the QR your provider sent.
3. Confirm the eSIM line is **active and can receive a test SMS** before continuing.
   Keep your personal SIM as the default for calls/data; the eSIM just needs to
   exist and receive the one verification code.

---

## Part B — Add Dudu's WhatsApp account on your phone

You'll run two WhatsApp accounts on one phone: your personal one (unchanged) and
Dudu's (the eSIM number). Pick the path for your phone.

### iPhone
iOS won't clone an app, so use the **WhatsApp Business** app for Dudu:
1. Install **WhatsApp Business** from the App Store (it coexists with your regular
   WhatsApp — different app, different account).
2. Open it → register with the **eSIM number** → enter the SMS code it sends.
3. Set the profile name to **Dudu** and add a profile photo.

> Your personal WhatsApp (the green app) is untouched.

### Android
Two options — either works:
- **Built-in two accounts (simplest if available):** open WhatsApp → Settings →
  tap the ▾ next to your name → *Add account* → register the **eSIM number**.
  (Needs a recent WhatsApp version and dual-SIM.)
- **WhatsApp Business app:** install it from Play Store, register the **eSIM
  number** there. (Use this if your WhatsApp doesn't show "Add account.")

Then set the account name to **Dudu** and add a photo.

### (Optional, recommended) lock down Dudu's account
In Dudu's account: Settings → Account → **Two-step verification** → turn on, set a
PIN, and store it somewhere safe. Prevents anyone re-registering the number.

---

## Part C — Link the Dudu service (scan the QR)

1. On your server, start Dudu (see [`../README.md`](../README.md)):
   ```bash
   cd dudu && npm start
   ```
   It prints a **QR code** in the terminal.
2. On your phone, in **Dudu's account** (WhatsApp Business, or the second account):
   Settings → **Linked Devices** → *Link a Device* → scan the QR.
3. The terminal should log **"Dudu is connected to WhatsApp."** The link persists
   (saved in `dudu/auth/`), so you only scan once.

> Multi-device means Dudu keeps working even when your phone's screen is off.
> WhatsApp does require the phone to come online roughly every couple of weeks to
> keep the linked device alive — since it's your everyday phone, that's automatic.
> Keep the eSIM active.

---

## Part D — Add Dudu to the group + finish config

1. From any member's phone, add Dudu's eSIM number as a contact and add him to your
   team WhatsApp group (or send him a DM to test first).
2. In `dudu/.env`, set the member map so Dudu attributes notes to the right person:
   ```
   DUDU_MEMBERS_JSON={"<dor-number>":"dor","<gidi-number>":"gidi","<ohad-number>":"ohad"}
   ```
   Numbers are digits only, with country code, no `+` (e.g. `972501234567`).
3. (Optional) Pin Dudu to just the team group by setting `DUDU_GROUP` to the
   group's name or JID. The JID shows up in Dudu's logs once he's added — no need
   to hunt for it.
4. Test: in the group, send **"dudu, what do you know about the project?"** He
   should pull the brain and reply.

---

## Troubleshooting
- **No SMS code during registration** → the eSIM is probably data-only or not
  active. Re-check Part A; the number must receive SMS.
- **"Dudu" replies as you / you can't trigger him** → you linked your *personal*
  account by mistake. Unlink it (Linked Devices → remove) and re-scan with Dudu's
  account.
- **QR expired** → it refreshes in the terminal; just scan the new one.
- **Disconnects after a while** → bring your phone online; check the `dudu/auth/`
  volume is persisted (especially in Docker).

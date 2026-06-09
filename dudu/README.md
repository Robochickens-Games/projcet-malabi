# Dudu — WhatsApp bridge to the brain

Dudu is the team's assistant in WhatsApp. He reads from and writes to the shared
brain in this repo, so the group chat becomes a first-class interface to the
project. Who Dudu *is* lives in [`brain/agents/dudu.md`](../brain/agents/dudu.md);
this directory is *how he connects*.

## How it works

```
WhatsApp group  ──Baileys──▶  Dudu service (this dir)
                                  │  runs the Claude Agent SDK against a
                                  │  local clone of THIS repo (cwd + brain)
                                  ▼
                          reads/writes brain/ → git commit/push (or PR)
                                  ▼
                          GitHub notifies the team; reply posted to the group
```

Because Dudu runs the Agent SDK with `cwd` set to the repo and
`settingSources: ['project']`, he inherits the whole brain automatically —
`CLAUDE.md`, the `/sync` `/braindump` `/decide` processes, memory conventions.
The WhatsApp layer just turns a group message into a prompt and the agent's
result back into a reply.

See the architecture decision: [`brain/decisions/0002-dudu-whatsapp-bridge.md`](../brain/decisions/0002-dudu-whatsapp-bridge.md).

## Setup (local / first run)

> **Giving Dudu his own number on your existing phone?** Follow the step-by-step
> [eSIM setup guide](docs/esim-setup.md) — it covers the dedicated number, running
> a second WhatsApp account alongside your personal one, and linking. Note: the
> eSIM must include a **real number that can receive SMS** (most travel eSIMs,
> including Airalo, are data-only and won't work).

1. **Use a dedicated phone number** for Dudu (not your personal WhatsApp). Baileys
   links it as a "device", like WhatsApp Web.
2. Install and build:
   ```bash
   cd dudu
   npm install
   cp .env.example .env   # fill in the values below
   npm run build
   ```
3. **Clone the brain repo** somewhere Dudu can reach and point `DUDU_REPO_PATH` at
   it (can be this same checkout). Make sure git is configured to push (the
   `GITHUB_TOKEN` handles auth).
4. Start it and **scan the QR code** with Dudu's phone (Linked Devices → Link a
   device):
   ```bash
   npm start
   ```
5. Add Dudu's number to your WhatsApp group. He responds when mentioned by name
   (`DUDU_TRIGGER`, default "dudu") or to any message in `DUDU_GROUP` if set.

## Environment (`.env`)

| Var | Required | What |
|-----|----------|------|
| `ANTHROPIC_API_KEY` | ✅ | Anthropic key for the Agent SDK. |
| `DUDU_REPO_PATH`    | ✅ | Absolute path to the local clone of this repo. |
| `GITHUB_TOKEN`      | ✅ | Fine-grained PAT: contents read/write + pull-requests, for push + PRs. |
| `DUDU_GROUP`        | —  | Group JID (or substring of the group name) Dudu listens to. If unset, he replies anywhere he's mentioned. |
| `DUDU_TRIGGER`      | —  | Mention keyword that wakes Dudu in a group. Default `dudu`. |
| `DUDU_MODEL`        | —  | Model id. Default `claude-opus-4-8`. |
| `DUDU_MEMBERS_JSON` | —  | JSON map of WhatsApp number → member slug, e.g. `{"972500000001":"dor"}`, so memory is attributed correctly. |

## Deploy (VPS)

```bash
docker build -t dudu ./dudu
docker run -d --name dudu --restart unless-stopped \
  --env-file ./dudu/.env \
  -v /srv/malabi-brain:/repo \         # the brain clone
  -v /srv/dudu-auth:/app/auth \        # persisted WhatsApp session
  dudu
```
Set `DUDU_REPO_PATH=/repo` in the env file. The `auth/` volume persists the
WhatsApp link so you only scan the QR once. First run: `docker logs -f dudu` to
see the QR.

## Safety notes
- Dudu runs headless with elevated tool permissions on a box you control — keep
  the VPS locked down and secrets in env, not in the image.
- The GitHub token should be least-privilege (push + PR only).
- Decisions open PRs (human review); memory commits straight to `main`. See the ADR.

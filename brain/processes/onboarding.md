# Process: Onboarding

For a member sitting down with the brain for the first time (or on a new machine).

## One-time setup
1. Clone the repo and open it in Claude Code or Cursor.
2. Set git identity so the AI can resolve who you are:
   `git config user.name "<Dor|Gidi|Ohad>"` and your email.
3. (Optional) Copy `.claude/settings.local.json.example` to
   `.claude/settings.local.json` for personal, un-shared settings.

## First session
1. Run `/status` — see where the project stands (done / in progress / parked / next).
2. Run `/sync` — the AI pulls, identifies you, and briefs you on the full team
   context and recent changes.
2. Skim `brain/memory/index.md` and `brain/decisions/` to absorb the "why".
3. Add yourself: fill in your row in `memory/shared/team.md` and drop a few
   `brain/braindump`-style notes about your role, strengths, and current focus.

## Ongoing
- `/sync` at the start of each session.
- `/braindump` (or just talk) whenever you have context worth keeping.
- `/decide` for directional calls. `/standup` to see what the team's been doing.

That's the whole ritual. The AI handles structuring, syncing, and notifying.

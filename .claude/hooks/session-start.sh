#!/usr/bin/env bash
# SessionStart hook: lightly check whether the shared brain is behind the remote,
# and nudge the member to /sync. Read-only and fast — never mutates the repo.
set -euo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0

# Who's working?
who="$(git config user.name 2>/dev/null || echo 'unknown')"

# Best-effort fetch (short timeout; offline is fine — just skip).
git fetch --quiet 2>/dev/null || true

behind=0
if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
  behind="$(git rev-list --count HEAD..@{u} 2>/dev/null || echo 0)"
fi

msg="You are working in the Malabi shared brain with: ${who}. "
if [ "${behind}" -gt 0 ]; then
  msg+="The brain is ${behind} commit(s) behind the team's remote — recommend running /sync before starting work. "
else
  msg+="The brain is up to date with the remote. "
fi
msg+="The team's NORTH STAR is in brain/memory/shared/north-star.md — keep all work "
msg+="and recommendations aligned to it. "
msg+="START THE SESSION by briefing ${who} in three short buckets, pulled from "
msg+="brain/memory/shared/project-status.md and recent git log over brain/**: "
msg+="(1) What's new — changes since they last worked; "
msg+="(2) Built / created — what's done and ready; "
msg+="(3) Waiting — what's open, parked, or needs them next. "
msg+="Keep it tight and scannable. Then read brain/memory/index.md for deeper "
msg+="context, and capture decisions/notes into brain/ as you go (see CLAUDE.md)."

# Emit as additional context for the session.
printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":%s}}\n' \
  "$(printf '%s' "$msg" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')"

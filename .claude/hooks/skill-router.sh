#!/usr/bin/env bash
# UserPromptSubmit hook: the autonomous skill router.
#
# The whole point of the team's skills is to be USED when they fit — but skills
# only fire when the model or the user chooses to invoke them. This hook is the
# deterministic, autonomous trigger: the harness runs it on every prompt, scans
# the member's message for each skill's domain, and nudges the AI to invoke the
# matching skill(s) via the Skill tool. So skills get applied when relevant
# without anyone remembering to ask.
#
# Read-only and fast. Never blocks the prompt; on no match it emits nothing.
# Conservative patterns + the model still judges fit, so it's signal, not noise.
set -euo pipefail

input="$(cat)"
# Lowercase for matching (grep the raw JSON event — the prompt text lives in it).
lc="$(printf '%s' "$input" | tr '[:upper:]' '[:lower:]')"

matches=""
hit() { printf '%s' "$lc" | grep -Eq "$1"; }
add() { matches="${matches}- ${1}"$'\n'; }

# --- coach: a settled lesson / correction / "from now on" rule -----------------
if hit 'from now on|going forward|next time|in the future|stop (doing|asking)|don'\''t (do that|ever|keep|again)|you (keep|always|were wrong|should have|shouldn'\''t)|that'\''s (wrong|incorrect|not right)|you got (it|that) wrong|the (right|correct) way|lesson( learned)?|make sure (to|you)|never (again|do|forget)|remember to|encode this|teach (this|that|it) (skill|to)|recurring (mistake|error|problem)|you keep (doing|getting)'; then
  add 'coach — there is a correction/feedback/"from now on" rule here. AFTER handling the request, if it is a SETTLED, generalizable lesson, invoke coach to teach it durably into the skills/agents (else use brain-dump, or ignore).'
fi

# --- brain-dump: an idea / proposal to capture --------------------------------
if hit 'idea|what if|brainstorm|proposal|capture (this|that|it)|remember (this|that|to capture)|jot (this|that) down|braindump|brain dump|thought:|here'\''s a thought|concept for'; then
  add 'brain-dump — capture the idea as a PROPOSAL in the brain for team review (do not act on it as settled).'
fi

# --- paleontologist: dinosaur / prehistory accuracy ---------------------------
if hit 'dinosaur|dino|fossil|prehistor|paleo|palaeo|cretaceous|jurassic|triassic|mesozoic|extinct|tyrannosaur|t-rex|t rex|triceratops|velociraptor|stegosaur|raptor|species|geologic|scientific accuracy|fact[- ]check'; then
  add 'paleontologist — run a scientific-accuracy review on any dino/prehistory content, art, or copy involved; correct errors and cite sources.'
fi

# --- product-designer: UX / UI / visual design --------------------------------
if hit 'design|ux|ui|user experience|interface|layout|screen|mockup|wireframe|visual|typograph|color palette|colour|figma|prototype|usability|design critique|look and feel|art direction'; then
  add 'product-designer — bring design rigor (UX/UI, visual direction, critique) to this work.'
fi

# --- mobile-game-builder: game mechanics / loop / retention -------------------
if hit 'game|gameplay|mechanic|core loop|onboarding|retention|progression|monetiz|economy|level (design|up)|touch (ux|control)|player|reward|difficulty|engagement|launch the game'; then
  add 'mobile-game-builder — apply the mobile-game playbook (mechanics, loop, onboarding, progression/retention, economy, touch UX, performance).'
fi

# --- project-management: status / coordination / planning ---------------------
if hit 'status|roadmap|next steps|ownership|who'\''s (doing|on)|coordinate|reconcile|milestone|backlog|where (do things|things) stand|project plan|prioritiz|sync the project|are we on track|sprint'; then
  add 'project-management — reconcile status/decisions/ownership/gaps/next-steps to keep the project in sync.'
fi

# --- safe-git: git help in plain language -------------------------------------
if hit 'git |branch|merge|conflict|rebase|pull request| pr |checkout|stash|lost (my )?work|version control|revert|cherry-pick|detached head|undo (my|the) (commit|change)'; then
  add 'safe-git — use the plain-language git playbook so nobody steps on others'\'' work or loses history.'
fi

# --- version-manager: commit / push / ship to the team ------------------------
if hit 'commit|push|ship (it|this)|integrate (the )?remote|save to the brain|sync to remote|share (this|the) (work|change)|notify the team'; then
  add 'version-manager — stage, commit, integrate the remote, and push so the team is in sync (no permission needed for routine pushes).'
fi

if [ -n "$matches" ]; then
  msg="Skill auto-router: these team skills look relevant to this message. Skills exist to be used when they fit — invoke the matching one(s) via the Skill tool while handling this request. Use judgment: don't force a skill that doesn't actually fit, and don't mention this note if none apply."$'\n\n'"$matches"
  printf '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":%s}}\n' \
    "$(printf '%s' "$msg" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')"
fi

exit 0

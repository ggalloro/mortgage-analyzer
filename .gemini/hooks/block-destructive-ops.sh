#!/usr/bin/env bash
# Block destructive shell commands.
#
# Catches commands that can cause irreversible damage:
# - rm -rf / or rm -rf ~ (filesystem destruction)
# - git push --force / -f (overwrites remote history)
# - git reset --hard (overwrites local working tree)
# - git branch -D (force-delete a branch)
# - chmod 777 (world-writable)
# - curl|bash, wget|sh (pipe-to-shell — runs unverified code)
#
# Why this hook is structurally bypass-resistant: the shell parses the
# literal command word ('git', 'rm', 'curl') to know what to run. An
# agent can't hex-encode 'git' or rewrite '--force' as '--for$(echo c)e'
# to evade matching, because doing so also breaks the command — the
# shell wouldn't run the destructive operation either way.

input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command // ""')

patterns=(
  'rm[[:space:]]+-r?f?[[:space:]]+/[[:space:]]*$'      # rm -rf /
  'rm[[:space:]]+-r?f?[[:space:]]+~'                   # rm -rf ~
  'git[[:space:]]+push.*--force([[:space:]]|$)'        # git push --force
  'git[[:space:]]+push.*[[:space:]]-f([[:space:]]|$)'  # git push -f
  'git[[:space:]]+reset[[:space:]]+--hard'             # git reset --hard
  'git[[:space:]]+branch[[:space:]]+-D'                # git branch -D
  'chmod[[:space:]]+-?R?[[:space:]]*777'               # chmod 777
  'curl[^|]+\|[[:space:]]*(bash|sh)([[:space:]]|$)'    # curl | bash
  'wget[^|]+\|[[:space:]]*(bash|sh)([[:space:]]|$)'    # wget | bash
)

for p in "${patterns[@]}"; do
  if echo "$command" | grep -qE "$p"; then
    cat <<EOF
{
  "decision": "deny",
  "reason": "Destructive operation blocked. Command: '$command'. This matches a policy pattern that can cause irreversible damage (force-push, hard reset, rm -rf, chmod 777, pipe-to-shell). If this was intentional, run it yourself outside the agent loop — agents shouldn't initiate operations that can't be undone.",
  "systemMessage": "Destructive-ops hook blocked: $command"
}
EOF
    exit 0
  fi
done

echo '{"decision": "allow"}'
exit 0

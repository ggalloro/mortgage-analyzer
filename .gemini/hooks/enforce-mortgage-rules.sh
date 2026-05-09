#!/usr/bin/env bash
# Enforce eu-mortgage-rules thresholds on lib/calculations.ts.
#
# The eu-mortgage-rules skill defines:
#   DTI          <= 0.40 (warning), > 0.40 fail
#   LTV          <= 0.90 (warning), > 0.90 fail
#   stressed DTI <= 0.45 (warning), > 0.45 fail
#
# Approach: don't pattern-match what's forbidden (the agent will route
# around any list of forbidden values — `<= 0.5`, `<= 50/100`, `<= 1/2`,
# `<= 0.4 + 0.1`, etc.). Instead, assert that the canonical threshold
# expressions are still present in the post-write file. Any edit that
# removes them — by direct change or syntactic obfuscation — is denied.

input=$(cat)

file_path=$(echo "$input" | jq -r '.tool_input.file_path // ""')
tool_name=$(echo "$input" | jq -r '.tool_name // ""')

# Scope: only enforce on lib/calculations.ts
case "$file_path" in
  */lib/calculations.ts) ;;
  *)
    echo '{"decision": "allow"}'
    exit 0
    ;;
esac

# Canonical threshold expressions per eu-mortgage-rules
required=(
  "ratio <= 0.35"
  "ratio <= 0.4"
  "ratio <= 0.8"
  "ratio <= 0.9"
  "stressedRatio <= 0.4"
  "stressedRatio <= 0.45"
)

# Compute what the file would look like after this write
if [ "$tool_name" = "write_file" ]; then
  new_content=$(echo "$input" | jq -r '.tool_input.content // ""')
elif [ "$tool_name" = "replace" ] && [ -f "$file_path" ]; then
  old_str=$(echo "$input" | jq -r '.tool_input.old_string // ""')
  new_str=$(echo "$input" | jq -r '.tool_input.new_string // ""')
  current=$(cat "$file_path")
  # Literal substring substitution (quotes prevent glob expansion)
  new_content="${current//"$old_str"/"$new_str"}"
else
  # Unknown tool, or replace on a non-existent file — allow
  echo '{"decision": "allow"}'
  exit 0
fi

# Assert every canonical threshold remains in the post-write content
for req in "${required[@]}"; do
  if ! echo "$new_content" | grep -qF "$req"; then
    cat <<EOF
{
  "decision": "deny",
  "reason": "Domain rule violation in lib/calculations.ts: canonical threshold '$req' is missing from the post-write file. The eu-mortgage-rules skill defines DTI <= 0.40, LTV <= 0.90, stressed DTI <= 0.45 as the regulatory ceilings; this hook enforces them at the file boundary. To change the policy, update .gemini/skills/eu-mortgage-rules/SKILL.md first, then update this hook to match.",
  "systemMessage": "Mortgage-rules hook blocked: canonical threshold '$req' would be removed"
}
EOF
    exit 0
  fi
done

echo '{"decision": "allow"}'
exit 0

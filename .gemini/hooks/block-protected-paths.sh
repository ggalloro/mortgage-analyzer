#!/usr/bin/env bash
# Block writes to security-critical paths.
#
# Without this hook, an agent with broad write access (feature-dev has
# tools: ["*"]) could modify its own configuration: agent definitions,
# the hook scripts that constrain it, settings.json, .env files, .git
# internals, etc. This hook makes those paths read-only at the tool
# boundary regardless of which agent issues the call.
#
# Triggered on write_file and replace; both expose tool_input.file_path.
# A run_shell_command bypass (e.g. `cat > .gemini/...`) is out of scope
# here — see DEMO-SCRIPT.md "honesty beat".

input=$(cat)

file_path=$(echo "$input" | jq -r '.tool_input.file_path // ""')

case "$file_path" in
  */.gemini/hooks/*|*/.gemini/settings.json|*/.gemini/agents/*|*/.gemini/skills/*|*/.env|*/.env.*|*/.git/*|*/.ssh/*|*/.aws/*)
    cat <<EOF
{
  "decision": "deny",
  "reason": "Path Policy: writing to '$file_path' is not allowed. This path is protected (security configs, agent definitions, skills, env files, or version control internals). The repo owner must make changes here outside the agent loop.",
  "systemMessage": "Protected-path hook blocked write to: $file_path"
}
EOF
    exit 0
    ;;
esac

echo '{"decision": "allow"}'
exit 0

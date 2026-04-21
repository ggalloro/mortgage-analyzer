# MortgageCheck

A Next.js application that evaluates mortgage feasibility against European underwriting practice. Users enter their financial details (in EUR) and get an instant assessment — approved, conditionally approved, or denied — with a per-criterion breakdown (DTI ratio, LTV ratio, employment contract type, and a +3% rate stress test).

## Tech stack

- Next.js 15 (App Router) with React 19 and TypeScript (strict)
- Tailwind CSS 3
- Vitest for unit and API tests

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000 and submit a sample analysis.

To run the test suite:

```bash
npm test
```

## Gemini CLI assets

This repository ships a feature-delivery pipeline built on Gemini CLI subagents and skills. The relevant files:

- **`GEMINI.md`** — project context auto-loaded by Gemini CLI. Describes the app, tech stack, structure, the subagent pipeline, and the skills shipped with the project.
- **`.gemini/agents/`** — subagent definitions (Markdown files with YAML frontmatter):
  - `architect` — designs implementation plans (read + write plans only).
  - `feature-dev` — implements features (full access).
  - `security-auditor` — security review (read-only, writes `SECURITY-REPORT.md`).
  - `test-writer` — writes and runs Vitest tests (writes only inside `__tests__/`).
  - `doc-writer` — generates `README.md` and docs.
  - `code-reviewer` — reviews against the plan, writes `CODE-REVIEW.md`.
  - `release-manager` — branch, commit, push, open MR.
- **`.gemini/skills/`** — agent skills following the [Agent Skills](https://agentskills.io) standard:
  - `eu-mortgage-rules` — canonical European mortgage rule spec (DTI/LTV thresholds, employment contract handling, +3% stress test). Activated by `architect`, `feature-dev`, and `test-writer`.
  - `code-review-rubric` — severity-tag system and required `CODE-REVIEW.md` structure. Activated by `code-reviewer`.
- **`.gemini/settings.json`** — enables the built-in `browser_agent` (locked to `localhost`) for live-app verification.
- **`FEATURE-REQUEST.md`** — sample feature request the pipeline runs against (amortization schedule + scenario comparison).

To reproduce the pipeline run, install [Gemini CLI](https://geminicli.com/), open this repo, and follow the prompts described in the [companion blog post](https://medium.com/google-cloud/feature-development-with-gemini-cli-subagents-a637947ee6bc).

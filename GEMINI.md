# MortgageCheck — Project Context

## Overview

MortgageCheck is a Next.js application that evaluates mortgage feasibility against European underwriting practice. Users enter their financial details (in EUR) and get an instant assessment of whether they qualify for a mortgage, with a detailed breakdown of key criteria (DTI ratio, LTV ratio, employment contract type, rate stress test).

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 3 with @tailwindcss/forms plugin
- **Architecture:** React Server Components + Client Components for interactivity

## Project Structure

```
app/
  layout.tsx           — Root layout with navigation and footer
  page.tsx             — Landing page with feature overview
  globals.css          — Tailwind imports and base styles
  analyze/
    page.tsx           — Mortgage input form and results display (Client Component)
  api/
    analyze/
      route.ts         — POST endpoint: receives financial data, returns feasibility analysis
lib/
  types.ts             — TypeScript interfaces (MortgageInput, FeasibilityResult, CriterionResult, EmploymentType)
  calculations.ts      — Business logic: monthly payment formula, DTI/LTV/employment/stress-test evaluation
```

## Key Business Logic

The feasibility analysis evaluates four criteria (DTI, LTV, employment contract type, +3% rate stress test). The canonical thresholds, formulas, and boundary values live in the **`eu-mortgage-rules`** skill at `.gemini/skills/eu-mortgage-rules/SKILL.md` — that is the source of truth for both the implementation in `lib/calculations.ts` and the sub-agents.

Overall status: All pass = approved, any warning = conditionally approved, any fail = denied.

## Skills

This project ships two agent skills under `.gemini/skills/`:

| Skill | What it contains | Consumed by |
|---|---|---|
| `eu-mortgage-rules` | DTI / LTV / employment / +3% stress test thresholds and boundary values | `architect`, `feature-dev`, `test-writer` |
| `code-review-rubric` | `[blocker]` / `[important]` / `[suggestion]` / `[nit]` tags and CODE-REVIEW.md structure | `code-reviewer` |

Skills follow the open Agent Skills standard (agentskills.io). Each is a folder with a `SKILL.md` whose `name` and `description` are auto-injected into the agent's system prompt; the body is loaded into the active agent's context on demand when the model decides the skill matches the task. Sub-agents and skills are complementary: sub-agents provide isolation and parallelism; skills provide shared, deduplicated procedural knowledge that any sub-agent can pick up.

## Sub-Agent Team

This project uses a pipeline of specialized Gemini CLI sub-agents for feature delivery:

| Agent | Role | Access | Pipeline Stage | Parallel-Safe |
|---|---|---|---|---|
| `architect` | Design implementation plans | Read + Write (plans only) | 1. Design | No — must run before build |
| `feature-dev` | Implement features | Full access | 2. Build | No — modifies core app files |
| `security-auditor` | Security review | **Read-only** | 3. Review + Validate | Yes — only reads |
| `test-writer` | Write and run tests | Full access | 3. Review + Validate | Yes — writes only in tests/ |
| `doc-writer` | Documentation generation | Read + Write files | 3. Review + Validate | Yes — writes only README.md/docs |
| `code-reviewer` | Code review | Read + git + Write (`CODE-REVIEW.md` only) | 4. Review | Yes — only reads source, writes one report file |
| `release-manager` | Create MR and release | Git + GitLab MCP | 5. Ship | No — must run last |
| `browser_agent` *(experimental, optional)* | Drive Chrome to smoke-test the running app | Browser only (allowedDomains: localhost) | 3.5. Live UI verification | N/A — runs alone, no later step depends on it |

### Pipeline with Parallel Stage

```
Sequential:  architect  →  feature-dev
Parallel:    security-auditor  +  test-writer  +  doc-writer
Optional:    browser_agent  (smoke test the live app)
Sequential:  code-reviewer  →  release-manager
```

The parallel stage works because the three agents write to completely different locations: the security auditor writes only `SECURITY-REPORT.md`, the test writer creates files only in `tests/` (or wherever Vitest is configured), and the doc writer creates only `README.md`. No overlapping writes = safe parallelism.

The optional `browser_agent` is a Gemini CLI built-in (not a Markdown agent file). It is enabled via `.gemini/settings.json` and invoked with `@browser_agent`. Because no downstream act depends on its output, it can be skipped without breaking the pipeline.

## Coding Standards

- Use TypeScript strict mode — no `any` types
- Use Tailwind CSS for all styling — no inline styles or CSS modules
- Client Components must have `"use client"` directive
- API routes must validate all input and return proper error responses
- Financial calculations must handle precision carefully (round to 2 decimal places for currency)
- All new pages must be responsive

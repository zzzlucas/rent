# AGENTS.md

## Project Context
- Stack: Vue 3 + TypeScript + Vite
- Main code: `src/`
- Build output: `dist/`
- Collaboration mode: solo developer, vibe-coding-first

## Communication
- Default language: Chinese
- Give conclusion first, then key reason
- If requirement is unclear, make minimal safe assumption and state it

## Core Engineering Rules
- Keep edits scoped to the request; avoid unrelated refactors
- Preserve app stability and route compatibility by default
- Do not edit sensitive files unless explicitly requested: `.env*`, lockfiles
- Do not run destructive git commands

## Validation Baseline
- Validate changes directly related to the task
- Run `npm run req:check` when requirement docs/rules are changed
- Mark anything not verified as `not verified`

## Requirement Records
- Record high-impact decisions before implementation
- Lightweight default for solo workflow:
  - Minor one-off tweaks do not require a REQ entry
  - Use `docs/requirements/project.md` by default
  - Use shared/common records only when truly cross-project reusable

## Requirement Files
- `docs/requirements/index.md`
- `docs/requirements/project.md`
- `docs/requirements/archive.md`
- `docs/requirements/review-log.md`
- `docs/requirements/conflicts.md`

## Detailed Rule References
- `docs/agent-rules/requirements-workflow.md`

## Output Requirements
- Response should include: changed files, core changes, validation, risk (if any)

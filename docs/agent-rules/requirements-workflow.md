# Requirements Workflow

## Scope
- This file defines a lightweight requirement process for solo development.

## Trigger Rules
- Create a REQ record only when at least one is true:
  - The user states a hard constraint (`must`, `do not`, `always`, `policy`).
  - The decision impacts architecture, security, data model, or compatibility.
  - The decision will affect future tasks repeatedly.

## Files
- `docs/requirements/index.md`: one-line index.
- `docs/requirements/project.md`: active project requirement details.
- `docs/requirements/archive.md`: archived entries.
- `docs/requirements/review-log.md`: weekly/monthly check log.
- `docs/requirements/conflicts.md`: conflict register.

## Entry Template
```md
### [REQ-PRJ-YYYYMMDD-XX] <Title>
- Date: YYYY-MM-DD
- Updated: YYYY-MM-DD
- Source: user | assistant
- Type: feature | constraint | decision | risk
- Priority: P0 | P1 | P2
- Scope: project
- Tags: tag1,tag2
- Statement: <one sentence>
- Rationale: <why>
- Acceptance:
  1. <criterion 1>
  2. <criterion 2>
- Status: proposed | accepted | in-progress | done | rejected | pending-confirmation
- Supersedes: none | REQ-PRJ-YYYYMMDD-XX
- Trace: `path/to/file`
```

## Sync Rules
- Any new REQ in `project.md` must be added to `index.md`.
- `priority`, `status`, `tags`, and `updated` must match between detail and index.

## Validation Gate
- Local: `npm run req:check`
- Strict/CI: `npm run req:check:strict`

## Review Cadence
- Weekly: confirm active entries and index sync.
- Monthly: archive old done/rejected items.

# Project Requirements

## Requirement Template

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

## Entries

### [REQ-PRJ-20260323-01] Initialize lightweight solo requirement workflow
- Date: 2026-03-23
- Updated: 2026-03-23
- Source: user
- Type: decision
- Priority: P1
- Scope: project
- Tags: solo,vibe,workflow
- Statement: This project uses a lightweight requirement workflow suitable for solo vibe-coding.
- Rationale: Keep process overhead low while preserving traceability for important decisions.
- Acceptance:
  1. Requirement docs exist in `docs/requirements`.
  2. A local check command validates basic consistency.
  3. Minor one-off changes can skip REQ recording.
- Status: accepted
- Supersedes: none
- Trace: `AGENTS.md`, `docs/agent-rules/requirements-workflow.md`, `scripts/requirements-guard.cjs`

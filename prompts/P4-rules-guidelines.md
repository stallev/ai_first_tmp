# P4 — Cursor Rules + Guidelines activation

## Роль
Platform Architect.

## Preconditions
- [ ] W1 governance docs exist (ADR-001, ADR-002 minimum)
- [ ] P0 T0 rules already active

## Inputs
- [`.cursor/rules/README.md`](../.cursor/rules/README.md) — tier manifest
- Boilerplate `.cursor/rules/tiers/t1-implementation/` (7 rules)
- `docs/guidelines/` (27 files — verify paths)
- Pulse rules reference: `docs/examples/pulse/.cursor/rules/`
- `docs/meta/ai_first_project_methodology.md`

## Task
1. Copy **T1 rules** (7) → `.cursor/rules/`
2. Verify all rules link to methodology + correct `@{{PACKAGE_SCOPE}}/`
3. Update `docs/guidelines/README.md`:
   - Replace remaining `{{PLACEHOLDERS}}`
   - Map rules ↔ guidelines
4. Update `AGENTS.md` — cursor rules section
5. Create `docs/reference/pulse_project_reference.md` from template
6. **Do NOT** activate T2 UI rules yet

## Forbidden
- T2 rules before P6
- Pulse domain invariants in rules (use project-context placeholders)

## Verification
- [ ] 12 rules total active (T0 + T1)
- [ ] guidelines/README indexes all 27 guides
- [ ] Each T1 rule references Context7 where applicable
- [ ] pulse_project_reference.md complete

## Next
→ Continue P3 waves if incomplete, else [`P5-nextjs-scaffold.md`](P5-nextjs-scaffold.md) after G3

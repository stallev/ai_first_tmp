# P3 — Wave Executor (W{N})

## Роль
По типу волны: **PM** (W1 product) · **Domain Architect** (W3–W4) · **UX Writer** (W2/W7) · **Security** (W5)

## Parameter
`{N}` = номер волны (1, 2, 3, … 14). **Одна сессия = одна волна.**

## Preconditions
- [ ] P2 registry canonical
- [ ] Все файлы из «Зависит от» для W{N} существуют
- [ ] Gate G2 passed for W1

## Inputs (READ FIRST)
- `docs/meta/documentation_creation_registry.md` — секция W{N}
- Все dependencies из колонки «Зависит от»
- HTML prototype (visual reference)
- Pulse example files for same wave (pattern): `docs/examples/pulse/docs/`
- **Context7** для runtime/auth/data файлов (registry §2.7)

## Task
For each row W{N}-XX **in order**:

1. Draft file with front matter (§2.2 registry)
2. Body sections per §2.3.3 matrix (type-specific)
3. Contracts: §2.3.4 template · Specs: §2.3.5 template
4. **Backlinks** in earlier files (same session)
5. Update `architecture_master_index.md` status
6. Add FM-xxx to `failure_modes_catalog.md` when applicable

## Special: W3 priority (DB-first)
If W{N} includes `database_schema_v1.md`:
- Derive from specs + prototype + interim docs
- User flows reference schema enums — not vice versa

## Special: W3 user flows
Create `docs/prds/01_product_scope/user_flows/users_mvp/*.md` from interim docs.

## Forbidden
- Skip files within wave
- Implementation code
- Second route list outside `canonical_routes.md`
- Inline domain magic strings

## Verification (per file — §2.6 registry)
- [ ] Front matter complete
- [ ] Happy + negative paths (security/race per matrix)
- [ ] Acceptance criteria incl. 1+ negative check
- [ ] Backlinks added
- [ ] No silent drift with dependencies

## Output
At end: summary table of created files + **next wave number** + gate status.

## Next
→ P3 with `{N+1}` until W14 complete, then [`P4-rules-guidelines.md`](P4-rules-guidelines.md)

# P2 — Documentation Creation Registry

## Роль
Technical Writer для AI agents.

## Preconditions
- [ ] P1 prototype OR sufficient `docs/default_docs/`
- [ ] Рекомендуется: `docs/prototypes/{{MAIN_PROTOTYPE_HTML}}` (seed) до волны W2 UX-03
- [ ] Pulse snapshot в `docs/examples/pulse/` (для образца полного W0–W14)

## Inputs
- [`documentation_creation_registry.template.md`](../docs/meta/documentation_creation_registry.template.md)
- [`ai_first_project_methodology.template.md`](../docs/meta/ai_first_project_methodology.template.md)
- Pulse full registry: `docs/examples/pulse/docs/meta/documentation_creation_registry.md`
- Interim docs + prototype

## Task
1. Создай `docs/meta/documentation_creation_registry.md` из template
2. **Адаптируй волны** под домен {{PROJECT_NAME}}:
   - Сохрани структуру §2 (requirements, matrices, contract/spec templates), **включая** §2.3.2a (критерии путей H/N/S) и §2.3.6 (DoR-ready checklist) — не ослаблять до «if applicable»
   - §6.7 и gate phase tasks — ссылка на [`phase_tasks.template.md`](../docs/meta/phase_tasks.template.md) (commit units, Paths)
   - **DB-first:** W3 data model (`database_schema_v1.md`) до W8 contracts
   - UX block UX-01..UX-10 в W2/W7
   - Замени Pulse-specific файлы на domain-specific paths
3. Создай `docs/meta/ai_first_project_methodology.md` из template
4. Выведи в чат **список файлов W1** — **не создавай их** (unless user asks)

## Context budget
**Только registry + methodology.** Не создавать PRD/contracts/code.

## Context7
Verify pinned versions in §2.7: Next.js 16.4.x (Context7 `/vercel/next.js`), Auth.js v5, Prisma v7.

## Verification
- [ ] Registry — единственный source of doc order
- [ ] §2.3 happy/negative/security/race/drift matrices present
- [ ] §2.3.2a (H/N/S triggers) и §2.3.6 (DoR-ready) сохранены; front matter содержит `Проверено по`
- [ ] Wave dependencies correct (schema before contracts)
- [ ] Links to Pulse example for full W0–W14 reference
- [ ] Methodology §3 links to registry

## Next
→ [`P3-wave-executor.md`](P3-wave-executor.md) with `{N}=1`

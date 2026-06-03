# P0 — Bootstrap проекта из boilerplate

## Роль
Software Architect (AI-first monorepo).

## Preconditions
- [ ] Репозиторий создан (пустой или с boilerplate)
- [ ] [`PLACEHOLDERS.md`](../PLACEHOLDERS.md) заполнен

## Inputs (READ FIRST)
- [`BOOTSTRAP.md`](../BOOTSTRAP.md) — полная инструкция bootstrap
- [`README.md`](../README.md)
- [`docs/meta/ai_first_project_methodology.template.md`](../docs/meta/ai_first_project_methodology.template.md)
- [`docs/reference/pulse_project_reference.template.md`](../docs/reference/pulse_project_reference.template.md)
- Pulse snapshot: [`docs/examples/pulse/`](../docs/examples/pulse/) (если доступен)

## Task
1. Скопировать содержимое boilerplate в корень проекта (если ещё не скопировано)
2. Заменить все `{{PLACEHOLDER}}` (verify: `rg '{{'`)
3. Переименовать:
   - `AGENTS.template.md` → `AGENTS.md`
   - `project-context.template.mdc` → `.cursor/rules/project-context.mdc`
4. Создать пустую структуру `docs/`:
   ```
   docs/{default_docs,prototypes,reference,examples/pulse,meta,prds,design,guidelines,implementation/mvp/{contracts,specs,phases_tasks_descriptions,tasks,guides},architecture_learning_pack,incidents}
   ```
5. Скопировать `guidelines/` из boilerplate → `docs/guidelines/`
6. Активировать **T0 cursor rules** (5 files) → `.cursor/rules/`
7. Создать `docs/guidelines/README.md` index (из boilerplate)
8. Добавить `.gitkeep` в пустые scaffold dirs

## Forbidden
- Implementation code (кроме config skeleton в P5)
- Domain-specific PRD content
- Активация T1/T2 rules

## Verification
- [ ] `AGENTS.md` exists, ссылается на methodology
- [ ] `.cursor/rules/project-context.mdc` — no unreplaced `{{`
- [ ] T0 rules (5) в `.cursor/rules/`
- [ ] `docs/meta/` готов для P2
- [ ] Guidelines скопированы (27 files)

## Next
→ [`P1-html-prototype.md`](P1-html-prototype.md) или interim `docs/default_docs/` если prototype позже

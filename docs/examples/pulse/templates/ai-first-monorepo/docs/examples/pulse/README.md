# Pulse Reference Snapshot — `docs/examples/pulse/`

**Назначение:** read-only эталон AI-first monorepo на полном Pulse stack.  
**Аудитория:** AI-агенты нового проекта ({{PROJECT_NAME}}).

---

## Что поместить сюда

При подготовке boilerplate к переносу в отдельный репозиторий скопируйте из **fitapp** (Pulse):

| Каталог / файл | Обязательность | Назначение |
|----------------|:--------------:|------------|
| `docs/meta/` | ✅ | methodology, registry (полный W0–W14) |
| `docs/prds/` | ✅ | PRD, ADR, schema, user flows |
| `docs/guidelines/` | ✅ | 27 implementation guides |
| `docs/implementation/mvp/` | ✅ | contracts, specs, phases, tasks |
| `docs/design/` | ✅ | UX contracts, canonical_routes |
| `.cursor/rules/` | ✅ | 31 rule (эталон) |
| `apps/web/src/` | SHOULD | proxy, data/, components/ patterns |
| `packages/` | SHOULD | domain, policy, db structure |
| `docs/prototypes/*.html` | SHOULD | visual reference sample |

**Не копировать:** `node_modules/`, `.next/`, `.env*`, `apps/text_data/`

---

## Использование агентами

1. **Перед изобретением паттерна** — grep в `docs/examples/pulse/`
2. **Сравнение rules** — diff `.cursor/rules/` проекта vs pulse snapshot
3. **Wave planning** — образец полного registry в `docs/examples/pulse/docs/meta/documentation_creation_registry.md`

---

## Связанные документы

- [`docs/reference/pulse_project_reference.md`](../reference/pulse_project_reference.md)
- [`prompts/00-orchestration.md`](../../prompts/00-orchestration.md)
- [`PLACEHOLDERS.md`](../../PLACEHOLDERS.md)

---

## Placeholder до заполнения

> ⚠️ Snapshot Pulse **ещё не добавлен**. Заполните каталог перед промптом P3 (documentation waves).  
> В fitapp monorepo boilerplate gitignored — snapshot добавляется локально или при экспорте в отдельный repo.

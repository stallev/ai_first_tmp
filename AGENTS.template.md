# {{PROJECT_NAME}} — Monorepo Agent Instructions

**{{PROJECT_NAME}}** — {{PRODUCT_DESCRIPTION}}  
Monorepo: **Next.js 16.2.6** App Router + Vercel + Neon PostgreSQL.

**Methodology (обязательно):** [`docs/meta/ai_first_project_methodology.md`](docs/meta/ai_first_project_methodology.md) — цикл КОНТЕКСТ → ФАЗА → КОНТРАКТ → ЗАДАЧИ → ВЕРИФИКАЦИЯ.

## Референсный проект (обязательно)

Архитектурные подходы, структура документации и паттерны разработки **наследуются** из референсного проекта **Pulse** (fitapp):

- Код и документация референса: [`docs/examples/pulse/`](docs/examples/pulse/)
- Сводка: [`docs/reference/pulse_project_reference.md`](docs/reference/pulse_project_reference.md)

**Правило:** если в документе {{PROJECT_NAME}} нет явного отличия — следовать Pulse reference architecture. Отличия стека и домена — ADR-001, ADR-002.

**Приоритет над Pulse reference:** Cursor Rules и Guidelines **текущего проекта** важнее reference-кода Pulse.

## Monorepo structure (целевая)

| Путь | Назначение |
|------|------------|
| [`apps/web`](apps/web/AGENTS.md) | Next.js App Router (тонкий BFF) |
| `apps/workers` | Фоновые задачи (Vercel Cron; см. ADR-001) |
| `packages/domain` | Чистые бизнес-правила |
| `packages/policy/edge` | JWT-only проверки. **Без DB.** |
| `packages/policy/server` | Object-level проверки с Prisma |
| `packages/db` | Prisma schema — канон: [`database_schema_v1.md`](docs/prds/03_data_model/database_schema_v1.md) |

## Cross-package rules

- `apps/*` handlers = тонкие адаптеры. Логика в `packages/`
- **Запрещено** импортировать `packages/policy/server` из `proxy.ts` / `middleware.ts`
- Domain literals — `@{{PACKAGE_SCOPE}}/domain`; user-visible текст — `@/lib/messages`
- Долгие операции — **не в request path** → workers/cron
- Post-MVP поля — nullable в схеме с первого дня

## Иерархия источников истины

**Cursor Rules** → **AGENTS.md** → **Contracts** → **PRD** → **Guidelines** → **Prototype (visual only)**

## Документация — точки входа

| Область | Документ |
|---------|----------|
| Методология | [`docs/meta/ai_first_project_methodology.md`](docs/meta/ai_first_project_methodology.md) |
| **Реестр создания docs** | [`docs/meta/documentation_creation_registry.md`](docs/meta/documentation_creation_registry.md) |
| Карта архитектуры | [`docs/prds/architecture_master_index.md`](docs/prds/architecture_master_index.md) |
| MVP scope | [`docs/prds/01_product_scope/mvp_scope.md`](docs/prds/01_product_scope/mvp_scope.md) |
| Database schema | [`docs/prds/03_data_model/database_schema_v1.md`](docs/prds/03_data_model/database_schema_v1.md) |
| Guidelines + Rules | [`docs/guidelines/README.md`](docs/guidelines/README.md) |
| Prompt orchestration | [`prompts/00-orchestration.md`](prompts/00-orchestration.md) |
| Pulse reference | [`docs/examples/pulse/`](docs/examples/pulse/) |

## Цикл работы агента

```
КОНТЕКСТ → ФАЗА → КОНТРАКТ → ЗАДАЧИ → ВЕРИФИКАЦИЯ
```

1. Прочитать этот файл + `project-context.mdc`
2. Определить фазу (`docs/implementation/mvp/phases_tasks_descriptions/P{N}_*.md`)
3. Прочитать contracts для фазы
4. Выполнить чеклист `docs/implementation/mvp/tasks/P{N}_tasks.md`
5. `npm run typecheck` + `npm run lint` перед DoD

## Stack (full Pulse)

Next.js 16.2.6 · Vercel · Neon PG 17 · Prisma v7 · Auth.js v5 · Resend (post-MVP) · AWS S3 · Sentry · shadcn/ui · Tailwind v4 · Sonner

## Repository status

**Текущая фаза:** {{CURRENT_PHASE}}. См. [`documentation_creation_registry.md`](docs/meta/documentation_creation_registry.md) для статуса документации.

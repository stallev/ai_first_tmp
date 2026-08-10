# {{PROJECT_NAME}} — Monorepo Agent Instructions

**{{PROJECT_NAME}}** — {{PRODUCT_DESCRIPTION}}  
Monorepo: **Next.js 16.3.0** App Router + Vercel + Neon PostgreSQL.

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

Полный канонический список — [`.cursor/rules/project-context.mdc`](.cursor/rules/project-context.mdc) § Source-of-truth order. Не дублировать список здесь.

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
4. **Перед написанием/правкой кода** — прочитать применимые `.cursor/rules/*.mdc` для затрагиваемой области (индекс: [`.cursor/rules/README.md`](.cursor/rules/README.md) или таблица в `app-conventions` skill). Эти файлы — enforceable и имеют приоритет над `docs/examples/pulse/**` при конфликте (Pulse — донор/референс, не источник истины).
   Индекс в `.cursor/skills/app-conventions` может быть не виден Claude Code (в репозитории нет `.claude/skills/`) — при сомнении читать `.cursor/rules/` напрямую, не полагаясь только на skill.
5. Выполнить чеклист `docs/implementation/mvp/tasks/P{N}_tasks.md`
6. `npm run typecheck` + `npm run lint` перед DoD

## Commit & review

| Задача | Rule |
|--------|------|
| Commit (verify → review → message → hook) | **`.cursor/rules/agent-commit-pipeline.mdc`** (always) |
| Standalone review («review diff», проверка перед PR) | **`.cursor/rules/agent-code-review-subagent.mdc`** (requestable) |

Кратко: prefix = `git branch --show-current`; формат `<branch-name>: type(scope): subject`.

## Agent skills (`.cursor/skills/`)

| Skill | When |
|-------|------|
| **`app-conventions`** | New features, routes, components — project layout + RSC patterns (single project skill) |

**Do not install** external Next.js architecture skills (`npx skills install …`). Patterns from [nextjs-app-architecture-skill](https://github.com/aurorascharff/nextjs-app-architecture-skill) are in-repo only: [`docs/reference/adr_010_nextjs_app_architecture_skill.md`](docs/reference/adr_010_nextjs_app_architecture_skill.md) · spec: [`docs/project-react-skill-requirements.md`](docs/project-react-skill-requirements.md).

Web detail: [`apps/web/AGENTS.md`](apps/web/AGENTS.md) § Skills.

## Stack (full Pulse)

Next.js 16.3.0 · Vercel · Neon PG 17 · Prisma v7 · Auth.js v5 · Resend (post-MVP) · AWS S3 · Sentry · shadcn/ui · Tailwind v4 · Sonner

## Repository status

**Текущая фаза:** {{CURRENT_PHASE}}. См. [`documentation_creation_registry.md`](docs/meta/documentation_creation_registry.md) для статуса документации.

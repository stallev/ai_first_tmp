# AI-First Project Methodology — {{PROJECT_NAME}}
## Архитектура, методология разработки и система документации

**Проект:** {{PROJECT_NAME}} — {{PRODUCT_DESCRIPTION}}  
**Версия:** 1.0  
**Статус:** Template — заполнить при bootstrap (промпт P2)  
**Референс:** Pulse (fitapp) — [`docs/examples/pulse/`](../../examples/pulse/) · [`pulse_project_reference.md`](../reference/pulse_project_reference.md)

> **Template note:** полный образец methodology — `docs/examples/pulse/docs/meta/ai_first_project_methodology.md`

---

## Введение

Документ описывает AI-first подход к разработке **{{PROJECT_NAME}}**. Структура наследуется из Pulse reference, адаптируется под домен и interim docs в [`{{INTERIM_DOCS_GLOB}}`](../../default_docs/) и [`docs/prototypes/`](../../prototypes/).

**Цель:** AI-агенты следуют задокументированным контрактам, а не изобретают архитектуру.

**Порядок создания документов:** [`documentation_creation_registry.md`](./documentation_creation_registry.md) (создаётся из template в P2).

---

## 1. Архитектурный шаблон

### 1.1 Двухконтурная модель

**Контур A — Web (UI + BFF)** — Next.js 16.2.6 на Vercel  
**Контур B — Jobs** — Vercel Cron + serverless; не в request path

| Компонент | Технология |
|-----------|-----------|
| Framework | Next.js **16.2.6** (pinned), App Router, `proxy.ts` |
| Hosting | Vercel |
| DB | Neon PostgreSQL 17 + Prisma v7 |
| Auth | Auth.js v5, Credentials, JWT |
| UI | shadcn/ui + Tailwind CSS v4 |
| Email | Resend (post-MVP; schema-ready) |
| Storage | AWS S3 (presigned) |
| Observability | Sentry |
| Toasts | Sonner |

### 1.2 Монорепо

```
monorepo/
├── apps/web/          — Next.js (тонкий BFF)
├── apps/workers/      — Cron / jobs (MVP: may live in apps/web)
└── packages/
    ├── domain/        — чистые правила (без Next/DB)
    ├── policy/edge/   — JWT-only
    ├── policy/server/ — Prisma object checks
    └── db/            — Prisma schema (единственное DDL)
```

**Правила импорта:** см. `monorepo_boundaries_contract.md` (W8) · образец: `docs/examples/pulse/docs/implementation/mvp/contracts/`

### 1.3 Domain invariants (заполнить в W3)

1. {{DOMAIN_INVARIANT_1}}
2. {{DOMAIN_INVARIANT_2}}
3. {{DOMAIN_INVARIANT_3}}
4. {{DOMAIN_INVARIANT_4}}
5. {{DOMAIN_INVARIANT_5}}

---

## 2. Методология AI-first

### 2.1 Принцип

Документация = **runtime-инструкция** для агента. Перед изобретением паттерна — проверить Pulse reference и guidelines.

### 2.2 Цикл агента

```
КОНТЕКСТ → ФАЗА → КОНТРАКТ → ЗАДАЧИ → ВЕРИФИКАЦИЯ
```

| Шаг | Действие |
|-----|----------|
| КОНТЕКСТ | `AGENTS.md` + `project-context.mdc` |
| ФАЗА | `P{N}_phase_description.md` |
| КОНТРАКТ | `docs/implementation/mvp/contracts/` |
| ЗАДАЧИ | `P{N}_tasks.md` |
| ВЕРИФИКАЦИЯ | typecheck, lint, phase DoD |

### 2.3 AGENTS.md

Корень monorepo + `apps/web/AGENTS.md` — из templates boilerplate.

### 2.4 Cursor Rules (tiers)

| Tier | Когда | Manifest |
|------|-------|----------|
| T0 | Bootstrap | `.cursor/rules/README.md` §T0 |
| T1 | Implementation | §T1 |
| T2 | Design Lab | §T2 |

### 2.5 Фазовая декомпозиция

```
docs/implementation/mvp/
├── phases_tasks_descriptions/P{N}_phase_description.md
└── tasks/P{N}_tasks.md
```

Образец фаз P01–P14: `docs/examples/pulse/docs/implementation/mvp/phases_tasks_descriptions/`

### 2.6 Contracts

Формат: §2.3.4 registry — Happy / Negative / Security / Concurrency / Drift / Acceptance.

### 2.7 Guidelines

`docs/guidelines/` — 27 guides (included in boilerplate). Индекс: [`README.md`](../../guidelines/README.md)

---

## 3. Структура документации

См. §3.1 в `documentation_creation_registry.template.md` и полный образец Pulse registry.

**Иерархия истины:** Cursor Rules → AGENTS.md → Contracts → PRD → Guidelines → Prototype (visual only)

---

## 4. Типология документов

PRD · ADR · Contract · Spec · Phase · Tasks · Guideline · Cursor Rule · Wireframe · Learning Pack

Образцы каждого типа — в `docs/examples/pulse/docs/`

---

## Agent notes

- HTML prototype — **не** канон; при конфликте — PRD/schema
- Context7 перед runtime docs: Next.js 16.2.6, Auth.js v5, Prisma v7
- Одна сессия = одна doc wave или 1–3 файла внутри волны
- DB-first: `database_schema_v1.md` до domain contracts

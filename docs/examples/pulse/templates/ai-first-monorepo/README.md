# AI-First Monorepo Boilerplate

Шаблон для создания новых проектов на стеке **Next.js 16.2.6 + Vercel + Neon PostgreSQL + Prisma v7 + Auth.js v5 + shadcn/ui + Tailwind v4**.

**Методология:** [`docs/meta/ai_first_project_methodology.template.md`](docs/meta/ai_first_project_methodology.template.md)  
**Bootstrap (пошагово):** [`BOOTSTRAP.md`](BOOTSTRAP.md)  
**Оркестрация промптов:** [`prompts/00-orchestration.md`](prompts/00-orchestration.md)  
**Референсный проект (read-only):** [`docs/examples/pulse/`](docs/examples/pulse/) — полная реализация Pulse (fitapp)

> **Примечание:** каталог `templates/ai-first-monorepo/` в fitapp добавлен в `.gitignore` — содержимое переносится в отдельный репозиторий. При переносе скопируйте также snapshot Pulse в `docs/examples/pulse/`.

---

## Быстрый старт

Полная инструкция: **[`BOOTSTRAP.md`](BOOTSTRAP.md)**

1. Скопируйте boilerplate в корень нового репозитория
2. Заполните placeholders (см. [`PLACEHOLDERS.md`](PLACEHOLDERS.md))
3. Поместите snapshot Pulse в `docs/examples/pulse/` (код + docs из fitapp)
4. Запустите промпты по порядку: **P0 → P1 → P2 → P3-W* → P4 → P5 → P6 → P7+**
5. Активируйте cursor rules по tier manifest: [`.cursor/rules/README.md`](.cursor/rules/README.md)

---

## Структура

```
├── BOOTSTRAP.md                      → пошаговый bootstrap нового проекта
├── AGENTS.template.md              → AGENTS.md после bootstrap
├── PLACEHOLDERS.md                   → список {{PLACEHOLDER}} для замены
├── .cursor/rules/                    → 31 rule (Pulse stack, parameterized)
│   ├── tiers/                        → t0 / t1 / t2 — порядок активации
│   └── README.md                     → manifest
├── guidelines/                       → 28 guides (full Pulse stack + S3)
├── docs/
│   ├── meta/                         → methodology + registry templates
│   ├── reference/                    → pulse_project_reference.template.md
│   └── examples/pulse/               → snapshot референса (заполнить вручную)
├── prompts/                          → P0–P6 + orchestration
├── specs/                            → design_system_lab_spec.template.md
└── scaffold/                         → пустой monorepo skeleton
```

---

## Cursor Rules — tiers

| Tier | Когда активировать | Кол-во |
|------|-------------------|--------|
| **T0** | Bootstrap (день 0) | 5 rules — alwaysApply |
| **T1** | Docs phase + scaffold | 7 rules — implementation |
| **T2** | Design System Lab (P6) | 15 rules — UI/React |

Полный список: [`.cursor/rules/README.md`](.cursor/rules/README.md)

---

## Stack (full Pulse)

| Компонент | Технология |
|-----------|-----------|
| Framework | Next.js **16.2.6** (pinned), App Router, `proxy.ts` |
| Hosting | Vercel |
| DB | Neon PostgreSQL 17 + Prisma v7 |
| Auth | Auth.js v5, Credentials, JWT |
| Email | Resend (post-MVP; schema-ready on MVP) |
| Storage | AWS S3 (presigned PUT/GET) |
| Observability | Sentry (`@sentry/nextjs`) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Toasts | Sonner |

---

## Иерархия источников истины

1. Cursor Rules → 2. AGENTS.md → 3. Contracts → 4. PRD → 5. Guidelines → 6. HTML prototype (visual only)

Reference code (`docs/examples/pulse/`) — **architecture patterns only**; project Rules override reference code.

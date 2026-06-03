# AI-First Monorepo Boilerplate

Шаблон для создания новых проектов на стеке **Next.js 16.2.6 + Vercel + Neon PostgreSQL + Prisma v7 + Auth.js v5 + shadcn/ui + Tailwind v4**.

**Методология:** [`docs/meta/ai_first_project_methodology.template.md`](docs/meta/ai_first_project_methodology.template.md)  
**Bootstrap (пошагово):** [`BOOTSTRAP.md`](BOOTSTRAP.md)  
**Оркестрация промптов:** [`prompts/00-orchestration.md`](prompts/00-orchestration.md)

---

## Референсный проект: Pulse

Полная реализация **Pulse** (fitapp) — read-only эталон архитектуры, AI-first docs и feature-паттернов:

- Код и документация: [`docs/examples/pulse/`](docs/examples/pulse/)
- Сводка и приоритеты: [`docs/reference/pulse_project_reference.md`](docs/reference/pulse_project_reference.md)
- Stack-паттерны: [`docs/reference/stack_patterns_from_pulse.md`](docs/reference/stack_patterns_from_pulse.md)

**Важно:** **Cursor Rules** и **Guidelines** boilerplate **важнее** reference-кода Pulse. Pulse — образец структуры и flows; при конфликте следовать Rules/Guidelines текущего проекта.

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
├── AGENTS.template.md                → AGENTS.md после bootstrap
├── PLACEHOLDERS.md                   → список {{PLACEHOLDER}} для замены
├── .cursor/rules/                    → 29 rules (Pulse stack, parameterized)
│   ├── tiers/                        → t0 / t1 / t2 — порядок активации
│   └── README.md                     → manifest
├── guidelines/                       → канон реализации (индекс: README.md)
│   ├── security/                     → XSS, CSRF, CSP
│   ├── nextjs/                       → data, loading, lazy load, S3
│   └── react/                        → components, a11y, rendering perf
├── docs/
│   ├── general/                      → Senior deep dives (теория → guidelines)
│   ├── guidelines/README.md          → alias к guidelines/ (путь Pulse)
│   ├── meta/                         → methodology + registry templates
│   ├── reference/                    → pulse_project_reference.md, stack patterns
│   └── examples/pulse/               → snapshot референса (заполнить вручную)
├── prompts/                          → P0–P6 + orchestration
├── specs/                            → design_system_lab_spec.template.md
└── scaffold/                         → пустой monorepo skeleton
```

---

## Документация для агентов

| Каталог | Назначение |
|---------|------------|
| [`guidelines/`](guidelines/README.md) | Операционные нормы реализации (Next.js, React, Auth, Security, TypeScript) |
| [`.cursor/rules/`](.cursor/rules/README.md) | MUST для агента — tiers T0 / T1 / T2 |
| [`docs/general/`](docs/general/README.md) | Senior deep dives; нормы синтезированы в guidelines/rules |
| [`docs/general/ai_agent_ui_ux_guideline.md`](docs/general/ai_agent_ui_ux_guideline.md) | FX-1–FX-10, overlay tree, pre-merge UI checklist |
| [`docs/examples/pulse/`](docs/examples/pulse/) | Reference: architecture, contracts, phases, code patterns |

### Practices из `docs/general/` → guidelines

| Deep dive | Guideline | Cursor rule |
|-----------|-----------|-------------|
| [Security (XSS/CSRF)](docs/general/01-security-xss-csrf.md) | [`guidelines/security/`](guidelines/security/) | **security-xss-csrf** |
| [Data fetching](docs/general/02-data-fetching.md) | [`ai_data_fetching_patterns.md`](guidelines/nextjs/ai_data_fetching_patterns.md) | **data-server-actions-and-api** |
| [Accessibility](docs/general/03-accessibility.md) | [`ai_semantics_a11y_guidelines.md`](guidelines/react/ai_semantics_a11y_guidelines.md) | **ui-semantics-a11y** |
| [Code splitting](docs/general/04-code-splitting.md) | [`ai_client_lazy_loading.md`](guidelines/nextjs/ai_client_lazy_loading.md) | **react-ui-components** |
| [Browser rendering](docs/general/05-browser-rendering.md) | [`ai_browser_rendering_performance.md`](guidelines/react/ai_browser_rendering_performance.md) | **ui-animation-performance** |

---

## Cursor Rules — tiers

| Tier | Когда активировать | Кол-во |
|------|-------------------|--------|
| **T0** | Bootstrap (день 0) | 5 rules — alwaysApply |
| **T1** | Docs phase + scaffold | 8 rules — implementation (+ security-xss-csrf) |
| **T2** | Design System Lab (P6) | 16 rules — UI/React (+ ui-animation-performance) |

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

1. **Cursor Rules** (`.cursor/rules/*.mdc`)
2. **AGENTS.md**
3. **Contracts** (`docs/implementation/mvp/contracts/`)
4. **PRD** (`docs/prds/`)
5. **Guidelines** (`guidelines/`)
6. **General deep dives** (`docs/general/`) — теория; операционный канон в guidelines
7. **Pulse reference** (`docs/examples/pulse/`) — architecture & feature patterns; **не override Rules/Guidelines**
8. **HTML prototype** — visual reference only

Подробнее: [`docs/reference/pulse_project_reference.md`](docs/reference/pulse_project_reference.md)

# AI-First Monorepo Starter

> Spec-first workflow template for building Next.js monorepos with AI coding agents (Claude Code, Cursor): agent rules, subagent roles, a single review gate and step-by-step bootstrap prompts. A starting point, not a product.

**Стартовый шаблон** (не продукт) для создания новых проектов на стеке **Next.js 16.4 + Vercel + Neon PostgreSQL + Prisma v7 + Auth.js v5 + shadcn/ui + Tailwind v4**.

**Методология:** [`docs/meta/ai_first_project_methodology.md`](docs/meta/ai_first_project_methodology.md)  
**Bootstrap (пошагово):** [`BOOTSTRAP.md`](BOOTSTRAP.md)  
**Оркестрация промптов:** [`prompts/00-orchestration.md`](prompts/00-orchestration.md)

---

## Что это и зачем

AI-агент быстро пишет код, но без контракта сам придумывает архитектуру и расходится с документацией. Шаблон задаёт процесс, в котором документация — runtime-инструкция для агента, а каждый шаг имеет проверяемый критерий готовности.

- **Спецификация раньше кода.** Задача берётся в работу, только если проходит Definition of Ready: ссылки на разделы спецификации, проверяемые Acceptance, названные файлы и пути проверки.
- **Правила по уровням.** Rules активируются по мере bootstrap (T0 → T1 → T2), а не все сразу. Состав уровней — в [манифесте](.cursor/rules/README.md).
- **Роли агентов.** Оркестратор пишет код готовых задач; `architect` исправляет документацию и планирует; `implementer` нужен для изоляции контекста; `reviewer` — единственный read-only review-гейт на commit unit. Модели закреплены в [`.cursor/agents/`](.cursor/agents/).
- **Один review на commit unit.** Уровень review зависит от содержимого diff, а не от типа коммита ([`agent-code-review-subagent.mdc`](.cursor/rules/agent-code-review-subagent.mdc)).
- **Детерминированные проверки до review.** `rules:check`, `deps:check`, `encoding:check`, `docs:links` — см. [`package.json`](package.json).
- **Профиль качества.** `prototype` / `lean` / `standard` / `strict` задаёт объём документации, тестов и review под стадию проекта ([`P00`](prompts/P00-quality-profile.md)).

## Как идёт работа

```
КОНТЕКСТ → TIER / DoR → ФАЗА → КОНТРАКТ → ЗАДАЧИ (CU) → [SPEC-GAP] → РЕАЛИЗАЦИЯ → ВЕРИФИКАЦИЯ → REVIEW (CU) → COMMIT
```

Подробно: [методология](docs/meta/ai_first_project_methodology.md) §2.2, маршрутизация и делегирование — [`ai_agent_model_routing.md`](docs/meta/ai_agent_model_routing.md).

## Для кого

Для одного разработчика или небольшой команды, которые строят продукт на Next.js с помощью Claude Code или Cursor и хотят воспроизводимый процесс вместо ad-hoc промптов.

## Границы

- Здесь нет прикладного кода и продуктовой документации: только методология, правила, guidelines, промпты и scaffold.
- Параллельная работа агентов допускается только для шагов с непересекающимися `Files` ([`model-routing.mdc`](.cursor/rules/model-routing.mdc) §2); по умолчанию процесс рассчитан на последовательную работу с контролем стоимости.
- [Pulse](docs/examples/pulse/) — read-only снимок референса, не канон: при конфликте Rules и Guidelines важнее.

---

## Референсный проект: Pulse

Полная реализация **Pulse** (fitapp) — read-only эталон архитектуры, AI-first docs и feature-паттернов:

- Код и документация: [`docs/examples/pulse/`](docs/examples/pulse/)
- Сводка и приоритеты: [`docs/reference/pulse_project_reference.md`](docs/reference/pulse_project_reference.md)
- Stack-паттерны: [`docs/reference/stack_patterns_from_pulse.md`](docs/reference/stack_patterns_from_pulse.md)

**Важно:** **Cursor Rules** и **Guidelines** boilerplate **важнее** reference-кода Pulse. Pulse — образец структуры и flows; при конфликте следовать Rules/Guidelines текущего проекта.

> Snapshot Pulse уже включён в шаблон. Сопровождение самого шаблона — [`AGENTS.md`](AGENTS.md).

---

## Быстрый старт

Полная инструкция: **[`BOOTSTRAP.md`](BOOTSTRAP.md)**

1. Создайте репозиторий из шаблона (GitHub **Use this template** или `git clone`)
2. **Выберите профиль качества** — [`prompts/P00-quality-profile.md`](prompts/P00-quality-profile.md): `prototype` / `lean` / `standard` / `strict` определяет объём документации, тестов, review и модули стека
3. Заполните placeholders (см. [`PLACEHOLDERS.md`](PLACEHOLDERS.md))
4. **Рекомендуется:** visual seed в `docs/prototypes/` ([`prompts/P1-html-prototype-claude-desktop.md`](prompts/P1-html-prototype-claude-desktop.md))
5. Запустите промпты по порядку: **P0 → P1 → P2 → P3-W* → P4 → P5 → P6 → P7+**
6. Rules T1 / T2 активируются промптами P4 / P6 по манифесту [`.cursor/rules/README.md`](.cursor/rules/README.md)

---

## Структура

```
├── AGENTS.md                         → сопровождение шаблона (заменяется в проекте)
├── BOOTSTRAP.md                      → пошаговый bootstrap нового проекта
├── AGENTS.template.md                → AGENTS.md проекта после bootstrap
├── CLAUDE.md                         → @AGENTS.md + Claude rules pointer
├── package.json                      → rules:sync / rules:check / deps:check / encoding:check / docs:links / psi:lab
├── scripts/sync-claude-rules.mjs
├── scripts/psi-lab/                  → lab PageSpeed Insights (REST, deployed origin)
├── .claude/rules/                    → generated from .mdc (git)
├── PLACEHOLDERS.md                   → список {{PLACEHOLDER}} для замены
├── .cursor/rules/                    → T0–T2 rules (Pulse stack + psi-lab-testing)
│   ├── tiers/                        → t0 / t1 / t2 — SoT правил
│   └── README.md                     → manifest
├── docs/
│   ├── guidelines/                   → канон реализации (индекс: README.md)
│   │   ├── security/                 → XSS, CSRF, CSP
│   │   ├── nextjs/                   → data, loading, lazy load, S3, lab PSI
│   │   └── react/                    → components, a11y, rendering perf
│   ├── general/                      → Senior deep dives (теория → guidelines)
│   ├── meta/                         → methodology + registry templates
│   ├── reference/                    → pulse_project_reference.md, stack patterns
│   ├── claude-code-cursor-rules-sync.md
│   └── examples/pulse/               → snapshot референса (заполнить вручную)
├── prompts/                          → P00 (профиль качества), P0–P6, Claude Desktop seed, orchestration
├── specs/                            → design_system_lab_spec.template.md
└── scaffold/                         → пустой monorepo skeleton
```

---

## Документация для агентов

| Каталог | Назначение |
|---------|------------|
| [`guidelines/`](docs/guidelines/README.md) | Операционные нормы реализации (Next.js, React, Auth, Security, TypeScript) |
| [`.cursor/rules/`](.cursor/rules/README.md) | MUST для агента — tiers T0 / T1 / T2 |
| [`docs/general/`](docs/general/README.md) | Senior deep dives; нормы синтезированы в docs/guidelines/rules |
| [`docs/general/ai_agent_ui_ux_guideline.md`](docs/general/ai_agent_ui_ux_guideline.md) | FX-1–FX-10, overlay tree, pre-merge UI checklist |
| [`docs/examples/pulse/`](docs/examples/pulse/) | Reference: architecture, contracts, phases, code patterns |
| [`CLAUDE.md`](CLAUDE.md) | Claude Code: `@AGENTS.md` + generated `.claude/rules/` (не править зеркало) |
| [`docs/claude-code-cursor-rules-sync.md`](docs/claude-code-cursor-rules-sync.md) | Playbook Cursor `.mdc` → Claude `.md` (`rules:sync` / `rules:check`) |

### Practices из `docs/general/` → guidelines

| Deep dive | Guideline | Cursor rule |
|-----------|-----------|-------------|
| [Security (XSS/CSRF)](docs/general/01-security-xss-csrf.md) | [`docs/guidelines/security/`](docs/guidelines/security/) | **security-xss-csrf** |
| [Data fetching](docs/general/02-data-fetching.md) | [`ai_data_fetching_patterns.md`](docs/guidelines/nextjs/ai_data_fetching_patterns.md) | **data-server-actions-and-api** |
| [Accessibility](docs/general/03-accessibility.md) | [`ai_semantics_a11y_guidelines.md`](docs/guidelines/react/ai_semantics_a11y_guidelines.md) | **ui-semantics-a11y** |
| [Code splitting](docs/general/04-code-splitting.md) | [`ai_client_lazy_loading.md`](docs/guidelines/nextjs/ai_client_lazy_loading.md) | **react-ui-components** |
| [Browser rendering](docs/general/05-browser-rendering.md) | [`ai_browser_rendering_performance.md`](docs/guidelines/react/ai_browser_rendering_performance.md) | **ui-animation-performance** |

---

## Cursor Rules — tiers

| Tier | Когда активировать | Назначение |
|------|-------------------|------------|
| **T0** | Активен в шаблоне (состояние «после P0») | Оркестрация, commit/review, docs alignment, типы |
| **T1** | P4 (после W1) | Implementation: Next.js, auth, data, security, deps |
| **T2** | P6 (Design System Lab) | UI / React |

Состав tiers — только в манифесте: [`.cursor/rules/README.md`](.cursor/rules/README.md). SoT правила — его копия в `tiers/`.

---

## Stack (full Pulse)

| Компонент | Технология |
|-----------|-----------|
| Framework | Next.js **16.4.x** (exact current patch, baseline **16.4**), App Router, `proxy.ts` |
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

Полный канонический список — [`.cursor/rules/project-context.mdc`](.cursor/rules/project-context.mdc) § Source-of-truth order. Не дублировать список здесь.

Подробнее: [`docs/reference/pulse_project_reference.md`](docs/reference/pulse_project_reference.md)

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
- **Роли агентов.** `architect` исправляет документацию и планирует; `implementer` пишет код одного commit unit (Cursor); `doc-writer` пишет документы одной единицы волны (Claude Code); `reviewer` и `doc-reviewer` — единственные read-only review-гейты для кода и документации. Модели закреплены в [`.cursor/agents/`](.cursor/agents/).
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
4. Положите исходные материалы (см. следующий раздел): статический HTML-прототип и текстовую спецификацию
5. Запустите промпты по порядку: **P0 → P1 → P2 → P3-W* → P4 → P5 → P6 → P7+**
6. Rules T1 / T2 активируются промптами P4 / P6 по манифесту [`.cursor/rules/README.md`](.cursor/rules/README.md)

---

## Как создаётся проект

**Что нужно на входе — только два артефакта:**

1. **Статический HTML-прототип** одного файла: визуальный эталон экранов, токенов и состояний. Нет прототипа — его можно собрать из спецификации ([`P1-html-prototype-claude-desktop.md`](prompts/P1-html-prototype-claude-desktop.md)).
2. **Спецификация функционала в текстовом виде**: что делает продукт, для кого, какие роли и сценарии. Свободная форма, один или несколько `.md`/`.txt`.

Остальное — архитектуру, PRD, схему данных, контракты, правила, каркас кода и задачи по фазам — агенты выводят из этих двух артефактов и шаблона.

**Кто что пишет.** Документацию пишет **Claude Code** (Sonnet), код — **Cursor AI**. В обоих случаях чат остаётся тонким оркестратором, а работу делает свежий субагент на единицу работы; проверка, stage и commit — скрипты, не LLM. Документация и код не делят сессию.

### Этапы

| # | Этап | Что происходит | Вы делаете |
|---|------|----------------|------------|
| 0 | **Подготовка** | Репозиторий из шаблона; [`P00`](prompts/P00-quality-profile.md) фиксирует профиль качества и модули стека; заполняются [`PLACEHOLDERS.md`](PLACEHOLDERS.md) | Выбираете профиль, кладёте прототип в `docs/prototypes/`, спецификацию — в `docs/default_docs/` |
| 1 | **Каркас** — [`P0`](prompts/P0-bootstrap.md) | Проектный `AGENTS.md`, структура `docs/`, активные правила T0, **скрипты драйверов** (`scripts/`) | Проверяете чек-лист |
| 2 | **Прототип** — [`P1`](prompts/P1-html-prototype.md) | Прототип принимается как визуальный референс (не канон) | — |
| 3 | **Реестр документов** — [`P2`](prompts/P2-doc-registry.md) | Реестр адаптируется под домен и профиль; создаются файлы единиц `docs/meta/doc-waves/W{NN}_units.md` | **Утверждаете реестр (gate G2)** |
| 4 | **Документация** — волны W0–W14 ([`wave-run`](prompts/wave-run.md), Claude Code) | Волна за волной: governance и продуктовый канон → UX/UI → **модель данных** → ADR, auth, runtime → контракты → спецификации → описания фаз и задачи (CU). Проверка `doc-verify`, review нормативных документов | Закрываете gate между волнами |
| 5 | **Правила** — [`P4`](prompts/P4-rules-guidelines.md) | Активируются правила T1 (Next.js, auth, data, security) | — |
| 6 | **Каркас приложения** — [`P5`](prompts/P5-nextjs-scaffold.md) | Монорепо Next.js 16.4: `packages/{db,domain,policy}`, `apps/web`, тесты и CI по профилю | Заводите инфраструктуру (Neon, Vercel и др., [`BOOTSTRAP.md`](BOOTSTRAP.md) §6–§11) |
| 7 | **Design System Lab** — [`P6`](prompts/P6-design-system-lab.md) | Дизайн-система из токенов прототипа, активируются правила T2 | — |
| 8 | **Реализация по фазам** — [`phase-implementation`](prompts/phase-implementation.md), Cursor AI | Для каждой фазы: Phase DoR audit → `run-phase.mjs` по одной единице (CU): `implementer` пишет код → `cu-verify` → `reviewer` → `cu-commit` → hook | Запускаете фазу одной фразой, проходите smoke-проверки, делаете push и PR |

### Как устроена автоматизация

```
Документация (Claude Code)                    Код (Cursor AI)
run-wave.mjs W{NN}  ── 1 вызов = 1 DU          run-phase.mjs P{NN}  ── 1 вызов = 1 CU
  doc-writer (свежий)  → docs/**                 implementer (свежий)  → код
  doc-verify.mjs       → шапка, секции, ссылки   cu-verify.mjs         → lint, test, typecheck
  doc-reviewer         → нормативные документы   reviewer              → diff CU
  cu-commit.mjs        → stage + commit          cu-commit.mjs         → stage + commit
```

Принципы: свежий контекст на единицу работы (состояние — в чекбоксах файла задач и в git), логи в файл и хвост ~40 строк агенту, один review-гейт на единицу, любая аномалия останавливает драйвер, ничего не пушится. Каноны: [`agent-docs-orchestration.md`](docs/guidelines/agent-docs-orchestration.md) и [`agent-phase-orchestration.md`](docs/guidelines/agent-phase-orchestration.md).

### Где остаётся человек

Выбор профиля (P00), утверждение реестра (G2), gates между волнами, инфраструктура и секреты, smoke-проверки, push и PR. Между единицами работы подтверждений нет: коммиты единиц разрешены заранее (`Commit: auto`). При сбое драйвер останавливается и ждёт, а не повторяет в цикле.

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
├── prompts/                          → P00 (профиль качества), P0–P6, прогон фазы (phase-implementation), прогон волны (wave-run), Claude Desktop seed, orchestration
├── specs/                            → design_system_lab_spec.template.md
└── scaffold/                         → пустой monorepo skeleton
    └── scripts/                      → драйверы run-phase / run-wave, cu-verify, doc-verify, cu-commit (копирует P0)
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

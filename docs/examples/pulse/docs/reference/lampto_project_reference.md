# Референсный проект: lampto (BSFY)

**Статус:** зафиксирован как эталон архитектуры и AI-first разработки  
**Расположение в репозитории:** [`docs/examples/lampto/`](../examples/lampto/)  
**Не деплоится** как часть Pulse — только read-only reference для агентов и команды.

---

## Назначение

Проект **lampto** (BSFY — Bible Study For Youth) содержит отработанную систему:

- двухконтурной архитектуры (Web BFF + Jobs),
- monorepo с `packages/domain`, `packages/policy`, `packages/db`,
- AI-first документации (PRD → contracts → phases → tasks),
- Cursor Rules и `AGENTS.md` как runtime-инструкции для агентов.

Pulse **наследует подходы**, но имеет **свой домен, стек хостинга и продуктовые документы**.

---

## Приоритет: Pulse Rules > lampto code

> **Код референсного проекта (`docs/examples/lampto/`) не полностью соответствует актуальным Cursor Rules и Guidelines Pulse.**  
> Эталон lampto полезен для **архитектурных паттернов** (слои domain → policy → db → web, фазовая декомпозиция, contracts), но **не является безусловным эталоном UI-кода, naming или file-size дисциплины**.

**При разработке Pulse:**

1. **Cursor Rules** (`.cursor/rules/*.mdc`) и **Guidelines** (`docs/guidelines/`) Pulse — **канон** для UI, React, naming, mobile-first, DRY/SOLID, separation of logic/presentation.
2. **Код lampto** — read-only **reference for structure and flows**; если расходится с Pulse rules — **следовать Pulse rules**.
3. **HTML prototype Pulse** — [`Fitness_Platform_Prototype_v1.html`](../prototypes/Fitness_Platform_Prototype_v1.html) + design system; subordinate to Rules/PRD (см. **pulse-project-context** §Source-of-truth).

Явные отличия стека и домена — [ADR-001](../prds/07_governance/adr_001_stack_and_runtime.md), [ADR-002](../prds/07_governance/adr_002_next162_vercel_runtime_policy.md).

---

## Что копировать один в один (принципы)

| Область | Эталон в lampto | Применение в Pulse |
|---------|-----------------|-------------------|
| Методология AI-first | [`docs/meta/ai_first_project_methodology.md`](../examples/lampto/docs/meta/ai_first_project_methodology.md) | [`docs/meta/ai_first_project_methodology.md`](../meta/ai_first_project_methodology.md) |
| Структура `docs/` | PRD layers, guidelines, design, implementation/mvp | Та же иерархия каталогов |
| Monorepo boundaries | [`monorepo_boundaries.md`](../examples/lampto/docs/implementation/mvp/monorepo_boundaries.md) | Аналог создаётся в `docs/implementation/mvp/` |
| Layered architecture | domain → policy → db → apps | Обязательно для booking, trainer verification, reviews |
| Фазовая декомпозиция | `P{N}_phase_description.md` + `P{N}_tasks.md` | Тот же формат |
| Contracts | `implementation/mvp/contracts/` | Контракты по доменным flows Pulse |
| AGENTS.md | корень + `apps/web/AGENTS.md` | [`AGENTS.md`](../../AGENTS.md) |
| Cursor Rules | `.cursor/rules/*.mdc` | `.cursor/rules/` — core + UI/UX (см. [`docs/guidelines/README.md`](../guidelines/README.md)) |
| Иерархия источников истины | Rules → AGENTS → Contracts → PRD → Guidelines | См. methodology §3.2 |

---

## Что отличается (не копировать слепо)

| Аспект | lampto (BSFY) | Pulse (fitapp) |
|--------|---------------|----------------|
| Продукт | Bible study platform | Fitness trainer marketplace |
| Роли | Student, Leader, Editor, Admin | Client, Trainer, Admin |
| Hosting | Netlify | **Vercel** |
| Next.js | 16.2.6 (pinned) | **16.3.0** (App Router, `proxy.ts`, Instant Navigations) — [ADR-002](../prds/07_governance/adr_002_next162_vercel_runtime_policy.md) |
| Auth | Auth.js + Google OAuth | **Auth.js + Credentials** (email/password) |
| Email | SES (AWS) | **Resend** |
| File storage | S3 (lampto) | **AWS S3** (Pulse — same pattern) |
| Jobs runtime | AWS SAM (EventBridge + SQS + Lambda) | **Vercel Cron + serverless jobs** на MVP; AWS — post-MVP при необходимости |
| Timezone invariant | `Group.timezone` | **`TrainerProfile.timezone`** |
| Design | Calm Editorial | **Warm Forest / Material You** — см. design system |
| Канон продуктовых требований | `scope.html`, BSFY PRDs | [`docs/default_docs/`](../default_docs/), прототип HTML |

Отличия стека зафиксированы в [ADR-001](../prds/07_governance/adr_001_stack_and_runtime.md).

---

## Ключевые файлы lampto для изучения

### Архитектура и документация

- [`docs/prds/architecture_master_index.md`](../examples/lampto/docs/prds/architecture_master_index.md)
- [`docs/architecture_learning_pack/01_architecture_overview.md`](../examples/lampto/docs/architecture_learning_pack/01_architecture_overview.md)
- [`docs/implementation/mvp/monorepo_boundaries.md`](../examples/lampto/docs/implementation/mvp/monorepo_boundaries.md)

### Agent entry points

- [`AGENTS.md`](../examples/lampto/AGENTS.md)
- [`apps/web/AGENTS.md`](../examples/lampto/apps/web/AGENTS.md)
- [`.cursor/rules/bsfy-project-context.mdc`](../examples/lampto/.cursor/rules/bsfy-project-context.mdc)

### Эталон layered architecture в коде

Queued account deletion (domain → db → policy → web composition):

- [`packages/domain/src/account-deletion/`](../examples/lampto/packages/domain/src/account-deletion/)
- [`architecture_learning_pack/15_reference_account_deletion_layers_ru.md`](../examples/lampto/docs/architecture_learning_pack/15_reference_account_deletion_layers_ru.md)

**Для Pulse:** первый нетривиальный flow (booking lifecycle или trainer verification) должен повторить этот паттерн слоёв.

### Guidelines (переносить по мере scaffold)

- [`docs/guidelines/nextjs/`](../examples/lampto/docs/guidelines/nextjs/)
- [`docs/guidelines/react/`](../examples/lampto/docs/guidelines/react/)
- [`docs/guidelines/typescript/ai_typescript_monorepo_guidelines.md`](../examples/lampto/docs/guidelines/typescript/ai_typescript_monorepo_guidelines.md)

При переносе guideline — адаптировать примеры к Vercel, Credentials auth и Warm Forest design tokens.

### Incidents (перенесено в Pulse)

| Lampto | Pulse |
|--------|-------|
| [`docs/incidents/nextjs-server-actions-safari-load-failed.md`](../examples/lampto/docs/incidents/nextjs-server-actions-safari-load-failed.md) | [`docs/incidents/nextjs-server-actions-safari-load-failed.md`](../incidents/nextjs-server-actions-safari-load-failed.md) |
| [`docs/incidents/safari-ios-load-failed-architecture-pattern.md`](../examples/lampto/docs/incidents/safari-ios-load-failed-architecture-pattern.md) | [`docs/incidents/ios-safari-mutation-transport-pattern.md`](../incidents/ios-safari-mutation-transport-pattern.md) |

Cursor rule: **ios-safari-mutation-transport** · guidelines §7 in `ai_nextjs_db_data_handle.md` / `ai_form_handling_pattern.md`.

---

## Правило для AI-агентов

> Перед реализацией нового **архитектурного** паттерна в Pulse — **найти аналог в lampto**.  
> Если аналог есть — следовать **структуре слоёв** lampto, адаптируя домен и ADR-001/002 отличия.  
> Для **UI, React, naming, mobile-first, prototype fidelity** — **Pulse Cursor Rules и Guidelines** (не копировать lampto UI-код слепо).  
> Если аналога нет — создать contract + phase description по шаблону из [`ai_first_project_methodology.md`](../meta/ai_first_project_methodology.md).

---

## Обновление референса

Каталог `docs/examples/lampto/` не модифицируется в рамках разработки Pulse.  
При обновлении эталона — зафиксировать версию/дату в этом файле.

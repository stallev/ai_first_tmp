# Референсный проект: Pulse (fitapp)

**Статус:** зафиксирован как эталон архитектуры и AI-first разработки  
**Расположение в boilerplate:** [`docs/examples/pulse/`](../examples/pulse/)  
**Не деплоится** как часть {{PROJECT_NAME}} — только read-only reference для агентов.

---

## Назначение

Проект **Pulse** (fitness trainer marketplace) содержит отработанную систему:

- двухконтурной архитектуры (Web BFF + Jobs),
- monorepo с `packages/domain`, `packages/policy`, `packages/db`,
- AI-first документации (PRD → contracts → phases → tasks),
- 31 Cursor Rule + 27 Guidelines,
- Design Lab (`/design-system`) и полный MVP (P01–P14).

{{PROJECT_NAME}} **наследует подходы**, но имеет **свой домен, продуктовые документы и domain invariants**.

---

## Приоритет: {{PROJECT_NAME}} Rules > Pulse reference code

> **Код референса (`docs/examples/pulse/`) не является безусловным эталоном.**  
> Pulse полезен для **архитектурных паттернов** (domain → policy → db → web, фазовая декомпозиция, contracts), но **не для копирования домена, маршрутов или UI один в один**.

**При разработке {{PROJECT_NAME}}:**

1. **Cursor Rules** (`.cursor/rules/*.mdc`) и **Guidelines** (`docs/guidelines/`) — **канон**.
2. **Код Pulse** — read-only **reference for structure and flows**; при конфликте — **следовать Rules текущего проекта**.
3. **HTML prototype {{PROJECT_NAME}}** — visual reference; subordinate to Rules/PRD.

---

## Что копировать (принципы)

| Область | Эталон в Pulse | Применение в {{PROJECT_NAME}} |
|---------|----------------|-------------------------------|
| Методология AI-first | `docs/meta/ai_first_project_methodology.md` | Template → project canon |
| Doc registry (волны) | `documentation_creation_registry.md` | Адаптировать под домен |
| Monorepo boundaries | `monorepo_boundaries_contract.md` | Тот же паттерн импортов |
| Layered architecture | domain → policy → db → apps | Обязательно |
| Фазовая декомпозиция | `P{N}_phase_description.md` + tasks | Тот же формат |
| Contracts body | happy/negative/security/race/drift | §2.3.4 registry |
| AGENTS.md | корень + `apps/web/AGENTS.md` | Из template |
| Design Lab | `/design-system` + spec | После P6 |

---

## Что отличается (не копировать слепо)

| Аспект | Pulse | {{PROJECT_NAME}} |
|--------|-------|------------------|
| Продукт | Fitness marketplace | {{PRODUCT_DESCRIPTION}} |
| Роли | client, trainer, admin | {{USER_ROLES}} |
| Domain invariants | timezone, booking, verification | Заполнить в project-context |
| Design tokens | Warm Forest | {{DESIGN_SYSTEM_NAME}} |
| User flows / schema | Pulse-specific | Создать по registry W1–Wn |

---

## Ключевые файлы Pulse для изучения

### Архитектура

- `docs/prds/architecture_master_index.md`
- `docs/architecture_learning_pack/01_architecture_overview.md`
- `docs/implementation/mvp/contracts/monorepo_boundaries_contract.md`

### Реализация (patterns)

- `docs/examples/pulse/apps/web/src/proxy.ts` — request interception
- `docs/examples/pulse/packages/domain/` — pure business rules
- `docs/examples/pulse/.cursor/rules/` — полный набор rules (сравнение)

### Документация

- `docs/examples/pulse/docs/meta/documentation_creation_registry.md` — полный реестр W0–W14
- `docs/examples/pulse/docs/implementation/mvp/specs/design_system_lab_spec.md`

---

## Как заполнить `docs/examples/pulse/`

При переносе boilerplate в отдельный репозиторий:

```bash
# Из fitapp monorepo — snapshot (read-only reference)
rsync -a --exclude node_modules --exclude .next \
  /path/to/fitapp/ docs/examples/pulse/fitapp-snapshot/

# Минимум для агентов:
# - docs/ (meta, prds, guidelines, implementation)
# - .cursor/rules/
# - apps/web/src/ (structure samples)
# - packages/
```

См. [`docs/examples/pulse/README.md`](../examples/pulse/README.md).

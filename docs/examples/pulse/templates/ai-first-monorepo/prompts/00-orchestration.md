# Prompt Orchestration — AI-First Monorepo Bootstrap

**Проект:** {{PROJECT_NAME}}  
**Boilerplate:** `templates/ai-first-monorepo/`  
**Bootstrap guide:** [`BOOTSTRAP.md`](../BOOTSTRAP.md)  
**Methodology:** [`docs/meta/ai_first_project_methodology.md`](../docs/meta/ai_first_project_methodology.md)  
**Pulse reference:** [`docs/examples/pulse/`](../docs/examples/pulse/)

---

## Принципы оркестрации

1. **Один промпт = одна роль = один deliverable** (или одна doc wave)
2. **Context budget:** не смешивать doc creation и implementation code в одной сессии
3. **Gates:** следующий промпт только после verification checklist предыдущего
4. **Prototype:** visual reference only — канон: Rules → AGENTS → Contracts → PRD
5. **DB-first:** schema wave (W3 data model) до domain contracts (W8)
6. **Context7:** обязателен для runtime/auth/data промптов (см. registry §2.7)

---

## Карта промптов

| ID | Файл | Когда | Deliverable |
|----|------|-------|-------------|
| **P0** | [`P0-bootstrap.md`](P0-bootstrap.md) | День 0 | Структура каталогов, AGENTS, T0 rules |
| **P1** | [`P1-html-prototype.md`](P1-html-prototype.md) | После interim PRD brief | `docs/prototypes/*.html` |
| **P2** | [`P2-doc-registry.md`](P2-doc-registry.md) | После P1 | `documentation_creation_registry.md` |
| **P3** | [`P3-wave-executor.md`](P3-wave-executor.md) | Каждая волна W{N} | Файлы волны + backlinks |
| **P4** | [`P4-rules-guidelines.md`](P4-rules-guidelines.md) | После W1 | T1 rules активны, guidelines проверены |
| **P5** | [`P5-nextjs-scaffold.md`](P5-nextjs-scaffold.md) | После W8+ contracts | Monorepo + Next.js 16.2.6 |
| **P6** | [`P6-design-system-lab.md`](P6-design-system-lab.md) | После P5 + UX-03 | `/design-system` + T2 rules |
| **P7+** | Phase tasks | После P6 | `P01_tasks.md` … по фазам |

---

## Gates (обязательные проверки)

```
P0 ──▶ P1 ──▶ P2 ──▶ P3 (W1…W14) ──▶ P4 ──▶ P5 ──▶ P6 ──▶ P7 (P01+)
         │              │
         │              └── Gate: database_schema_v1 canonical до W8 contracts
         └── Gate: interim docs / product brief exists
```

| Gate | Условие |
|------|---------|
| G1 → P2 | Есть product brief или `docs/default_docs/` |
| G2 → P3-W3 | P2 registry утверждён пользователем |
| G3 → P5 | W1–W2 + W3 schema + минимум W5 auth + W8 boundaries contract |
| G4 → P6 | Next.js build pass, `globals.css` scaffold |
| G5 → P7 | Design Lab acceptance criteria pass |

---

## Doc waves — context budget

| Wave | Файлов (ориентир) | Сессий | Содержание |
|------|-------------------|--------|------------|
| W0 | 1 | 1 | Registry meta |
| W1 | 6 | 1–2 | Governance + product canon |
| W2 | 5 | 1 | UX/UI foundation |
| W3 | 5 | 1–2 | Domain model + **data model priority** |
| W4–W7 | ~15 | 2–3 | ADR, auth, runtime, design, wireframes |
| W8 | ~10 | 2 | **Contracts** (happy/negative/security/race) |
| W9–W11 | ~12 | 2 | Specs, phases, guides |
| W12–W14 | ~8 | 1–2 | Learning pack, ops, quality |

**Правило:** 1 сессия = **одна волна** или **1–3 файла** внутри волны (см. registry §3).

Полный перечень файлов — [`documentation_creation_registry.template.md`](../docs/meta/documentation_creation_registry.template.md) и Pulse snapshot.

---

## UX/UI documents (волна W2 + W7)

| ID | Файл | Назначение |
|----|------|------------|
| UX-01 | `docs/design/ux_ui_principles.md` | Progressive Disclosure, Zero Dead Ends |
| UX-02 | `docs/design/responsive_navigation_contract.md` | Bottom nav / sidebar |
| UX-03 | `docs/design/visual_identity_contract.md` | Tokens, typography |
| UX-04 | `docs/design/interaction_design_contract.md` | Toast, optimistic, pending |
| UX-05 | `docs/design/ui_states_contract.md` | empty/loading/error/forbidden |
| UX-06 | `docs/design/forms_and_validation_ux.md` | Field errors, submit pending |
| UX-07 | `docs/design/accessibility_requirements.md` | WCAG 2.1 AA |
| UX-08 | `docs/design/prototype_route_mapping.md` | Prototype → routes |
| UX-09 | `docs/design/styleguide.md` | Component recipes |
| UX-10 | `docs/design/content_and_microcopy_contract.md` | `@/lib/messages` |

---

## Требования к документации (все промпты P2/P3)

Из registry §2 — обязательно в каждом новом файле:

- Front matter (тип, статус, волна, зависимости)
- Purpose, Scope, Requirements (MUST/SHOULD/MAY)
- **Happy paths** + **Negative paths** (+ Security / Races / Drift по матрице типа)
- Acceptance criteria (минимум 1 negative check)
- Agent notes (антипаттерны)
- Backlinks в ранние файлы (та же сессия)

---

## Cursor Rules activation timeline

| После промпта | Tier | Rules count |
|---------------|------|-------------|
| P0 / P4 | T0 | 5 |
| P4 / P5 | T1 | 7 |
| P6 | T2 | 15 |

Manifest: [`.cursor/rules/README.md`](../.cursor/rules/README.md)

---

## Guidelines (included — 28 files)

Полный набор в `guidelines/` — не создавать заново; адаптировать ссылки и {{PLACEHOLDERS}} в P4.

**S3 uploads:** [`guidelines/nextjs/ai_s3_file_upload_guidelines.md`](../guidelines/nextjs/ai_s3_file_upload_guidelines.md) + infra в [`BOOTSTRAP.md`](../BOOTSTRAP.md) §7.

---

## Context7 libraries

| Тема | Library ID |
|------|------------|
| Next.js 16.2 | `/vercel/next.js/v16.2.2` |
| Auth.js v5 | `/websites/authjs_dev` |
| Prisma v7 | `/websites/prisma_io` |
| shadcn/ui | via shadcn MCP |

---

## Quick start для агента

```
1. READ prompts/00-orchestration.md (this file)
2. READ PLACEHOLDERS.md — verify all {{}} replaced
3. EXECUTE P0 → verify → P1 → … 
4. Never skip gates
```

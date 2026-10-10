# Bootstrap нового проекта — пошаговая инструкция

**Boilerplate:** AI-First Monorepo (full Pulse stack)  
**Аудитория:** разработчик + AI-агент (Cursor)  
**Оркестрация промптов:** [`prompts/00-orchestration.md`](prompts/00-orchestration.md)

---

## Обзор

```
Экспорт boilerplate → Snapshot Pulse → Placeholders → Visual seed → P0…P6 → AWS/Neon/Vercel → P7+ фазы
```

| Этап | Промпт / действие | Результат |
|------|-------------------|-----------|
| 0 | Ручная подготовка | Repo + snapshot + infra |
| 0.5 | [`P1-html-prototype-claude-desktop.md`](prompts/P1-html-prototype-claude-desktop.md) | Seed HTML в `docs/prototypes/` (рекомендуется) |
| P0 | [`P0-bootstrap.md`](prompts/P0-bootstrap.md) | AGENTS, T0 rules, структура `docs/` |
| P1 | [`P1-html-prototype.md`](prompts/P1-html-prototype.md) | HTML prototype (ingest или create) |
| P2 | [`P2-doc-registry.md`](prompts/P2-doc-registry.md) | Doc registry + methodology |
| P3 | [`P3-wave-executor.md`](prompts/P3-wave-executor.md) | PRD, schema, contracts (W1–W14) |
| P4 | [`P4-rules-guidelines.md`](prompts/P4-rules-guidelines.md) | T1 rules активны |
| P5 | [`P5-nextjs-scaffold.md`](prompts/P5-nextjs-scaffold.md) | Monorepo + Next.js |
| P6 | [`P6-design-system-lab.md`](prompts/P6-design-system-lab.md) | `/design-system` + T2 rules |
| P7+ | Phase tasks | Feature implementation |

---

## Предварительные требования

- **Node.js** 20+ (LTS)
- **npm** 10+ (workspaces)
- Аккаунты: **GitHub**, **Vercel**, **Neon**, **AWS** (S3 + IAM)
- **Cursor** с доступом к Context7 (`/vercel/next.js` 16.4.x, Auth.js, Prisma)
- Исходные материалы продукта: brief, roles, MVP scope (или `docs/default_docs/`)
- **Рекомендуется до P1:** visual seed — один HTML в **`docs/prototypes/`** (не `docs/prototype/`). Генерация: [`prompts/P1-html-prototype-claude-desktop.md`](prompts/P1-html-prototype-claude-desktop.md) (Claude Desktop)

---

## Шаг 1 — Экспорт boilerplate

### Из fitapp (локально)

Boilerplate лежит в `templates/ai-first-monorepo/` (gitignored в fitapp). Скопируйте в новый репозиторий:

```powershell
# Windows — пример
$src = "C:\github\fitapp\templates\ai-first-monorepo"
$dst = "C:\github\my-new-project"
New-Item -ItemType Directory -Force -Path $dst
Copy-Item "$src\*" $dst -Recurse -Force
```

```bash
# macOS / Linux
rsync -a --exclude node_modules /path/to/fitapp/templates/ai-first-monorepo/ /path/to/my-new-project/
```

### Отдельный репозиторий (целевой)

1. Создайте repo `ai-first-monorepo-starter` (или свой fork boilerplate)
2. Уберите `/templates/ai-first-monorepo/` из `.gitignore` **в starter repo**
3. Initial commit — весь boilerplate

---

## Шаг 2 — Snapshot Pulse reference

Поместите read-only копию Pulse в `docs/examples/pulse/`.

**Минимум для агентов:**

| Путь | Зачем |
|------|-------|
| `docs/examples/pulse/docs/meta/` | Полный registry W0–W14 |
| `docs/examples/pulse/docs/implementation/mvp/` | Contracts, phases, specs |
| `docs/examples/pulse/.cursor/rules/` | Эталон rules |
| `docs/examples/pulse/apps/web/src/` | proxy, data, s3, components |
| `docs/examples/pulse/packages/` | domain, policy, db |

**Исключить:** `node_modules/`, `.next/`, `.env*`, `apps/text_data/`

```bash
rsync -a \
  --exclude node_modules --exclude .next --exclude '.env*' \
  /path/to/fitapp/ \
  /path/to/my-new-project/docs/examples/pulse/fitapp-snapshot/
```

Подробнее: [`docs/examples/pulse/README.md`](docs/examples/pulse/README.md)

---

## Шаг 3 — Placeholders

Откройте [`PLACEHOLDERS.md`](PLACEHOLDERS.md) и замените все `{{…}}`:

| Placeholder | Пример |
|-------------|--------|
| `{{PROJECT_NAME}}` | Acme Platform |
| `{{PROJECT_SLUG}}` | acme-platform |
| `{{PACKAGE_SCOPE}}` | acme |
| `{{PRODUCT_DESCRIPTION}}` | B2B marketplace for … |
| `{{USER_ROLES}}` | client, vendor, admin |
| `{{DESIGN_SYSTEM_NAME}}` | Warm Forest |
| `{{DESIGN_SYSTEM_SLUG}}` | warm-forest |
| `{{MAIN_PROTOTYPE_HTML}}` | Acme_Prototype_v1.html |
| `{{INTERIM_DESIGN_SYSTEM_DOC}}` | acme-design-system.md |
| `{{DOMAIN_COMPONENT_FOLDER}}` | catalog |
| `{{S3_KEY_PREFIX}}` | `acme/` |
| `{{DOMAIN_INVARIANT_*}}` | из domain design |
| `{{CURRENT_PHASE}}` | Documentation — W0 |

**Проверка:**

```bash
rg '\{\{' --glob '!node_modules' .
# Должно быть пусто (кроме PLACEHOLDERS.md и *.template.* до rename)
```

**Переименовать:**

| From | To |
|------|-----|
| `AGENTS.template.md` | `AGENTS.md` |
| `.cursor/rules/tiers/t0-always/project-context.template.mdc` | `.cursor/rules/project-context.mdc` |
| `docs/meta/*.template.md` | убрать `.template` (после P2) |

**Claude Code:** корневой [`CLAUDE.md`](CLAUDE.md) — `@AGENTS.md` плюс указатель на generated `.claude/rules/*.md`. SoT MUST — только `.cursor/rules/*.mdc`; после копирования/правки `.mdc` — `npm run rules:sync` (или `node scripts/sync-claude-rules.mjs`). Не `@`-импортировать `.mdc`. Не править `.claude/rules/` руками. Playbook: [`docs/claude-code-cursor-rules-sync.md`](docs/claude-code-cursor-rules-sync.md). `scaffold/apps/web/CLAUDE.md` на P5 остаётся тонким `@AGENTS.md` (зеркало правил только в корне).

---

## Шаг 3.5 — Visual seed (рекомендуется до P1)

Канонический каталог: **`docs/prototypes/`** (множественное число). Не использовать `docs/prototype/`.

**Зачем:** зафиксировать токены и оболочку UI до того, как агент подставит эталон Pulse/Warm Forest. Прототип — visual reference (пункт 7 source-of-truth); PRD/contracts/rules остаются выше.

**Минимум seed:** home/shell, 390px + `md`, семантические CSS-переменные в `:root` / `.dark` + `@theme`, стили разметки только утилитами Tailwind v4. Полный набор MVP-экранов не обязателен — их добирает P1.

**Как сгенерировать:** в Claude Desktop вставьте [`prompts/P1-html-prototype-claude-desktop.md`](prompts/P1-html-prototype-claude-desktop.md), прикрепите спецификацию продукта и URL референса дизайн-системы. Сохраните результат как `docs/prototypes/{{MAIN_PROTOTYPE_HTML}}`.

**Tailwind v4 без сборки** ([Play CDN](https://tailwindcss.com/docs/installation/play-cdn)):

```html
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
<style type="text/tailwindcss">
     @theme inline { /* map --color-* → var(--token) */ }
</style>
```

Локальный просмотр HTML требует сеть (CDN). P0 **не удаляет и не перезаписывает** существующие `docs/prototypes/*.html`.

---

## Шаг 4 — Cursor Rules по tier

См. [`.cursor/rules/README.md`](.cursor/rules/README.md)

| Когда | Действие |
|-------|----------|
| **P0** | T0 уже активен в шаблоне; создать `.cursor/rules/project-context.mdc` из `tiers/t0-always/project-context.template.mdc`, затем `npm run rules:sync` |
| **P4** | + `tiers/t1-implementation/*.mdc`, затем `npm run rules:sync` |
| **P6** | + `tiers/t2-ui/*.mdc`, затем `npm run rules:sync` |

Состав каждого tier — только в манифесте [`.cursor/rules/README.md`](.cursor/rules/README.md); здесь числа не дублируются.

---

## Шаг 5 — Промпты (AI workflow)

Для каждого промпта в Cursor:

1. Открыть файл из `prompts/`
2. Вставить как user message (или @-mention файлы из §Inputs)
3. Дождаться verification checklist
4. **Gate** — только then следующий промпт

**Критичные gates:**

| Gate | Условие |
|------|---------|
| G2 | Registry утверждён → начать P3 |
| G3 | `database_schema_v1.md` + boundaries contract → P5 |
| G4 | `next build` pass → P6 |

**DB-first:** в P3 волна с `database_schema_v1.md` **до** domain contracts (W8).

---

## Шаг 6 — Neon PostgreSQL

1. [neon.tech](https://neon.tech) → создать project
2. Скопировать connection strings:
   - `DATABASE_URL` — pooled (PgBouncer)
   - `DIRECT_URL` — direct (migrations)
3. Добавить в `apps/web/.env.local` (после P5):

```env
DATABASE_URL=postgresql://...-pooler...
DIRECT_URL=postgresql://...
```

4. После Prisma schema: `npx prisma migrate dev` из `packages/db`

---

## Шаг 7 — AWS S3 (file uploads)

Полный guideline: [`guidelines/nextjs/ai_s3_file_upload_guidelines.md`](guidelines/nextjs/ai_s3_file_upload_guidelines.md)

### Checklist infra

- [ ] S3 bucket создан (private, Block Public Access ON)
- [ ] IAM user + policy (Put/Get/Head/Delete под `{{S3_KEY_PREFIX}}*`)
- [ ] CORS: localhost + Vercel preview + production origin
- [ ] Lifecycle: expire orphan prefix 24h
- [ ] Env в Vercel: `AWS_IAM_USER_*`, `S3_BUCKET_*`

### Checklist code (после P5, фаза с upload)

- [ ] `FILE_UPLOAD_OBJECT_KEY_PREFIX` = `{{S3_KEY_PREFIX}}` в domain
- [ ] `file_upload_contract.md` (W8)
- [ ] `apps/web/src/lib/s3/s3-client.ts`
- [ ] DAL + Server Actions + `FileUploadZone.client.tsx`
- [ ] Rule `s3-file-asset-uploads.mdc` active (T1)

---

## Шаг 8 — Vercel deployment

1. Import GitHub repo в Vercel
2. Root directory: monorepo root (или `apps/web` — по структуре после P5)
3. Env vars: Neon, Auth, AWS, Sentry (см. P5 prompt)
4. `AUTH_SECRET` — `openssl rand -base64 32`
5. Preview deployments на каждый PR

**Auth.js:** `AUTH_URL` / `NEXTAUTH_URL` per environment.

---

## Шаг 9 — Auth.js (Credentials)

После P5 scaffold:

```env
AUTH_SECRET=
# Optional explicit:
# AUTH_URL=https://your-domain.com
```

Канон: JWT sessions, role in token, **no** `@auth/prisma-adapter` если нет Account/Session tables — см. Pulse P02 pattern в snapshot.

---

## Шаг 10 — Sentry (optional, recommended)

```env
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=        # build only, secret
SENTRY_ORG=
SENTRY_PROJECT=
```

Образец: `docs/examples/pulse/apps/web/src/instrumentation*.ts`

---

## Шаг 11 — Resend (post-MVP)

На MVP: только таблицы `job_execution` / `delivery_log` в schema.  
Env `RESEND_API_KEY` — когда фаза email (P21 analog).

---

## Шаг 11b — Lab PageSpeed Insights (optional, local)

Ключ **не** в Vercel runtime и **не** `NEXT_PUBLIC_*`. В корневом `.env.local` (см. [`.env.example`](.env.example)):

```env
PAGE_SPEED_API_KEY=
PSI_ORIGIN=https://your-production-domain.com
```

GCP: включить **PageSpeed Insights API**. Прогон: `npm run psi:lab -- --url https://…` или `--suite`. Канон: [`guidelines/psi-lab-testing.md`](guidelines/psi-lab-testing.md).

---

## Шаг 12 — Верификация bootstrap

### После P0

- [ ] `AGENTS.md` exists
- [ ] `CLAUDE.md` exists at root (`@AGENTS.md` + Claude rules pointer)
- [ ] T0 rules in `.cursor/rules/`
- [ ] `npm run rules:check` pass
- [ ] `docs/` tree created
- [ ] Guidelines in `docs/guidelines/` (copy from boilerplate `guidelines/`)
- [ ] Existing `docs/prototypes/*.html` preserved (if seed existed)

### После P2

- [ ] `documentation_creation_registry.md` canonical
- [ ] `ai_first_project_methodology.md` canonical

### После P5

- [ ] `npm run typecheck` (root)
- [ ] `npm run lint` (root)
- [ ] `npm run rules:check`
- [ ] `cd apps/web && npm run build`
- [ ] `proxy.ts` present, not legacy middleware patterns
- [ ] `apps/web/CLAUDE.md` exists (`@AGENTS.md` import)
- [ ] `next` pinned to current 16.4.x patch (no `^16`)
- [ ] root `.npmrc` (`save-exact=true`) from `scaffold/.npmrc`; `npm run deps:check` pass; CI / Vercel on `npm ci`

### После P6

- [ ] `/design-system` renders 390px + md
- [ ] T2 rules active (состав — по манифесту)
- [ ] `npm run rules:check` pass
- [ ] Product routes don't import `design-lab/`

---

## Структура каталогов после полного bootstrap

```
my-new-project/
├── AGENTS.md
├── CLAUDE.md                 # @AGENTS.md + pointer to generated .claude/rules
├── scripts/sync-claude-rules.mjs
├── apps/web/                 # Next.js 16.4.x (pin 16.4 baseline)
│   ├── AGENTS.md
│   └── CLAUDE.md             # @AGENTS.md import
├── packages/{domain,policy,db}/
├── docs/
│   ├── meta/
│   ├── prds/
│   ├── design/
│   ├── prototypes/
│   ├── guidelines/
│   ├── implementation/mvp/
│   ├── claude-code-cursor-rules-sync.md
│   └── examples/pulse/       # read-only reference
├── .cursor/rules/            # активные копии; SoT — tiers/ (манифест README.md)
├── .claude/rules/            # generated mirror — do not edit
└── prompts/                  # keep for onboarding new agents
```

---

## Частые ошибки

| Ошибка | Решение |
|--------|---------|
| Прототип как единственный источник истины | Канон: Rules → AGENTS → Contracts → PRD; prototype = visual only |
| Каталог `docs/prototype/` (ед. ч.) | Канон: **`docs/prototypes/`** + `{{MAIN_PROTOTYPE_HTML}}` |
| T2 rules до Design Lab | Активировать только в P6 |
| `@vercel/blob` для uploads | Только AWS S3 — ADR-007 |
| Client-supplied S3 keys | `buildFileUploadObjectKey()` server-side |
| policy-server в proxy.ts | Только `@{{PACKAGE_SCOPE}}/policy-edge` |
| Пропуск doc waves | Strict order в registry |

---

## Быстрые ссылки

| Документ | Путь |
|----------|------|
| Placeholders | [`PLACEHOLDERS.md`](PLACEHOLDERS.md) |
| Prompt map | [`prompts/00-orchestration.md`](prompts/00-orchestration.md) |
| S3 uploads | [`guidelines/nextjs/ai_s3_file_upload_guidelines.md`](guidelines/nextjs/ai_s3_file_upload_guidelines.md) |
| Stack patterns | [`docs/reference/stack_patterns_from_pulse.md`](docs/reference/stack_patterns_from_pulse.md) |
| Pulse reference | [`docs/reference/pulse_project_reference.template.md`](docs/reference/pulse_project_reference.template.md) |

---

**Следующий шаг:** выполните **P0** — [`prompts/P0-bootstrap.md`](prompts/P0-bootstrap.md)

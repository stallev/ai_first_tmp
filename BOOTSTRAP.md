# Bootstrap нового проекта — пошаговая инструкция

**Boilerplate:** AI-First Monorepo (full Pulse stack)  
**Аудитория:** разработчик + AI-агент (Cursor)  
**Оркестрация промптов:** [`prompts/00-orchestration.md`](prompts/00-orchestration.md)

---

## Обзор

```
Экспорт boilerplate → Snapshot Pulse → Placeholders → P0…P6 → AWS/Neon/Vercel → P7+ фазы
```

| Этап | Промпт / действие | Результат |
|------|-------------------|-----------|
| 0 | Ручная подготовка | Repo + snapshot + infra |
| P0 | [`P0-bootstrap.md`](prompts/P0-bootstrap.md) | AGENTS, T0 rules, структура `docs/` |
| P1 | [`P1-html-prototype.md`](prompts/P1-html-prototype.md) | HTML prototype |
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
- **Cursor** с доступом к Context7 (Next.js 16.2, Auth.js, Prisma)
- Исходные материалы продукта: brief, roles, MVP scope (или `docs/default_docs/`)

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
| `project-context.template.mdc` | `.cursor/rules/project-context.mdc` |
| `docs/meta/*.template.md` | убрать `.template` (после P2) |

---

## Шаг 4 — Cursor Rules по tier

См. [`.cursor/rules/README.md`](.cursor/rules/README.md)

| Когда | Действие |
|-------|----------|
| **P0** | Скопировать `tiers/t0-always/*.mdc` → `.cursor/rules/` + `project-context.mdc` |
| **P4** | + `tiers/t1-implementation/*.mdc` (7 rules) |
| **P6** | + `tiers/t2-ui/*.mdc` (15 rules) |

Итого: **5 → 12 → 27** active rules (+ `project-context` = 27 total rule files active).

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

## Шаг 12 — Верификация bootstrap

### После P0

- [ ] `AGENTS.md` exists
- [ ] T0 rules (5) in `.cursor/rules/`
- [ ] `docs/` tree created
- [ ] Guidelines in `docs/guidelines/` (copy from boilerplate `guidelines/`)

### После P2

- [ ] `documentation_creation_registry.md` canonical
- [ ] `ai_first_project_methodology.md` canonical

### После P5

- [ ] `npm run typecheck` (root)
- [ ] `npm run lint` (root)
- [ ] `cd apps/web && npm run build`
- [ ] `proxy.ts` present, not legacy middleware patterns

### После P6

- [ ] `/design-system` renders 390px + md
- [ ] T2 rules active (27 total)
- [ ] Product routes don't import `design-lab/`

---

## Структура каталогов после полного bootstrap

```
my-new-project/
├── AGENTS.md
├── apps/web/                 # Next.js 16.2.6
├── packages/{domain,policy,db}/
├── docs/
│   ├── meta/
│   ├── prds/
│   ├── design/
│   ├── prototypes/
│   ├── guidelines/
│   ├── implementation/mvp/
│   └── examples/pulse/       # read-only reference
├── .cursor/rules/            # 27 rules when complete
└── prompts/                  # keep for onboarding new agents
```

---

## Частые ошибки

| Ошибка | Решение |
|--------|---------|
| Прототип как единственный источник истины | Канон: Rules → AGENTS → Contracts → PRD; prototype = visual only |
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

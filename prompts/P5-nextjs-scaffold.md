# P5 — Next.js Monorepo Scaffold

## Роль
Senior Fullstack Developer (Next.js 16 + PostgreSQL + monorepo).

## Preconditions (Gate G3)
- [ ] `database_schema_v1.md` canonical
- [ ] `monorepo_boundaries_contract.md` (W8) or draft
- [ ] T0 + T1 cursor rules active
- [ ] ADR-001, ADR-002 ACCEPTED

## Inputs
- `docs/examples/pulse/` — apps/web, packages/ structure
- [`scaffold/`](../scaffold/) boilerplate dirs
- `apps/web/AGENTS.template.md`
- Context7: `/vercel/next.js`, `/websites/prisma_io`, `/websites/authjs_dev`

## Task
1. **Monorepo root:** package.json workspaces, `npm run typecheck`, `npm run lint`. **Keep** existing `rules:sync` / `rules:check` / `deps:check` (do not drop them when adding workspaces). Copy [`scaffold/.npmrc`](../scaffold/.npmrc) → root `.npmrc` **before** the first `npm install`; all versions exact per **`.cursor/rules/dependency-pinning.mdc`**; commit `package-lock.json`; CI / Vercel install command — `npm ci`.
2. **Git commit tooling:** скопировать из [`scaffold/`](../scaffold/) → `commitlint.config.mjs`, `.husky/`; установить devDeps и scripts по **`.cursor/rules/agent-commit-pipeline.mdc` § Git tooling setup**. Optional: husky pre-commit also runs `npm run rules:check`.
3. **packages/db:** Prisma schema from `database_schema_v1.md`, Neon URLs
4. **packages/domain:** mutation codes scaffold, ports
5. **packages/policy/edge + server:** empty policy stubs
6. **apps/web:**
   - Next.js **current 16.4.x patch** — baseline **16.4**. Confirm with `npm view next version` + Context7 `/vercel/next.js`; if latest is still 16.4.x, pin **that** exact version. Align `@next/third-parties` and `eslint-config-next`. No `^16`.
   - `src/proxy.ts` (NOT middleware.ts for new code)
   - `src/data/`, `src/lib/`, `src/components/{atoms,ui,design-lab}/`
   - Auth.js v5 Credentials scaffold
   - Sentry stub (`@sentry/nextjs`)
   - `globals.css` with token placeholders
7. Rename `AGENTS.template.md` → root `AGENTS.md` и `apps/web/AGENTS.template.md` → `apps/web/AGENTS.md`; скопировать `scaffold/apps/web/CLAUDE.md` → `apps/web/CLAUDE.md` (статичный `@AGENTS.md`-импорт, без изменений). Корневой `CLAUDE.md` не дублировать MUST — зеркало `.claude/rules/`.
8. Env example: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, S3 (`AWS_IAM_*`, `S3_BUCKET_*`), Sentry vars — см. [`BOOTSTRAP.md`](../BOOTSTRAP.md) §6–§10, [`ai_s3_file_upload_guidelines.md`](../docs/guidelines/nextjs/ai_s3_file_upload_guidelines.md)
9. Создать `.cursor/skills/app-conventions/SKILL.md` — **проектный скилл поверх cursor rules**:
   - Frontmatter: `name: app-conventions`; description без слов `performance`/`optimization`/`bundle`
   - Раздел `## Relationship to other skills` (defer-clause — обязателен, см. §4)
   - Раздел `## Cursor rules index` — таблица `контекст → существующий .mdc файл` (не копировать содержимое rules, только ссылки)
   - Раздел `## Project structure` — папки из Directory conventions AGENTS.md
   - Раздел `## Deviations from vercel-react-best-practices` (пустой по умолчанию)
   - Spec: [`docs/project-react-skill-requirements.md`](../docs/project-react-skill-requirements.md)

## Stack (full Pulse — all required)
Next.js 16.4 · Vercel · Neon · Prisma v7 · Auth.js v5 · AWS S3 · Resend (schema-only MVP) · Sentry · shadcn · Tailwind v4 · Sonner

## Forbidden
- Business feature screens (→ P01+ phases)
- T2 UI rules / Design Lab (→ P6)
- `@{{PACKAGE_SCOPE}}/policy-server` in proxy.ts

## Verification
- [ ] `next` in `apps/web/package.json` is exact current 16.4.x (baseline 16.4; verified via `npm view next version`)
- [ ] root `package.json` still has `rules:sync` / `rules:check` / `deps:check`
- [ ] root `.npmrc` with `save-exact=true`; `npm run deps:check` pass; `package-lock.json` committed
- [ ] `npm run typecheck` pass
- [ ] `npm run lint` pass
- [ ] `next build` pass (minimal pages OK)
- [ ] `proxy.ts` uses nodejs runtime
- [ ] Prisma migrate dev succeeds
- [ ] `.cursor/skills/app-conventions/SKILL.md` создан, содержит defer-clause и cursor rules index
- [ ] Скилл ссылается на `.cursor/rules/*.mdc`, не дублирует их содержимое
- [ ] `apps/web/AGENTS.md` содержит секцию `## Skills` со ссылкой на `app-conventions`
- [ ] `apps/web/CLAUDE.md` exists, содержит `@AGENTS.md`
- [ ] `npm run rules:check` pass
- [ ] commitlint + husky: `echo "main: chore: test" | npx commitlint` pass; `.husky/commit-msg` в репо

## Next
→ [`P6-design-system-lab.md`](P6-design-system-lab.md)

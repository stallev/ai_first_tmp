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
- Context7: `/vercel/next.js/v16.2.2`, `/websites/prisma_io`, `/websites/authjs_dev`

## Task
1. **Monorepo root:** package.json workspaces, `npm run typecheck`, `npm run lint`
2. **packages/db:** Prisma schema from `database_schema_v1.md`, Neon URLs
3. **packages/domain:** mutation codes scaffold, ports
4. **packages/policy/edge + server:** empty policy stubs
5. **apps/web:**
   - Next.js **16.2.6** pinned
   - `src/proxy.ts` (NOT middleware.ts for new code)
   - `src/data/`, `src/lib/`, `src/components/{atoms,ui,design-lab}/`
   - Auth.js v5 Credentials scaffold
   - Sentry stub (`@sentry/nextjs`)
   - `globals.css` with token placeholders
6. Rename `AGENTS.template.md` → `apps/web/AGENTS.md`
7. Env example: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, S3 (`AWS_IAM_*`, `S3_BUCKET_*`), Sentry vars — см. [`BOOTSTRAP.md`](../BOOTSTRAP.md) §6–§10, [`ai_s3_file_upload_guidelines.md`](../guidelines/nextjs/ai_s3_file_upload_guidelines.md)

## Stack (full Pulse — all required)
Next.js 16.2.6 · Vercel · Neon · Prisma v7 · Auth.js v5 · AWS S3 · Resend (schema-only MVP) · Sentry · shadcn · Tailwind v4 · Sonner

## Forbidden
- Business feature screens (→ P01+ phases)
- T2 UI rules / Design Lab (→ P6)
- `@{{PACKAGE_SCOPE}}/policy-server` in proxy.ts

## Verification
- [ ] `npm run typecheck` pass
- [ ] `npm run lint` pass
- [ ] `next build` pass (minimal pages OK)
- [ ] `proxy.ts` uses nodejs runtime
- [ ] Prisma migrate dev succeeds

## Next
→ [`P6-design-system-lab.md`](P6-design-system-lab.md)

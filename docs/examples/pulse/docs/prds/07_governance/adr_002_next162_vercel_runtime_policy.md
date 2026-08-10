# ADR-002 — Next.js 16.3.0 runtime policy (Vercel)

**Дата:** 2026-05-23  
**Статус:** ACCEPTED  
**Проект:** Pulse (fitapp)  
**Owner:** Architecture + Runtime  
**Last reviewed:** 2026-08-10 (pin upgraded **16.2.6 → 16.3.0**)

**Methodology:** [`docs/meta/ai_first_project_methodology.md`](../../meta/ai_first_project_methodology.md)

**Filename note:** `adr_002_next162_…` is historical; **Decision §2** is the pin source of truth (**16.3.0**).

---

## 1. Context

Pulse hosted on **Vercel** ([ADR-001](./adr_001_stack_and_runtime.md)). Architectural patterns inherit from **lampto**, where Next.js 16.2 introduced a breaking rename of request interception: **`middleware.ts` → `proxy.ts`**.

Agents must not implement Next.js 15 `middleware.ts` patterns as the canonical approach.

**Official reference (Context7 / Next.js 16.x docs):** [`proxy` file convention](https://nextjs.org/docs/app/api-reference/file-conventions/proxy), [Upgrading to v16 — middleware to proxy](https://nextjs.org/docs/app/guides/upgrading/version-16#middleware-to-proxy).  
**Release notes:** [Next.js 16.3](https://nextjs.org/blog/next-16-3) (2026-08-03).

---

## 2. Decision — version pin

| Policy | Value |
|--------|-------|
| **Next.js version** | **`16.3.0` exactly** — pin in `apps/web` `package.json` as `"next": "16.3.0"` (also `@next/third-parties`, `eslint-config-next`; no caret/range) |
| **React** | 19.x (peer of Next 16.3) |
| **Hosting** | Vercel |
| **Bundler** | Turbopack default (`next dev`, `next build`) — FS cache for build enabled by framework defaults |

**Hard rule:** do not downgrade to Next.js 15.x or use floating `^16.x` without a new ADR.  
**Prior pin:** `16.2.6` (superseded 2026-08-10).

---

## 3. Decision — request interception (`proxy.ts`)

Next.js 16 deprecates `middleware.ts` in favor of **`proxy.ts`** (unchanged on 16.3).

| Item | Policy |
|------|--------|
| **Canonical file** | `apps/web/src/proxy.ts` (or `proxy.ts` at app src root per scaffold) |
| **Export name** | `export function proxy(request: NextRequest)` — **not** `middleware` |
| **Runtime** | **`nodejs`** — Edge runtime is **not** supported in `proxy` (Next.js 16). If Edge interception is required temporarily, **`middleware.ts` only** with explicit migration ticket. |
| **Transitional `middleware.ts`** | Allowed **only** as tracked migration step; do not add new logic to `middleware.ts` without plan to move to `proxy.ts`. |
| **Codemod** | `npx @next/codemod@canary middleware-to-proxy .` |

### Auth / policy integration

- **`proxy.ts`** imports **`auth.config.ts`** (edge-safe, **no Prisma**) and **`@pulse/policy-edge`** only.
- **`auth.ts`** (full Auth.js + Prisma adapter) — **never** import from `proxy.ts`.
- **`@pulse/policy-server`** — **forbidden** in `proxy.ts` and `middleware.ts` (no Prisma in interception layer).

Split Auth.js config is **mandatory** (pattern from lampto, adapted for Vercel).

---

## 4. Decision — Async Request APIs

Mandatory in all App Router code (Next.js 15+ retained in 16):

```ts
const cookieStore = await cookies();
const headersList = await headers();

export default async function Page(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await props.params;
}
```

---

## 5. Decision — cache reads and invalidation (Next.js 16)

**Cross-request cached reads:** use the **`'use cache'`** directive with **`cacheTag()`** and **`cacheLife()`** in `src/data/**`. **Do not add new `unstable_cache()`** — legacy API superseded in Next.js 16. Enable **`cacheComponents: true`** in `apps/web/next.config.ts` when implementing cached reads. Detail: [`ai_loading_patterns.md`](../../guidelines/nextjs/ai_loading_patterns.md) §8.

**Post-mutation invalidation:**

| API | When |
|-----|------|
| **`updateTag`** | Server Actions — read-your-own-writes (next request waits for fresh data) |
| **`revalidateTag`** | Route Handlers or SWR-style stale-while-revalidate |
| **`revalidatePath`** | Route-scoped invalidation when tags not used |

Do **not** use `unstable_after` for background email/jobs — use Vercel Cron + `job_execution` / `delivery_log` ([ADR-001](./adr_001_stack_and_runtime.md)).

---

## 6. Consequences

**Positive:**

- Aligns Pulse with Next.js 16.3 defaults (Turbopack FS cache, lower dev memory, native Node SSR streams).
- `proxy.ts` + Node runtime simplifies Auth.js JWT gate without Edge Prisma restrictions.
- Single runtime ADR prevents agents from mixing v15 middleware docs with v16 codebase.

**Trade-offs:**

- Teams must migrate any legacy `middleware.ts` examples in docs/code to `proxy.ts`.
- Libraries assuming Edge middleware (e.g. some i18n setups) may require keeping transitional `middleware.ts` — document exception in implementation contract.
- Instant Navigations (`cacheComponents` + `partialPrefetching`) is the **recommended** navigation model — routes without Suspense/`'use cache'` boundaries surface Instant Insights in dev until Stream/Cache/Block is applied.

---

## 7. Relationship to lampto ADRs

| Lampto ADR | Pulse |
|------------|-------|
| ADR-026 (Netlify) | **Not applicable** — Pulse uses Vercel |
| ADR-022 (Vercel + Next 16.2) | **Conceptually superseded by this ADR** for Pulse; adopt interception/cache rules; current pin **16.3.0** |

---

## 8. Agent checklist

- [ ] `package.json` pins `"next": "16.3.0"` (and matching `@next/third-parties`, `eslint-config-next`)
- [ ] New route protection uses **`proxy.ts`**, not `middleware.ts`
- [ ] `auth.config.ts` used in proxy; `auth.ts` only in server handlers/actions
- [ ] No `@pulse/policy-server` in `proxy.ts` / `middleware.ts`
- [ ] Async `cookies` / `headers` / `params` / `searchParams`
- [ ] Mutations use `updateTag` / `revalidateTag` / `revalidatePath` per scenario
- [ ] New cross-request cached reads use **`'use cache'`** + `cacheTag()` — not `unstable_cache`
- [ ] Background work → Cron/jobs, not `unstable_after`
- [ ] Region error boundaries prefer **`catchError`** from `next/error` (§12.1)
- [ ] `next.config` recommends **`cacheComponents: true`** + **`partialPrefetching: true`**; routes use Stream / Cache / Block (§9)
- [ ] Do **not** enable `typescript@^7` / experimental flags without §9

---

## 9. Next.js 16.3 features — adopt vs defer

Pin is **16.3.0**. Zero-code framework improvements apply automatically.

### Available now (recommended / best practice)

| Topic | Guidance |
|-------|----------|
| **Instant Navigations** | **Best practice:** `cacheComponents: true` **and** `partialPrefetching: true` in `apps/web/next.config.ts`. Per route: **Stream** (`Suspense` / `loading.tsx`), **Cache** (`'use cache'` + tags), or deliberate **Block** (`export const instant = false` with a reason). See [`ai_loading_patterns.md`](../../guidelines/nextjs/ai_loading_patterns.md) §8.1 |
| **Playwright `instant()`** | **SHOULD** on critical navigations (`/trainers`, booking) once flags are on |
| **`catchError` (`next/error`)** | Prefer stable `catchError` + `retry()` for region boundaries — §12.1 |
| **AGENTS.md Next block** | Commit `nextjs-agent-rules` from `next dev` **or** set `agentRules: false` if monorepo `AGENTS.md` conflicts |
| **Turbopack defaults** | Keep Turbopack for `dev`/`build`; do not force `--webpack` without documented need |

### Do **not** recommend / canonicalize

| Topic | Reason |
|-------|--------|
| Blind `export const instant = false` on every route | Opt-out without product reason — defeats Instant Navigations |
| Forcing every pixel into the instant shell | Trade-offs per region; Stream dynamic private data |
| `typescript@^7` in monorepo | Ecosystem (Prisma, ESLint, CI) lag — optional experiment only |
| `experimental.useOffline` / `turbopackRustReactCompiler` | Experimental |
| `import.meta.glob` as product pattern | Niche; Pulse uses DAL + Prisma |
| `next/root-params` as must | Cookie-first i18n ([ADR-009](./adr_009_ui_locale_strategy.md)) — useful only if root dynamic segments appear |
| Floating `^16` / auto-latest | Violates pin policy |
| Reverting to `middleware.ts` as canon | **`proxy.ts` remains canonical** |

---

## Related documents

- [`adr_index.md`](./adr_index.md) — ADR registry
- [`decision_process.md`](./decision_process.md) — ADR process
- [ADR-001](./adr_001_stack_and_runtime.md)
- [`docs/guidelines/nextjs/README.md`](../../guidelines/nextjs/README.md)
- [`.cursor/rules/nextjs-vercel-app-router.mdc`](../../../.cursor/rules/nextjs-vercel-app-router.mdc)
- [`cache_revalidation_policy.md`](../05_runtime/cache_revalidation_policy.md) — tag/path invalidation detail (W5)
- Lampto reference: [`adr_022_next16_vercel_runtime_policy.md`](../../examples/lampto/docs/prds/07_governance/adr_022_next16_vercel_runtime_policy.md)

## Change log

| Date | Change |
|------|--------|
| 2026-05-23 | v1.0 — ACCEPTED; pin 16.2.6 + `proxy.ts` |
| 2026-08-10 | v1.1 — §9 Next.js 16.3 roadmap (docs only); pin unchanged |
| 2026-08-10 | v1.2 — **pin `16.3.0`**; §9 adopt/defer for Instant Navigations; `catchError` recommended |
| 2026-08-10 | v1.3 — Instant Navigations + `partialPrefetching` = **recommended best practice** |

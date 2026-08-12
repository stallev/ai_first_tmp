# Next.js Guidelines — Pulse

**Baseline:** Next.js **16.3.0** (pinned) App Router · **Vercel** · Turbopack · Neon + Prisma v7  
**Methodology:** [`docs/meta/ai_first_project_methodology.md`](../../meta/ai_first_project_methodology.md)  
**Runtime policy (mandatory):** [ADR-002](../../prds/07_governance/adr_002_next162_vercel_runtime_policy.md)  
**Stack:** [ADR-001](../../prds/07_governance/adr_001_stack_and_runtime.md)  
**Reference:** lampto [`docs/examples/lampto/docs/guidelines/nextjs/`](../../examples/lampto/docs/guidelines/nextjs/)

---

## Version pin

```json
"next": "16.3.0"
```

Agents must not use Next.js 15 docs/patterns for request interception or runtime policy. Instant Navigations (`cacheComponents` + `partialPrefetching`) — **best practice** (ADR-002 §9).

---

## Next.js 16: `proxy.ts` vs `middleware.ts`

Per official Next.js 16 upgrade guide (Context7 `/vercel/next.js`):

| Legacy (v15) | Pulse canonical (v16.3.0) |
|--------------|---------------------------|
| `middleware.ts` | **`proxy.ts`** |
| `export function middleware()` | **`export function proxy()`** |
| Edge runtime typical | **`proxy` = Node.js runtime** |

- **Do not** add new auth/route logic to `middleware.ts`.
- **Codemod:** `npx @next/codemod@canary middleware-to-proxy .`
- **Auth:** `proxy.ts` imports **`auth.config.ts`** only (no Prisma).

---

## Available guidelines

| Document | Topic |
|----------|--------|
| [ai_nextjs_db_data_handle.md](./ai_nextjs_db_data_handle.md) | Server Actions vs Route Handlers, DAL, iOS Safari §7 |
| [ai_loading_patterns.md](./ai_loading_patterns.md) | `loading.tsx`, Suspense, streaming shell, page performance; **`'use cache'`** (not `unstable_cache`) |
| [ai_vercel_runtime_compatibility.md](./ai_vercel_runtime_compatibility.md) | Vercel + Next 16 baseline |
| [ai_admin_interface_requirements.md](./ai_admin_interface_requirements.md) | Admin forms layout |
| [blob-upload-agent-instruction.md](./blob-upload-agent-instruction.md) | **Deprecated** — use [s3-upload-agent-instruction.md](./s3-upload-agent-instruction.md) |
| [s3-upload-agent-instruction.md](./s3-upload-agent-instruction.md) | S3 presigned + `file_asset` |

---

## Key principles

1. **Next.js 16.3.0 + Vercel** per ADR-001/ADR-002; async Request APIs.
2. **`proxy.ts`** for request interception; split Auth.js config.
3. **Cache reads:** **`'use cache'`** + `cacheTag()` / `cacheLife()` for cross-request data — not `unstable_cache`; **`cacheComponents: true`** when enabled.
4. **Cache invalidation:** `updateTag` (Server Actions) / `revalidateTag` / `revalidatePath`.
5. **No `unstable_after`** for jobs — Vercel Cron + `delivery_log`.
6. **Server Components by default** — thin BFF to `packages/`.
7. **Instant Navigations / `partialPrefetching`:** **best practice** — with `cacheComponents`; Stream / Cache / Block (ADR-002 §9).

---

## Agent runtime verification (on user request only)

Skill **`next-dev-loop`** confirms a feature works in a live `next dev` by cross-checking **two views** of the same app:

| View | Tool | Knows |
|------|------|--------|
| Next.js | `/_next/mcp` | routes, segments, RSC, server actions, server logs, Turbopack compile issues |
| Browser | `agent-browser` | DOM, console, network, React fiber/props/state, vitals |

**Loop (when the skill is running):** narrow scope via runtime → edit → 4 layers — (1) compilation, (2) runtime errors, (3) browser UX, (4) React behavior — then cross-check both views.

**Trigger:** start **only** when the user explicitly asks (e.g. «проверь в runtime», «next-dev-loop», «verify in browser / live»). Do **not** auto-start after UI edits, before DoD, or in the commit pipeline. Default verification remains `typecheck` + `lint`.

Requires Next **16.3+** Turbopack and `agent-browser` ≥ 0.31.1. Protocol details live in the user skill — do not invent a second browser protocol as a substitute.

See: [`ai_first_project_methodology.md`](../../meta/ai_first_project_methodology.md) §2.2 · `agent-commit-pipeline.mdc` §1 · boilerplate [ADR-010](../../../../../reference/adr_010_nextjs_app_architecture_skill.md) (workflow vs architecture skills).

---

## For AI assistants

1. Read [ADR-002](../../prds/07_governance/adr_002_next162_vercel_runtime_policy.md) before routing/auth (incl. §9 Instant Navigations).
2. Use MCP **Context7** (`/vercel/next.js`) for API wording after ADR-002.
3. React: [React guidelines](../react/README.md).

**Cursor rules:** `nextjs-vercel-app-router.mdc`, `data-server-actions-and-api.mdc`, `ios-safari-mutation-transport.mdc`, `app-router-streaming-loading.mdc`, `s3-file-asset-uploads.mdc`, `admin-forms-layout.mdc`

---

**Last updated:** August 2026 · **Next.js:** 16.3.0 · **Hosting:** Vercel

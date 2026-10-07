# Stack Patterns — extracted from Pulse (fitapp)

**Назначение:** domain-neutral паттерны для новых проектов на full Pulse stack.  
**Reference implementation:** [`docs/examples/pulse/`](../examples/pulse/)

---

## Monorepo import rules

| From | To | Status |
|------|-----|--------|
| `apps/web` | `packages/domain` | ✅ |
| `apps/web` | `packages/policy/server` | ✅ Route Handlers + Server Actions only |
| `proxy.ts` | `packages/policy/server` | ❌ |
| `packages/domain` | `packages/db` | ❌ |
| `packages/*` | `apps/*` | ❌ |

---

## Request path (Next.js 16.2.6)

```
Request → proxy.ts (nodejs, auth.config only)
       → Route Handler / Server Action (thin)
       → packages/domain use-case
       → packages/policy/server (if needed)
       → src/data/*.server.ts (DAL)
       → Prisma
```

---

## File naming (`apps/web`)

| Kind | Pattern |
|------|---------|
| Server data | `get-*.server.ts`, `update-*.server.ts` |
| Client UI | `*.client.tsx` |
| Feature component | `PascalCase.tsx`, named export |
| Page/layout | `page.tsx`, `layout.tsx` — default export only |

---

## Mutation UX stack

1. `useActionState` / `useTransition` / `useOptimistic` + `useTransition`
2. `disabled={pending}` + `aria-busy={pending}`
3. `toast.success/error` from `sonner` (2s duration)
4. iOS Safari: dual transport (Class A/B) — rule `ios-safari-mutation-transport.mdc`

---

## Design Lab contract

- Dev route: `/design-system` in `(dev)` group
- Product imports: `@/components/atoms`, `@/components/ui/*`
- **Forbidden:** `@/components/design-lab/**` in product routes

---

## Jobs (post-MVP email)

- Tables: `job_execution`, `delivery_log` on MVP
- Every job: `idempotency_key`
- Never in request path — Vercel Cron

---

## Observability

- Sentry: `@sentry/nextjs`, DSN env, mutation tags
- Session Replay — deferred

---

## File uploads (AWS S3)

- Guideline: [`guidelines/nextjs/ai_s3_file_upload_guidelines.md`](../../guidelines/nextjs/ai_s3_file_upload_guidelines.md)
- Rule: `s3-file-asset-uploads.mdc` (T1)
- Bootstrap AWS: [`BOOTSTRAP.md`](../../BOOTSTRAP.md) §Шаг 7

---

## Security patterns

| Layer | Pattern |
|-------|---------|
| **CSP** | Nonce per-request в `proxy.ts` — `crypto.randomUUID()` → base64; nonce в `x-nonce` header → Server Component |
| **allowedOrigins** | `next.config.ts` → `experimental.serverActions.allowedOrigins` при reverse proxy/CDN |
| **dangerouslySetInnerHTML** | Только с `isomorphic-dompurify`; текущие JSON-LD / CSS vars безопасны без санитайзера |
| **Auth.js cookies** | `httpOnly`, `secure`, `sameSite: 'lax'` — выставляет Auth.js автоматически |
| **Route Handler CSRF** | Проверка `origin` header на мутирующих endpoints |
| **Секреты** | `timingSafeEqual` из `crypto` для timing-safe comparison |

Guide: [`docs/guidelines/security/ai_security_xss_csrf_guidelines.md`](../../guidelines/security/ai_security_xss_csrf_guidelines.md)  
Cursor rule: **security-csp**

---

## Bundle & Performance

| Topic | Pattern |
|-------|---------|
| **Server Component first** | `'use client'` только для hooks/browser API; RSC по умолчанию |
| **`.client.tsx` suffix** | Client entry files; Server Components без суффикса |
| **`optimizePackageImports`** | `['lucide-react', 'date-fns']` в `next.config.ts` → tree-shake иконки и date функции |
| **CSS transitions** | Только `transform`/`opacity` в анимациях (Composite only); **запрет `transition-all`** где меняются layout-свойства |
| **`will-change`** | Только для постоянно анимируемых элементов; apply-before/remove-after паттерн |
| **Dynamic import** | `next/dynamic` для тяжёлых client deps (Calendar, rich editor) — rule `ai_client_lazy_loading.md` |
| **`prefers-reduced-motion`** | Глобальный CSS reset в `globals.css` |

Guide: [`docs/guidelines/react/ai_browser_rendering_performance.md`](../../guidelines/react/ai_browser_rendering_performance.md)  
Cursor rule: **ui-animation-performance**

---

## Context7 pinned versions

| Package | Version |
|---------|---------|
| next | 16.2.6 |
| react | 19.x |
| prisma | 7.x |
| tailwindcss | 4.x |
| auth.js | 5.x |

---

## Pulse reference files (study order)

1. `docs/examples/pulse/apps/web/src/proxy.ts`
2. `docs/examples/pulse/packages/domain/`
3. `docs/examples/pulse/docs/implementation/mvp/contracts/`
4. `docs/examples/pulse/.cursor/rules/`

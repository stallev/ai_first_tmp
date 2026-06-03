# Data fetching patterns — Next.js 16 / React 19

**Stack:** Next.js **16.2.6**, React 19, Prisma v7  
**Methodology:** [`docs/meta/ai_first_project_methodology.md`](../../docs/meta/ai_first_project_methodology.md)  
**Deep dive:** [`docs/general/02-data-fetching.md`](../../docs/general/02-data-fetching.md)  
**DAL canon:** [`ai_nextjs_db_data_handle.md`](./ai_nextjs_db_data_handle.md)  
**Loading UX:** [`ai_loading_patterns.md`](./ai_loading_patterns.md)  
**Cursor rules:** **data-server-actions-and-api**, **app-router-streaming-loading**

---

## 1. Architectural default (MUST)

**Server Components → DAL directly.** Не делать self-fetch к собственным API из RSC.

```typescript
// ❌ Anti-pattern
const user = await fetch("/api/user").then((r) => r.json());

// ✅ DAL
const user = await getUserFromDb(userId);
```

Client-side `fetch` / TanStack Query — только для сложной **client-only** логики (optimistic toggles, infinite scroll, tab sync).

---

## 2. Cache layers (Next.js 16)

```
React.cache()     → per-request dedup (one render pass)
'use cache'       → cross-request (Vercel Data Cache)
Full Route Cache  → HTML + RSC payload
Router Cache      → client navigation
```

### React.cache() — per-request dedup

```typescript
import { cache } from "react";

export const getUser = cache(async (userId: string) => {
  return db.users.findUnique({ where: { id: userId } });
});
// Header + Sidebar both call getUser('123') → one DB query
```

### 'use cache' — cross-request

```typescript
import { cacheLife, cacheTag } from "next/cache";

export async function getPublicTrainers() {
  "use cache";
  cacheLife("hours");
  cacheTag("trainers");
  return db.trainers.findMany({ where: { status: "approved" } });
}
```

### Invalidation (Server Actions)

| Method | When |
|--------|------|
| `updateTag(tag)` | Server Action — read-your-own-writes |
| `revalidateTag(tag)` | Webhook / background |
| `revalidatePath(path)` | Full route invalidate |

---

## 3. Parallel vs streaming

```tsx
// ✅ Parallel independent queries
const [user, stats] = await Promise.all([
  getUserFromDb(userId),
  getStatsFromDb(userId),
]);

// ✅ Streaming — fast shell first
<Suspense fallback={<StatsSkeleton />}>
  <SlowStats />
</Suspense>
```

Prefer **separate Suspense boundaries** per slow region — см. **app-router-streaming-loading**.

---

## 4. Client fetch — race conditions

When client `fetch` is required:

### AbortController (MUST for search/filter effects)

```tsx
useEffect(() => {
  const controller = new AbortController();
  fetch(`/api/products?category=${categoryId}`, { signal: controller.signal })
    .then(/* ... */)
    .catch((err) => {
      if (err.name !== "AbortError") setError(err.message);
    });
  return () => controller.abort();
}, [categoryId]);
```

### Stable Promise for `use()` (React 19)

Не создавать новый Promise каждый render — кэшировать вне компонента или передавать с сервера как prop.

---

## 5. Retry (client / edge cases)

- **Exponential backoff + jitter** — не синхронные retry-шторма (Thundering Herd)
- **Не retry** 400, 401, 403, 404, 422
- **Retry** 429 (respect `Retry-After`), 5xx, network errors
- iOS Safari `Load failed` — см. **ios-safari-mutation-transport**

---

## 6. Libraries vs custom

| Use Server + DAL | Use TanStack Query / SWR |
|------------------|--------------------------|
| Page data, lists, detail | Complex client cache, infinite scroll |
| `'use cache'` public reads | Multi-tab sync |
| Server Actions mutations | Polling |

**Senior rule:** понимай, что делает библиотека под капотом, прежде чем добавлять dependency.

---

## 7. Agent checklist

- [ ] RSC не self-fetch к `/api/*`
- [ ] Shared server reads обёрнуты в `cache()` или `'use cache'`
- [ ] Server Action mutations → `updateTag` / `revalidatePath` где нужно
- [ ] Client effects с changing deps → `AbortController`
- [ ] Parallel `Promise.all` vs sequential await — осознанный выбор
- [ ] Mutation vs route loading разделены (**ai_loading_patterns** §6)

---

## 8. Related

| Document | Topic |
|----------|--------|
| [`docs/general/02-data-fetching.md`](../../docs/general/02-data-fetching.md) | Full theory: SWR, dedup impl, retry code |
| [`ai_nextjs_db_data_handle.md`](./ai_nextjs_db_data_handle.md) | Actions vs Route Handlers |
| [`ai_optimistic_ui_pattern.md`](../react/ai_optimistic_ui_pattern.md) | Client optimistic |
| Pulse reference | `docs/examples/pulse/apps/web/src/data/` |

**Reference:** Pulse (docs/examples/pulse) — DAL structure; **Guidelines текущего проекта override Pulse**.

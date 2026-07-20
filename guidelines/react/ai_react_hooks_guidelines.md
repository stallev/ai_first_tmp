# React hooks guidelines — Pulse

**Stack:** React 19, Next.js **16.2.6** App Router  
**Related:** [ai_form_handling_pattern.md](./ai_form_handling_pattern.md), [ai_optimistic_ui_pattern.md](./ai_optimistic_ui_pattern.md)

---

## 1. Rules of Hooks

- Only at **top level** — not inside conditions, loops, or nested callbacks; hook call order must stay stable across renders (linked-list of hook state under Fiber).
- Only from **React function components** or **other custom hooks** — never from plain JS functions, classes, or event handlers.
- Component body is a **pure render** — no `fetch`, `localStorage`, timers, or `console.log` directly in the render path; side effects live in `useEffect` or event handlers.
- Client components only (`'use client'`).

---

## 2. State discipline (`useState`)

- **Never mutate** state directly (`state.items.push(x); setState(state)`); always produce a new reference (`setItems(prev => [...prev, x])`).
- **Functional updates** (`setCount(prev => prev + 1)`) when next state depends on previous — avoids stale-closure bugs from event handlers / async callbacks.
- **Derived values are not state** — compute in render (`const fullName = \`${first} ${last}\``) instead of `useState` + `useEffect` sync; use `useMemo` only for measurably expensive derivations.
- **Lazy initializer** for expensive initial state: `useState(() => expensiveComputation())`, not `useState(expensiveComputation())`.

---

## 3. Data fetching

- **Server Components** — async/await Prisma in `src/data/**` or colocated `.server.tsx`
- **Client** — avoid fetching protected data; use Server Actions or Route Handlers
- No `useEffect` for initial page data that RSC can load

---

## 4. Effects discipline (`useEffect`)

- **Never pass an `async` function directly** to `useEffect` (`useEffect(async () => {...}, [])` breaks cleanup + triggers a React warning) — declare the async function *inside* the effect and invoke it.
- **List every dependency the effect closes over**; missing deps cause stale-closure bugs (effect reads an outdated prop/state value).
- **Always clean up** subscriptions, timers, and in-flight requests that outlive the component/deps change — `return () => { ... }`. For fetch specifically, prefer **`AbortController`** over an `isMounted` flag; full pattern: [`ai_data_fetching_patterns.md`](../nextjs/ai_data_fetching_patterns.md) §4.
- If the effect only computes a value from existing props/state — it does not belong in `useEffect`; see §2 derived values.

---

## 5. Refs (`useRef`)

- Use for **mutable values that must not trigger a re-render**: render counters, previous-prop tracking, timer/subscription handles kept for cleanup, DOM node references.
- **Do not use `useState`** for values the UI never reads — that adds an unnecessary render on every update.

---

## 6. Async UI state — discriminated unions

For any hand-rolled loading/error/success state (rare — prefer `useActionState` for mutations, RSC/Suspense for reads), model it as a **discriminated union**, not independent booleans (`isLoading` + `isError` + `data` can produce impossible combinations):

```typescript
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }
```

---

## 7. `use()` (React 19)

- Not a classic hook — can be called conditionally, has no internal state.
- The **Promise must be stable** across renders (created outside the component, in a parent, or memoized) — a new Promise per render re-triggers Suspense indefinitely. Full pattern: [`ai_data_fetching_patterns.md`](../nextjs/ai_data_fetching_patterns.md) §4.
- Wrap the consumer in **`<Suspense>` + an `ErrorBoundary`** — a rejected Promise otherwise crashes the tree.

---

## 8. Mutations

| Hook | Use when |
|------|----------|
| `useActionState` | Form + server validation state |
| `useFormStatus` | Pending in child submit inside same `<form>` |
| `useTransition` | Imperative submit, optimistic flows |
| `useOptimistic` | Toggle/list-append before server confirms |

Always pair mutations with **ui-mutation-pending** + **ui-toast-mutations**.

---

## 9. URL state

- Prefer **`nuqs`** or Next.js `searchParams` for filters (catalog, admin lists) when scaffolded
- Sync filter state with shareable URLs per client_flow

---

## 10. Custom hooks

- Place in `src/hooks/` — one concern per hook (`useBookingWizard`, `useMediaQuery`)
- **Naming:** `use` + PascalCase; file kebab-case (`use-booking-wizard.ts`)
- **`use` prefix only if the function calls Hooks** — otherwise plain `getX` / `formatX` in `@/lib/`
- Pure logic → `@/lib/` instead of hooks

Cursor rule: **react-naming-conventions**. React canon: [custom hooks](https://react.dev/learn/reusing-logic-with-custom-hooks) (`/reactjs/react.dev` via Context7).

**Reference:** Pulse reference [`ai_react_hooks_guidelines.md`](../../examples/lampto/docs/guidelines/react/ai_react_hooks_guidelines.md)

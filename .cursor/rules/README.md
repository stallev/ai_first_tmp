# Cursor Rules — Tier Manifest

34 rule из Pulse stack + lab PSI + dependency pinning, parameterized для новых проектов.  
**Methodology:** [`docs/meta/ai_first_project_methodology.md`](../../docs/meta/ai_first_project_methodology.md) §2.4

**Референс:** [`docs/examples/pulse/`](../../docs/examples/pulse/) — Pulse snapshot. **Guidelines + Rules boilerplate override Pulse code** — [`pulse_project_reference.md`](../../docs/reference/pulse_project_reference.md).

## Активация при bootstrap (P0 / P4)

1. Скопировать все `.mdc` из нужных tier-папок в `.cursor/rules/` (или symlink)
2. Переименовать `project-context.template.mdc` → `project-context.mdc` после заполнения placeholders
3. T2 rules **не включать** до завершения P6 (Design System Lab)

## Claude Code mirror

После любой правки или копирования `.mdc` в **корень** `.cursor/rules/` (не `tiers/`): `npm run rules:sync`. Зеркало: [`.claude/rules/*.md`](../../.claude/rules/) — **не править руками**. Не синкать `*.template.mdc`. Playbook: [`docs/claude-code-cursor-rules-sync.md`](../../docs/claude-code-cursor-rules-sync.md). CI: `npm run rules:check`.

---

## T0 — Always applied (bootstrap, день 0)

| Rule | alwaysApply | Назначение |
|------|:-----------:|------------|
| `project-context.mdc` | ✅ | Stack, invariants, doc precedence |
| `product-docs-alignment.mdc` | ✅ | Doc sync on behavior change |
| `typescript-monorepo-types.mdc` | ✅ | typecheck, package boundaries |
| `domain-literals-and-codes.mdc` | ✅ | Mutation codes, no magic strings |
| `ai-dry-deduplication.mdc` | ✅ | DRY / SOLID for agents |
| `model-routing.mdc` | ✅ | Task tier T0–T3, Definition of Ready, spec-gap, commit units, субагенты, гигиена токенов. Канон: [`docs/meta/ai_agent_model_routing.md`](../../docs/meta/ai_agent_model_routing.md). Не путать с rule-tier этой таблицы. |
| `agent-commit-pipeline.mdc` | ✅ | Auto-commit на границе CU / по запросу: verify → review (уровень по diff) → conventional commit |
| `agent-code-review-subagent.mdc` | — | Review protocol: проблема → ожидаемая форма → diff; единый гейт CU — субагент `reviewer` для runtime-кода, `diff-only` для docs (requestable). Не Bugbot. |

Файлы: [`tiers/t0-always/`](tiers/t0-always/)

---

## T1 — Implementation (после W1 governance + перед/во время P5 scaffold)

| Rule | Назначение |
|------|------------|
| `nextjs-vercel-app-router.mdc` | Next.js 16.4 (exact patch, no caret), `proxy.ts`, Instant Navigations |
| `auth-security.mdc` | Auth.js v5, JWT, defense in depth |
| `security-xss-csrf.mdc` | XSS, CSRF, CSP, DOMPurify |
| `policy-packages.mdc` | `@{{PACKAGE_SCOPE}}/policy-*` boundaries |
| `data-server-actions-and-api.mdc` | DAL, Actions vs Route Handlers |
| `app-router-streaming-loading.mdc` | Suspense, `loading.tsx`, cache |
| `ios-safari-mutation-transport.mdc` | iOS Safari dual transport |
| `s3-file-asset-uploads.mdc` | FileAsset + AWS S3 presigned |
| `javascript-fundamentals.mdc` | Closures, map/filter/reduce, generators, ESM modules, TS generics |
| `psi-lab-testing.mdc` | Requestable — lab PSI on deployed origin (REST, not MCP / localhost) |
| `dependency-pinning.mdc` | Exact npm versions (no `^` / `~`), `.npmrc` `save-exact`, lockfile + `npm ci`, `chore(deps)` CU; `npm run deps:check`. Globs: `package.json`, lockfile, `.npmrc` |

Файлы: [`tiers/t1-implementation/`](tiers/t1-implementation/)

---

## T2 — UI / React (после P6 Design System Lab)

| Rule | Назначение |
|------|------------|
| `react-ui-components.mdc` | RSC/client boundaries |
| `react-one-component-per-file.mdc` | One export; ≤140 lines |
| `react-logic-presentation.mdc` | Logic vs presentation split |
| `react-naming-conventions.mdc` | Naming conventions |
| `react-state-management.mdc` | useReducer/useContext/Zustand/Redux Toolkit, SSR safety |
| `ui-warm-forest-shadcn.mdc` | Design tokens, shadcn catalog |
| `ui-mobile-first.mdc` | Bottom nav / sidebar |
| `ui-prototype-fidelity.mdc` | Prototype visual parity |
| `ui-semantics-a11y.mdc` | WCAG 2.1 AA |
| `ui-animation-performance.mdc` | GPU animations, layout thrashing |
| `ui-toast-mutations.mdc` | Sonner after mutations |
| `ui-mutation-pending.mdc` | `aria-busy`, pending UI |
| `ui-optimistic-mutations.mdc` | `useOptimistic` toggles |
| `ui-messages-and-copy.mdc` | `@/lib/messages` |
| `ui-messages-bundle-splitting.mdc` | Срезы словаря по типу страницы и локали; полный словарь не в клиентском бандле |
| `ui-icons-lucide.mdc` | lucide-react |
| `admin-forms-layout.mdc` | Admin forms layout |
| `patterns-tables-dnd.mdc` | Responsive tables |

Файлы: [`tiers/t2-ui/`](tiers/t2-ui/)

---

## Guidelines mapping

Полный индекс: [`guidelines/README.md`](../../guidelines/README.md)  
General deep dives: [`docs/general/README.md`](../../docs/general/README.md)

| Rule cluster | Guidelines |
|--------------|------------|
| Security (XSS/CSRF) | `guidelines/security/ai_security_xss_csrf_guidelines.md` |
| Next.js / Vercel | `guidelines/nextjs/*` |
| Lab PSI (deployed) | `guidelines/psi-lab-testing.md` + `guidelines/nextjs/ai_psi_lab_testing.md` |
| Code review (protocol, subagent prompt) | `guidelines/ai_code_review_protocol.md` |
| React / forms / optimistic / rendering | `guidelines/react/*` |
| Auth | `guidelines/auth/ai_auth_implementation_guide.md` |
| TypeScript monorepo | `guidelines/typescript/ai_typescript_monorepo_guidelines.md` |
| Typography | `guidelines/typography_text_guidelines.md` |

---

## Reference (Pulse)

**Референсный проект:** [`docs/examples/pulse/`](../../docs/examples/pulse/) — read-only architecture & feature patterns.

**Приоритет:** Cursor Rules + Guidelines **текущего boilerplate** > Pulse reference code.

Pulse reference rules (compare): [`docs/examples/pulse/.cursor/rules/`](../../docs/examples/pulse/.cursor/rules/)  
Сводка: [`docs/reference/pulse_project_reference.md`](../../docs/reference/pulse_project_reference.md)

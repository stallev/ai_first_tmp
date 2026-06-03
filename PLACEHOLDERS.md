# Placeholders — замена при bootstrap

Замените все вхождения **до** первого промпта P0. Рекомендуется `rg '{{'` для проверки.

| Placeholder | Пример | Где используется |
|-------------|--------|------------------|
| `{{PROJECT_NAME}}` | Acme Platform | AGENTS, project-context, prompts |
| `{{PROJECT_SLUG}}` | acme-platform | package names, URLs |
| `{{PACKAGE_SCOPE}}` | acme | `@acme/domain`, `@acme/db`, npm scope |
| `{{PRODUCT_DESCRIPTION}}` | B2B marketplace for … | project-context, AGENTS |
| `{{USER_ROLES}}` | client, vendor, admin | project-context, schema |
| `{{DESIGN_SYSTEM_NAME}}` | Warm Forest | ui-warm-forest-shadcn (или переименовать rule) |
| `{{DOMAIN_INVARIANT_1}}` | e.g. `Entity.timezone` source of truth | project-context §Domain invariants |
| `{{DOMAIN_INVARIANT_2}}` | … | … |
| `{{DOMAIN_INVARIANT_3}}` | … | … |
| `{{DOMAIN_INVARIANT_4}}` | idempotency_key + delivery_log | jobs invariant |
| `{{DOMAIN_INVARIANT_5}}` | Post-MVP nullable columns | schema readiness |
| `{{CURRENT_PHASE}}` | P01 — Monorepo scaffold | project-context §Repository status |
| `{{INTERIM_DOCS_GLOB}}` | docs/default_docs/ | interim PRD archive path |
| `{{S3_KEY_PREFIX}}` | acme/ | AWS S3 object key prefix (`FILE_UPLOAD_OBJECT_KEY_PREFIX`) |

## npm scopes

После замены `{{PACKAGE_SCOPE}}`:

- `packages/domain/package.json` → `"name": "@{{PACKAGE_SCOPE}}/domain"`
- `packages/db/package.json` → `"name": "@{{PACKAGE_SCOPE}}/db"`
- `packages/policy/edge` → `"@{{PACKAGE_SCOPE}}/policy-edge"`
- `packages/policy/server` → `"@{{PACKAGE_SCOPE}}/policy-server"`

## Файлы для переименования

| Template | Target |
|----------|--------|
| `AGENTS.template.md` | `AGENTS.md` |
| `docs/meta/*.template.md` | убрать `.template` |
| `project-context.template.mdc` | `.cursor/rules/project-context.mdc` |
| `apps/web/AGENTS.template.md` | `apps/web/AGENTS.md` |

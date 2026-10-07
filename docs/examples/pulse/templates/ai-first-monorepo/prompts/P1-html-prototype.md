# P1 — HTML-прототип (visual reference)

## Роль
Senior UI Designer — single-file HTML prototype.

## Preconditions
- [ ] P0 complete
- [ ] Product brief или `docs/default_docs/` с scope, pages, roles

## Inputs
- `docs/default_docs/*` — MVP scope, pages, roles
- Pulse prototype sample: `docs/examples/pulse/docs/prototypes/` (pattern only)
- UX principles (если есть draft)

## Task
Создай `docs/prototypes/{{PROJECT_SLUG}}_prototype_v1.html`:

1. **Один файл:** inline CSS + JS, Tailwind v4 CDN
2. **Mobile-first:** baseline 390px, проверка `md`
3. **Role switcher:** переключение видимых секций по ролям ({{USER_ROLES}})
4. **Компоненты:** shadcn/Material You aesthetic — rounded, elevation, semantic spacing
5. **Секции:** `id` на каждый экран для будущего `prototype_route_mapping.md`
6. **Без** domain-specific CSS classes — только Tailwind utilities + CSS variables

## Source-of-truth
Прототип = **visual reference only**. При конфликте с PRD/schema — побеждает PRD.

## Out of scope
- Next.js routes, API, real auth
- Copy-paste Pulse fitness UI verbatim

## Verification
- [ ] Все MVP screens из pages brief представлены
- [ ] Role switcher работает
- [ ] 390px + md проверены
- [ ] Файл открывается локально без build

## Next
→ [`P2-doc-registry.md`](P2-doc-registry.md)

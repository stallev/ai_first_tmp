# P6 — Design System Lab

## Роль
Frontend Architect.

## Preconditions (Gate G4)
- [ ] P5 scaffold complete, build passes
- [ ] UX-03 `visual_identity_contract.md` exists
- [ ] HTML prototype in `docs/prototypes/`

## Inputs
- [`specs/design_system_lab_spec.template.md`](../specs/design_system_lab_spec.template.md)
- Pulse spec: `docs/examples/pulse/docs/implementation/mvp/specs/design_system_lab_spec.md`
- Prototype + UX contracts (UX-01..UX-05)
- Context7: shadcn MCP, Tailwind v4

## Task
1. Create `docs/implementation/mvp/specs/design_system_lab_spec.md` from template
2. **Tokens:** `apps/web/src/app/globals.css` — `:root`, `.dark`, `@theme inline` per {{DESIGN_SYSTEM_NAME}}
3. **Atoms:** Heading, SectionTitle, ContentText, AlertText → `components/atoms/`
4. **Primitives:** tokenized Button, Card, CustomLink, PulseCard (rename per project)
5. **Design Lab:** route `/design-system` in `(dev)` group — L1 Tokens + L2 Primitives + L3 Patterns (minimal)
6. Activate **T2 cursor rules** (15 UI/React rules) → `.cursor/rules/`
7. Update `canonical_routes.md` with `/design-system`
8. Update `ui-warm-forest-shadcn.mdc` or create project-themed rule if renamed

## Agent cycle
КОНТЕКСТ → ФАЗА (P01/P03) → КОНТРАКТ (this spec) → ЗАДАЧИ → ВЕРИФИКАЦИЯ

## Forbidden
- Product routes importing `@/components/design-lab/**`
- Generic shadcn colors bypassing semantic tokens
- Feature molecules (TrainerCard etc.) — later phases

## Verification
- [ ] Design Lab renders on 390px and md
- [ ] 27 rules total active (T0+T1+T2)
- [ ] Spec acceptance criteria pass
- [ ] `npm run lint` pass
- [ ] Prototype visual parity spot-check (3+ components)

## Next
→ Implementation phases P01+ per `docs/implementation/mvp/tasks/`

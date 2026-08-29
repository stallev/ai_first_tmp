---
description: Commit pipeline: verify → subagent review → branch-prefixed conventional commit + git tooling setup
---
# Agent commit pipeline

**Review spec:** [`agent-code-review-subagent.mdc`](agent-code-review-subagent.mdc)  
**Methodology:** [`docs/meta/ai_first_project_methodology.md`](docs/meta/ai_first_project_methodology.md) §2.2 ВЕРИФИКАЦИЯ

## Trigger

Коммит **только по явному запросу пользователя**. Не коммитить проактивно.

## Pipeline (порядок обязателен)

```
ВЕРИФИКАЦИЯ → stage → review (если нужен) → compose message → git commit → commitlint (hook)
```

### 1. Deterministic verification

Перед коммитом, если затронут код:

- `npm run typecheck` (root monorepo) — когда workspaces уже есть (после P5)
- `npm run lint` — когда скрипт есть
- `npm run rules:check` — если есть `.claude/rules/` (после `rules:sync`)
- Phase DoD из `P{N}_tasks.md`, если задача привязана к фазе

Если в задаче правили `.cursor/rules/*.mdc` — в **той же задаче** `npm run rules:sync` и закоммитить `.claude/rules/`. Не править зеркало руками.

При fail — исправить, не коммитить.

**Runtime dual-view (`next-dev-loop`):** только по **явному запросу пользователя** — не часть обязательной ВЕРИФИКАЦИИ перед commit и не auto на UI-diff. Модель: `/_next/mcp` + `agent-browser`, 4 слоя (compile → runtime errors → browser UX → React). См. methodology §2.2 / `guidelines/nextjs/README.md` § Agent runtime verification.

### 2. Collect git context

Параллельно:

- `git status`
- `git diff` (staged + unstaged)
- `git log --oneline -10`

Stage только релевантные файлы (`git add`). Не коммитить `.env`, credentials.

### 3. Pre-commit review

Выполнить **[`agent-code-review-subagent.mdc`](agent-code-review-subagent.mdc)** в режиме **pre-commit**:

1. Проверить threshold — можно ли пропустить review
2. Если review нужен — **[`agent-code-review-subagent.mdc`](agent-code-review-subagent.mdc)** → Task `generalPurpose` (`readonly: true`). **Не** `bugbot` (платный)
3. **Blocker** → исправить diff → re-review если правка нетривиальна → только потом commit
4. **Suggestions only / no findings** → продолжить §4

### 4. Compose commit message

**Branch prefix = имя текущей ветки** (`git branch --show-current`), без изменений:

```
<branch-name>: type(scope): subject

[optional body — WHY, not WHAT]

[optional footer — BREAKING CHANGE]
```

#### Types

| Type | Когда |
|------|-------|
| `feat` | Новая функциональность для пользователя |
| `fix` | Исправление бага |
| `refactor` | Рефакторинг без изменения поведения |
| `perf` | Оптимизация производительности |
| `docs` | Только документация |
| `test` | Тесты |
| `chore` | Зависимости, конфиги, тулинг |
| `ci` | CI/CD |
| `revert` | Откат коммита |
| `style` | Форматирование без логики |

#### Scopes (optional, lowercase, hyphens ok)

`web` · `domain` · `db` · `policy` · `auth` · `ui` · `docs` · `config` · `ci` · `deps` · `dal` · `types` · `hooks` · `i18n`

#### Rules

- Imperative mood · lowercase subject · no trailing `.` · header ≤ 120 chars
- Body объясняет **ПОЧЕМУ**, не что
- Breaking: `type(scope)!:` + footer `BREAKING CHANGE: ...`
- На `main` / `develop` commitlint допускает commit **без** prefix — агенту **предпочтительно** `<branch-name>:`

#### Examples

```
feature/P6-auth: feat(auth): add google oauth provider
P6-add-google-auth: fix(web): resolve filter re-render
main: chore(docs): sync canonical routes
```

#### Anti-patterns

- ❌ `feat(auth): add oauth` — нет branch prefix (на feature-ветке)
- ❌ `feature/P6-auth feat(auth): ...` — нет `: ` после branch name
- ❌ `feature/P6-auth: Fixed the bug` — неверный регистр/время
- ❌ Один коммит на несколько несвязанных фич

### 5. Execute commit

- HEREDOC для message (Windows/PowerShell: эквивалент без интерактива)
- После commit — `git status` для verify
- Hook fail → исправить message → **новый commit**, не `--amend` (кроме случаев из user rule)

---

## Git tooling setup (P5 scaffold)

Boilerplate: [`scaffold/commitlint.config.mjs`](scaffold/commitlint.config.mjs), [`scaffold/.husky/`](scaffold/.husky/) → копировать в корень monorepo.

### Dependencies

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional husky conventional-changelog-cli
npm install --save-dev lint-staged  # recommended
```

### commitlint.config.mjs

Optional branch prefix (= git branch name), then conventional header. Config — [`scaffold/commitlint.config.mjs`](scaffold/commitlint.config.mjs). Использовать `.mjs` (без ts-node).

### husky

```bash
npx husky init
```

`.husky/commit-msg`: `npx --no -- commitlint --edit "$1"`  
`.husky/pre-commit` *(recommended)*: `npx --no -- lint-staged`

```json
{
  "scripts": { "prepare": "husky", "changelog": "conventional-changelog -p conventionalcommits -i CHANGELOG.md -s -r 0" },
  "lint-staged": { "*.{ts,tsx,js,jsx,mjs}": "eslint --fix --max-warnings=0" }
}
```

**Vercel / CI:** `HUSKY=0` в env **или** cross-platform `prepare`:

```json
"prepare": "node -e \"try{require('fs').accessSync('.git');require('child_process').execSync('husky',{stdio:'inherit'})}catch(e){}\""
```

**`.gitignore`:** не игнорировать `.husky/`.

### Verify commitlint

```bash
echo "feature/P6-auth: add google oauth" | npx commitlint   # fail
echo "feature/P6-auth: chore: test setup" | npx commitlint  # pass
```

### CHANGELOG caveat

`conventional-changelog-cli` не парсит `<branch-name>:` prefix по умолчанию.

---

## Related

- **agent-code-review-subagent** — standalone или pre-commit review
- User rule: git safety (no force push, no skip hooks, commit only when asked)
- **typescript-monorepo-types** · **product-docs-alignment**

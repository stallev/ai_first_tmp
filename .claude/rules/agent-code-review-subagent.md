---
description: Review protocol: problem → expected shape → diff, depth by risk and budget. Self-review by default; fresh-context readonly subagent for sensitive zones / on request. Standalone or pre-commit (via agent-commit-pipeline). Do NOT use bugbot.
---
# Code review

**Commit orchestration:** [`agent-commit-pipeline.mdc`](agent-commit-pipeline.mdc) — вызывает этот rule в **pre-commit** mode.
**HOW (таблицы, вердикты, prompt для subagent):** [`guidelines/ai_code_review_protocol.md`](guidelines/ai_code_review_protocol.md) — **читать перед** `self-full` / `subagent`; для `skip` / `diff-only` не нужен.

**Принцип:** глубина review ∝ риск × размер. Дорогой fresh-context review — только где цена пропущенного бага высока; остальное — дёшево, в контексте автора. Лимиты — § Budget.

## Запрещено: bugbot

**Не вызывать** `subagent_type: "bugbot"` — платная функция Cursor. Fresh-context review — **`generalPurpose`** subagent (`readonly: true`). Skills `review-bugbot` / `review-security` **не использовать**.

## Triggers

| Mode | Когда | Уровень |
|------|-------|---------|
| **standalone** | Пользователь просит review («review diff», «проверь изменения», `@agent-code-review-subagent`) | Всегда `subagent` (явный запрос); threshold **игнорировать** |
| **pre-commit** | Шаг 3 commit pipeline | Уровень по § Depth |

Standalone review **не** ведёт к commit. Reviewer **не правит код** — только находки; исправления — основной агент (или по запросу пользователя).

## Sensitive zones

**Единственный список** — pipeline ссылается сюда. Глобы с `**/`: `apps/web/src/lib/auth/**` тоже zone.

| Zone |
|------|
| `**/auth/**`, `**/api/**` |
| `packages/db/**`, `packages/policy/**`, `**/migrations/**` |
| `**/proxy.ts`, `**/middleware.ts` |
| env/security config (CSP, cookies, `.env*`, `next.config.*`) |

## Depth (уровень review)

Уровень определяет **содержимое diff**, не type коммита (его выбирает автор): `chore`, меняющий CSP или `.env*`, — sensitive zone. **Размер** = hand-written строки (added + removed); lockfiles, generated (`**/generated/**`), snapshots и зеркало `.claude/rules/**` не считаются и не читаются — их ловят `typecheck` / `rules:check`.

| Уровень | Когда (pre-commit) | Кто | Проходы |
|---------|--------------------|-----|---------|
| `skip` | ≤ 10 строк **и** вне zones | — | — |
| `diff-only` | Нет изменений runtime-кода: docs, `.mdc`, tests, tooling, комментарии, форматирование — **в том числе внутри zones** | автор | только 2c |
| `self-full` | Runtime-код вне zones: feat / fix / refactor / perf / новый компонент | автор | 2a → 2b → 2c |
| `subagent` | Любое из: (1) runtime-код в sensitive zone; (2) явный запрос пользователя; (3) runtime-код вне zones, > ~150 строк | fresh-context subagent | 2a → 2b → 2c |

Старший уровень побеждает; сомнение — брать старший. Пороги 10 и ~150 — стартовые; подстраивать по статистике trace.

| Diff | Уровень |
|------|---------|
| Опечатка в комментарии / текст кнопки, 1–3 строки | `skip` |
| 1 строка логики в `lib/auth/session.ts` | `subagent` |
| Правка docs, 40 строк | `diff-only` |
| Новый компонент, 80 строк | `self-full` |
| Server Action + миграция | `subagent` |

## Protocol (кратко)

Три прохода в порядке — **не** «прочитать diff и оценить». Таблицы и формулировки — в guideline.

1. **2a Проблема** — 3–5 строк из просьбы пользователя и `P{N}_tasks.md`, **не** из diff и **не** из своего commit message. Неясно → спросить до review; неинтерактивно — допущение в trace.
2. **2b Ожидаемая форма** — до hunks только `git status --short`; применимые строки таблицы из guideline (≤ 5 пунктов), не из памяти. В `self-full` это чеклист по контракту, а не независимое мнение; независимость даёт только `subagent`. Diff размером с фазу — по каждой задаче `P{N}_tasks.md`.
3. **2c Diff** — находка **только** по таблице вердиктов (guideline § 3): конкретный дефект (вход/состояние → неверный результат) или ссылка на канон. «Я бы сделал иначе» — **не находка**.

## Budget (качество ↔ стоимость)

Стоимость: `skip` ≈ 0 · `diff-only` ≈ одно чтение diff · `self-full` ≈ чеклист в контексте автора, без нового агента · `subagent` ≈ холодный старт + чтение diff, блокирует commit — самый дорогой.

1. **Порядок:** review — только после зелёной ВЕРИФИКАЦИИ (`typecheck` / `lint` / `rules:check`). Не тратить review на то, что ловят инструменты, и на код, который ещё перепишут.
2. **Потолок:** один `subagent` на commit. После fix — **re-review только delta** (diff правки + прежние blockers), **максимум один раз**. Blocker остался → остановиться и доложить пользователю, не крутить цикл.
3. **Suggestions** повторный review не запускают.
4. **Неизменное не пересматривать:** файлы, не менявшиеся с последнего review в этой сессии (серия коммитов по одной задаче), не перечитывать.
5. **Subagent ограничен:** staged diff + rules из таблицы 2b (guideline § 2); репозиторий не исследует; ≤ 10 находок, только high-confidence (шум = стоимость triage).
6. **Docs drift** (`diff-only`): grep изменённого термина/пути по `docs/`, не аудит всех доков.

## Fresh-context subagent

Получает **только** проблему (2a) и сам строит 2b до чтения hunks. **Не** передавать: summary автора, черновик commit message, свою «ожидаемую форму». Prompt-шаблон — guideline § 5.

- Cursor `Task`: `subagent_type: "generalPurpose"`, `readonly: true`, `run_in_background: false`
- **Не** `bugbot`; **не** Background Agent; **не** «новый чат вручную»; отдельный security-review subagent для zones **не** вызывать (security-пункт — в том же prompt)

## Trace и disposition

Trace в ответе — **всегда** (иначе проверить, что review был, нельзя); первая строка начинается с `Review:`. Для `skip` / `diff-only` — одна строка: `Review: skip — 3 строки, вне zones`. Для `self-full` / `subagent` — ≤ 4 строк (`Review` · `Проблема` · `Ожидаемая форма` · `Находки`; пример — guideline § 6).

| Severity | Критерий |
|----------|----------|
| `blocker` | Баг, явное нарушение правила, security red flag, пропуск по таблице вердиктов |
| `suggestion` | Стиль, опциональные улучшения |

| Result | pre-commit | standalone |
|--------|------------|------------|
| Blocker | Исправить → re-review delta ≤ 1 раза (§ Budget) → commit | Доложить; fix **только по запросу** |
| Suggestions only | Можно commit; принять / отложить / отклонить | Доложить (таблица Severity · Location · Finding); fix по запросу |
| No findings | Продолжить pipeline | «review found no issues» |

Не запускать commit после standalone review, если пользователь явно не просил commit.

## Diff scope

| Mode | Default scope | Override |
|------|---------------|----------|
| pre-commit | staged diff (`git diff --staged`) | — |
| standalone | uncommitted / working tree | full branch — если просят review ветки / PR |

## Related

**agent-commit-pipeline** · **product-docs-alignment** · **domain-literals-and-codes** · **ai-dry-deduplication**

# Phase run — прогон P{NN}

## Роль

Тонкий оркестратор одной фазы. Код commit unit пишет свежий `implementer`. Поток не копировать отсюда: канон — [`docs/guidelines/agent-phase-orchestration.md`](../docs/guidelines/agent-phase-orchestration.md).

## Preconditions

- [ ] `docs/implementation/mvp/tasks/P{NN}_tasks.md` существует, Phase DoR audit закрыт
- [ ] У каждого CU в заголовке есть `Review`, `Smoke` и `Commit: auto` ([`phase_tasks.template.md`](../docs/meta/phase_tasks.template.md))
- [ ] Скрипты драйвера на месте (гайд §6 и §12): `scripts/run-phase.mjs`, `scripts/cu-verify.mjs`, `scripts/cu-commit.mjs`

## Стартовая фраза

Человек запускает фазу одной фразой. В ней **обязана** быть среда: **`Среда: Cursor AI`** или **`Среда: Claude Code`**.

```text
Реализуй фазу P{NN} по docs/implementation/mvp/tasks/P{NN}_tasks.md.
Среда: Cursor AI.
Коммиты CU заранее разрешены (Commit: auto). Не пушить.
```

Для Claude Code та же фраза со строкой `Среда: Claude Code`.

Коммиты между CU не переспрашивать. Push, PR и deploy — после фазы, человеком.

## Task

### Cursor AI — `--environment cursor`

Один вызов на CU, из чата:

```bash
node scripts/run-phase.mjs P{NN} --environment cursor
```

Чат не пишет код и не читает исходники и diff. Блоки `IMPLEMENTER` и `ORCHESTRATOR` со stdout передать как есть: код — свежему `implementer`, review и commit — по блоку оркестратора. Между CU переносится только строка `<CU> — <hash>`. Следующий CU — снова `run-phase.mjs`.

### Claude Code — `--environment claude-code`

Из терминала, не из shell чата Cursor:

```bash
node scripts/run-phase.mjs P{NN} --environment claude-code
```

Драйвер сам крутит свежую headless-сессию на каждый CU.

## Forbidden

- `git push`, открытие PR, deploy, merge
- Сырые `git add` и `git commit` (только `cu-commit.mjs`)
- Production build в сессии (его выполняет hook)
- Вопрос человеку между CU
- Перенос diff, логов и review-транскрипта в следующий CU

## Verification

- [ ] Первая строка stdout драйвера — `STATUS:`
- [ ] После фазы все чекбоксы CU отмечены, есть `P{NN}-smoke.md` в `.local/phase-runs/`
- [ ] Ничего не запушено

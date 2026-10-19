# Wave run — прогон волны документации W{NN}

## Роль

Тонкий оркестратор одной волны. Файлы документов пишет свежий `doc-writer` (по одному на DU). Поток не копировать отсюда: канон — [`docs/guidelines/agent-docs-orchestration.md`](../docs/guidelines/agent-docs-orchestration.md). Среда по умолчанию — **Claude Code**; код в этой сессии не пишется.

## Preconditions

- [ ] P2 закрыт: registry canonical, `docs/meta/doc-waves/W{NN}_units.md` существует
- [ ] Gate предыдущей волны пройден; волна обязательна для профиля (registry §5.0)
- [ ] У каждого DU в заголовке есть `Review`, `Gate` и `Commit: auto`
- [ ] Скрипты на месте (P5 или ручная копия `scaffold/scripts/`): `scripts/run-wave.mjs`, `scripts/doc-verify.mjs`, `scripts/cu-commit.mjs`

## Стартовая фраза

```text
Выполни волну W{NN} по docs/meta/doc-waves/W{NN}_units.md.
Среда: Claude Code.
Коммиты DU заранее разрешены (Commit: auto). Не пушить.
```

Коммиты между DU не переспрашивать. Push, PR — после волны, человеком.

## Task

Один вызов драйвера на DU, из чата:

```bash
node scripts/run-wave.mjs W{NN}
```

Чат не пишет и не читает документы. Блок `WRITER` со stdout передать свежему `doc-writer` дословно; `gap` → один `architect`; review и commit — по блоку `ORCHESTRATOR`. Между DU переносится только строка `<DU> — <hash>`. Следующий DU — снова драйвер.

Headless-вариант из терминала (не из shell чата):

```bash
node scripts/run-wave.mjs W{NN} --harness claude
```

## Forbidden

- `git push`, PR, deploy
- Сырые `git add` / `git commit` (только `cu-commit.mjs`)
- Код, `*.mdc`, правки вне `docs/**` (кроме синхронизации правил в P4)
- Вопрос человеку между DU
- Перенос текста документов и review-транскриптов в следующий DU

## Verification

- [ ] Первая строка stdout драйвера — `STATUS:`
- [ ] Все чекбоксы DU отмечены; `.local/wave-runs/W{NN}-gate.md` создан
- [ ] `npm run docs:links` и `npm run encoding:check` зелёные
- [ ] Ничего не запушено; gate передан человеку

## Next

→ gate волны → `wave-run` для `{NN+1}`; после последней волны → [`P4-rules-guidelines.md`](P4-rules-guidelines.md)

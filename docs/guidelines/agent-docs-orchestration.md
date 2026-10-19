# Agent docs orchestration: documentation waves

Canon for creating the project's documentation (PRD, ADR, contracts, specs, data model, UX, phase tasks) with AI agents and no human confirmation between documentation units. It is the sibling of [`agent-phase-orchestration.md`](agent-phase-orchestration.md): the same mechanism, applied to `docs/**` instead of code. Shared parts are linked, not copied.

**Primary environment:** Claude Code (Sonnet 5.5 writes). Code is written in Cursor by the phase flow; **docs and code never share a session**.

**Reference implementation:** [`scaffold/scripts/`](../../scaffold/scripts/) — `unit-driver.mjs` (pure core), `run-wave.mjs`, `doc-verify.mjs`, `cu-commit.mjs`.

## 1. Goal and constraints

| Goal | How it is reached |
|------|-------------------|
| The human approves a wave once | Pre-approved `Commit: auto` in the units file; the launch phrase ([`prompts/wave-run.md`](../../prompts/wave-run.md)) |
| No context build-up across a wave | One **fresh context per documentation unit (DU)**: a `doc-writer` subagent under a thin chat. State lives in the units file and in git |
| Low token cost | Verify, stage and commit are **scripts**. Logs go to files, the agent sees a ~40-line tail |
| Quality kept | One `doc-reviewer` per normative DU; `doc-verify` catches the mechanical defects before it |
| Safe failure | Any abnormal state stops the driver with a non-zero exit. Nothing loops, nothing is pushed |

**Out of scope:** push, PR, deploy. The human does these after the wave.

## 2. Vocabulary

| Term | Meaning |
|------|---------|
| Wave `W{NN}` | A registry group of documents ([registry §5](../meta/documentation_creation_registry.md)); which waves apply is set by the quality profile (§5.0) |
| DU | Documentation unit `W{NN}-DU{k}`: one logical commit — one document or 1–3 closely linked ones. Target ≤ ~600 hand-written lines |
| Gate | A human checkpoint after a wave (G0–G6 in [`prompts/00-orchestration.md`](../../prompts/00-orchestration.md)). `Gate: blocking` stops the driver |
| DoR-ready | Registry §2.3.6 checklist: anchors, no `TBD` in MUST, error codes and message keys named, `Проверено по`, touchpoints |
| Paths H / N / S | Registry §2.3.2a triggers; every `N/A` carries an exemption reason |

## 3. Roles

| Role | Model class | Context | Writes | When |
|------|-------------|---------|--------|------|
| Chat (orchestrator) | Sonnet-class | Long-lived, thin | Nothing | Loops the driver, relays blocks, runs commit |
| `doc-writer` | Sonnet-class (`composer-2.5` → `sonnet` on sync) | Fresh per DU | `docs/**` only | Every DU |
| `architect` | Frontier, high effort | Fresh | `docs/**` (spec-gap, ADR) | Writer returns `gap`, or a blocker survives the delta |
| `doc-reviewer` | Frontier, read-only | Fresh | Nothing | DUs marked `Review: reviewer` |
| Driver / verify / commit | **Scripts** | n/a | n/a | Every DU boundary |

Rules: no router agent; subagents return ≤ 15 lines; every delegation goes from the chat, one level deep; models are pinned in `.cursor/agents/*.md` (mirrored to `.claude/agents/` by `npm run rules:sync`), never in prompts.

## 4. The flow

```text
human: "Волна W{NN}. Среда: Claude Code." (prompts/wave-run.md)
  ▼
loop until the first stdout line is not `STATUS: du …`:
  run-wave.mjs W{NN}                      ← one invocation per DU
    │ first DU whose task checkboxes are not all [x]
    │ dirty tree outside the DU's Files → STATUS: dirty, exit 1
    │ writes .local/wave-runs/<DU>.paths
    │ stdout: STATUS: du <DU> · === WRITER === block · === ORCHESTRATOR === block
    ▼
  chat = thin orchestrator (does not write or read the docs)
    ├─ `doc-writer`, fresh per DU, gets the WRITER block verbatim:
    │    read DU lines + registry row + Depends → write files + backlinks + index
    │    tick checkboxes, prune the paths-file
    │    doc-verify.mjs      → log file; exit code + tail; one retry
    │    cu-commit.mjs stage → index = paths-file
    │    returns ≤15 lines: RESULT: staged | gap | verify-fail
    ├─ gap → one `architect` spec-gap → one more `doc-writer`
    ├─ verify-fail → stop
    ├─ `Review: reviewer` → `doc-reviewer` reads `git diff --staged`
    │    blocker → doc-writer fixes → one delta re-review
    │    same blocker → one architect sentence (ADR / spec) → one more pass → still blocked: stop
    │  `Review: diff-only` → writer's own one-line `Review:`
    ├─ cu-commit.mjs commit --subject "docs(<scope>): …" → hook
    └─ one line "<DU> — <hash>", run the driver again
  ▼
all DUs ticked → .local/wave-runs/W{NN}-gate.md → human checks the gate → next wave
```

Optional headless mode: `run-wave.mjs W{NN} --harness claude` loops `claude -p --model sonnet` — one fresh session per DU with the same steps (permissions: [`phase guide §8`](agent-phase-orchestration.md)). Cursor may also run a wave (`--environment cursor`), but docs canon is Claude Code.

Exit codes and recovery are the same as in the phase guide §6.5; `Gate: blocking` plays the role of `Smoke: blocking` (exit 2).

## 5. Units file contract

`docs/meta/doc-waves/W{NN}_units.md`, generated at P2 from the registry for the waves the profile enables. The driver parses it; the grammar is strict.

```markdown
## W03 — Data model and flows

### W03-DU2 — docs(prd): add booking data model · Review: reviewer · Gate: none · Commit: auto

- [ ] W03-07 · docs/prds/03_data_model/database_schema_v1.md · Registry: §5 W3-07
      Depends: `docs/prds/01_product_scope/mvp_scope.md`, `docs/prds/01_product_scope/user_flows/users_mvp/*.md`
      Files: `docs/prds/03_data_model/database_schema_v1.md`, `docs/meta/architecture_master_index.md`
      Acceptance: <check → expected outcome> · Paths: H, N, S
```

- `### W{NN}-DU{k} — ` starts a DU; any `## ` heading ends it. First ` · ` segment is the commit subject `docs(scope): subject` (lowercase, no period, header with branch prefix ≤ 120 chars).
- `Review: reviewer|diff-only` (default `reviewer`). `Gate: none|blocking` (default `none`).
- A DU is done only when it has at least one task and every task is `- [x]`.
- `Files:` lists every path the DU may touch, including backlink targets and indexes. Globs gate the dirty-tree check but never enter the paths-file.
- `Depends:` mirrors the registry column "Зависит от"; the writer reads nothing else.

**Review depth by type** (the profile D6 shifts it exactly as for code, see `agent-code-review-subagent.mdc`):

| `Review:` | Documents |
|-----------|-----------|
| `reviewer` | PRD scope, ADR, contracts, specs, data model, authorization, runtime/auth, phase tasks |
| `diff-only` | indexes, backlink-only edits, user-flow prose, wireframe notes, glossary |

A DU that touches sensitive-zone semantics (auth, policy, migrations spec) is always `reviewer`.

## 6. Scripts

Principles are the same as in the phase guide §6 (pure core with unit tests, thin CLIs, logs in a gitignored folder, tail-only output). Differences:

| Script | Contract |
|--------|----------|
| `run-wave.mjs W{NN}` | `STATUS: du\|complete\|gate-blocking\|dirty <id>` first; paths-file `.local/wave-runs/<DU>.paths`; on completion writes `W{NN}-gate.md` (the gate checklist for the human) |
| `doc-verify.mjs` | Over the DU's changed files: front matter fields (registry §2.2), no `TBD` in MUST sections, every `N/A` has a reason, relative links resolve (`docs:links`), UTF-8 (`encoding:check`), `rules:check` if `.claude/` is touched. Does not judge meaning — that is `doc-reviewer` |
| `cu-commit.mjs` | Unchanged: the only writer of the index and commits |

## 7. Writer discipline

1. Inputs are only: the DU lines, the registry row, `Depends:`, the type template. Missing input → `RESULT: gap`, never an invented decision.
2. Source-of-truth order from `project-context.mdc` decides conflicts; a changed decision goes into an ADR, not only into the diff.
3. Backlinks, the master index and `failure_modes_catalog.md` are updated in the same DU.
4. Context7 for runtime/auth/data files (registry §2.7); `Проверено по` is filled.
5. No code, no `.mdc`, no second route list outside `canonical_routes.md`, no inline domain magic strings.

## 8. Known pitfalls

| Symptom | Cause | Fix |
|---------|-------|-----|
| Writer context grows to many files | `Depends:` lists whole directories | List only the sections that are needed; split the DU |
| Silent drift between documents | Backlinks or ADR skipped | `doc-reviewer` greps the changed term; `Files:` must include backlink targets |
| `TBD` slips into a MUST section | DoR-ready skipped | `doc-verify` fails on it; open questions need owner + blocked `§` |
| Chat context overflows after a few DUs | Chat read the produced docs | Thin orchestrator: keep only `RESULT` / `Review` / hash lines; a new chat resumes from the checkboxes |
| Wave started before the previous gate | `Gate: blocking` ignored | The driver exits 2; the human closes the gate by editing the header |

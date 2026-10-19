/**
 * Pure core of the unit drivers: commit units (CU, code) and documentation units (DU, docs).
 * No git mutations, no network. CLIs: run-phase, run-wave, cu-verify, doc-verify, cu-commit.
 * Contracts: docs/guidelines/agent-phase-orchestration.md §5–§6, agent-docs-orchestration.md §5–§6.
 * Adapt the constants below once per project (guide §12).
 */

export const LOG_TAIL_LINES = 40;
export const HEADER_MAX_LENGTH = 120;
export const DEFAULT_MODEL = "sonnet";
export const DEFAULT_MAX_TURNS = 40;
const COMMIT_TYPES = "feat|fix|refactor|perf|docs|test|chore|ci|revert|style";
/** Project secret files that may never be staged, besides `.env*`. */
const SECRET_FILES = [".local/dev-secrets.json"];

/** Two profiles of one driver: they differ in id grammar, files and the optional header flag. */
export const PROFILES = {
  code: {
    unit: "CU",
    idPattern: "P\\d+-CU\\d+",
    argPattern: /^P\d{2}$/,
    tasksPath: (id) => `docs/implementation/mvp/tasks/${id}_tasks.md`,
    runDir: ".local/phase-runs",
    flag: "Smoke",
    flagValues: ["none", "deferred", "blocking"],
    blockingState: "smoke-blocking",
    verify: (unit) => (unit.review === "reviewer" ? "node scripts/cu-verify.mjs --full" : "node scripts/cu-verify.mjs"),
  },
  docs: {
    unit: "DU",
    idPattern: "W\\d+-DU\\d+",
    argPattern: /^W\d{2}$/,
    tasksPath: (id) => `docs/meta/doc-waves/${id}_units.md`,
    runDir: ".local/wave-runs",
    flag: "Gate",
    flagValues: ["none", "blocking"],
    blockingState: "gate-blocking",
    verify: () => "node scripts/doc-verify.mjs",
  },
};

const SUBJECT_PATTERN = new RegExp(`^(?:${COMMIT_TYPES})(?:\\([a-z0-9-]+\\))?(!)?: (.+)$`);
const norm = (p) => String(p).replace(/\\/g, "/").replace(/^\.\//, "");

export function logTail(text, count = LOG_TAIL_LINES) {
  const lines = String(text ?? "").replace(/\r\n/g, "\n").split("\n");
  if (lines.at(-1) === "") lines.pop();
  return lines.slice(-count).join("\n");
}

export function expandBraces(token) {
  const m = token.match(/^(.*)\{([^{}]+)\}(.*)$/);
  if (!m) return [token];
  return m[2].split(",").flatMap((part) => expandBraces(`${m[1]}${part.trim()}${m[3]}`));
}

function extractFiles(body) {
  const files = [];
  for (const line of body.split("\n")) {
    const at = line.indexOf("Files:");
    if (at === -1) continue;
    const rest = line.slice(at + 6);
    const ticked = [...rest.matchAll(/`([^`]+)`/g)].map((x) => x[1].trim());
    const tokens = ticked.length ? ticked : rest.split(",").map((x) => x.trim()).filter(Boolean);
    for (const token of tokens) files.push(...expandBraces(token));
  }
  return files;
}

/** Strict grammar: `### <ID> — <subject> · Review: … · <Smoke|Gate>: …`; a `## ` heading ends a unit. */
export function parseUnits(markdown, profile) {
  const heading = new RegExp(`^### (${profile.idPattern}) — (.+)$`);
  const flagRe = new RegExp(`^${profile.flag}:\\s*(${profile.flagValues.join("|")})$`);
  const units = [];
  let unit = null;
  let task = null;
  const endTask = () => { if (unit && task) unit.tasks.push(task); task = null; };
  const endUnit = () => { endTask(); if (unit) units.push(unit); unit = null; };

  for (const line of String(markdown).split(/\r?\n/)) {
    const h = line.match(heading);
    if (h) {
      endUnit();
      const parts = h[2].split(" · ").map((x) => x.trim());
      unit = { id: h[1], subject: parts[0], review: "reviewer", flag: "none", tasks: [] };
      for (const part of parts.slice(1)) {
        const r = part.match(/^Review:\s*(reviewer|diff-only)$/);
        if (r) unit.review = r[1];
        const f = part.match(flagRe);
        if (f) unit.flag = f[1];
      }
      continue;
    }
    if (/^## /.test(line)) { endUnit(); continue; }
    if (!unit) continue;
    const box = line.match(/^- \[([ xX])\] (.+)$/);
    if (box) { endTask(); task = { checked: box[1] !== " ", body: line }; continue; }
    if (task) task.body += `\n${line}`;
  }
  endUnit();

  return units.map((u) => ({
    ...u,
    files: [...new Set(u.tasks.flatMap((t) => extractFiles(t.body)))],
    done: u.tasks.length > 0 && u.tasks.every((t) => t.checked),
  }));
}

/** complete · blocking (a done unit before the first open one has flag `blocking`) · run (first open unit). */
export function decideStep(units) {
  const open = units.findIndex((u) => !u.done);
  if (open === -1) return { action: "complete" };
  const blocking = units.slice(0, open).find((u) => u.flag === "blocking");
  if (blocking) return { action: "blocking", blocking, next: units[open] };
  return { action: "run", unit: units[open] };
}

function globToRegExp(pattern) {
  let re = "";
  for (let i = 0; i < pattern.length; ) {
    if (pattern.startsWith("**/", i)) { re += "(?:.*/)?"; i += 3; }
    else if (pattern.startsWith("**", i)) { re += ".*"; i += 2; }
    else if (pattern[i] === "*") { re += "[^/]*"; i += 1; }
    else { re += /[\\^$+?.()|[\]{}]/.test(pattern[i]) ? `\\${pattern[i]}` : pattern[i]; i += 1; }
  }
  return new RegExp(`^${re}$`);
}

export function pathMatches(file, pattern) {
  const f = norm(file);
  return expandBraces(norm(pattern)).some((v) => globToRegExp(v).test(f) || (!v.includes("*") && (f === v || f.endsWith(`/${v}`))));
}

export function parsePorcelain(text) {
  return String(text).split(/\r?\n/).filter((l) => l.trim()).map((l) => {
    const target = l.slice(3).split(" -> ").at(-1).trim().replace(/^"|"$/g, "");
    return norm(target);
  });
}

/** A dirty path is allowed if it matches the unit's `Files` or is the units/tasks file itself. */
export function classifyDirtyPaths(dirty, patterns, tasksFile) {
  const blocked = [];
  const continuable = [];
  for (const p of dirty.map(norm)) {
    (p === norm(tasksFile) || patterns.some((x) => pathMatches(p, x)) ? continuable : blocked).push(p);
  }
  return { blocked, continuable };
}

export function pathRefusalReason(p) {
  const n = norm(p);
  if (!n || n.startsWith("/") || /^[A-Za-z]:/.test(n)) return "absolute";
  if (n.split("/").includes("..")) return "parent";
  const base = n.slice(n.lastIndexOf("/") + 1);
  if (base === ".env.example") return null;
  if (base === ".env" || base.startsWith(".env.") || SECRET_FILES.includes(n)) return "secret";
  return null;
}

export function parsePathsFile(text) {
  return String(text).split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
}

export function assertStagePaths(paths) {
  if (!paths.length) return { ok: false, reason: "empty" };
  const refused = paths.map((p) => ({ path: p, reason: pathRefusalReason(p) })).filter((x) => x.reason);
  if (refused.length) return { ok: false, reason: "refused", refused };
  return { ok: true, paths: [...new Set(paths.map(norm))] };
}

/** The index must equal the list: nothing extra, nothing missing. */
export function assertCommitIndex(staged, allowed) {
  const s = [...new Set(staged.map(norm))];
  const a = new Set(allowed.map(norm));
  const extra = s.filter((p) => !a.has(p));
  const missing = [...a].filter((p) => !s.includes(p));
  if (!s.length) return { ok: false, reason: "empty", extra, missing };
  if (extra.length || missing.length) return { ok: false, reason: "mismatch", extra, missing };
  return { ok: true, extra, missing };
}

/** Keeps listed paths that git reports as changed; a listed directory stays if anything under it changed. */
export function partitionChangedPaths(listed, changed) {
  const ch = changed.map(norm);
  const kept = [];
  const unchanged = [];
  for (const p of listed.map(norm)) {
    const prefix = p.endsWith("/") ? p : `${p}/`;
    (ch.some((c) => c === p || c.startsWith(prefix)) ? kept : unchanged).push(p);
  }
  return { kept, unchanged };
}

export function buildCommitMessage(branch, subject) {
  const b = String(branch ?? "").trim();
  const s = String(subject ?? "").trim();
  if (!b || b.includes(":") || /\s/.test(b)) return { ok: false, reason: "branch" };
  const m = s.match(SUBJECT_PATTERN);
  if (!m || s.endsWith(".") || m[2] !== m[2].toLowerCase()) return { ok: false, reason: "subject" };
  const message = `${b}: ${s}`;
  return message.length > HEADER_MAX_LENGTH ? { ok: false, reason: "length" } : { ok: true, message };
}

export function concreteAllowPaths(unit, tasksFile) {
  return [...new Set([norm(tasksFile), ...unit.files.filter((f) => !/[*?]/.test(f))])];
}

/** Vitest started and ran no tests (worker crash). An assertion failure still prints a count. */
export function isHarnessTestFailure(output) {
  const t = String(output ?? "");
  return /Tests\s+no tests/.test(t) && /reading ['"]config['"]/.test(t);
}

export const STATUS_PREFIX = "STATUS:";
export const renderStatusLine = (state, id) => `${STATUS_PREFIX} ${state} ${id}`;
export const MARKERS = { code: ["=== IMPLEMENTER ===", "=== ORCHESTRATOR ==="], docs: ["=== WRITER ===", "=== ORCHESTRATOR ==="] };

const GIT_GUARD = "Сырой git add и git commit не вызывай. Production build не запускай: его выполняет pre-commit hook.";
const AGENTS = {
  code: { worker: "implementer", reviewer: "reviewer", gap: "dor-fail" },
  docs: { worker: "doc-writer", reviewer: "doc-reviewer", gap: "gap" },
};

function workerLines(profile, kind, { unit, tasksPath, pathsFile }) {
  const verify = profile.verify(unit);
  const lines = [
    `Отметь чекбоксы этого ${profile.unit} в ${tasksPath} до коммита. Хеш после коммита не дописывай.`,
    `Запиши в ${pathsFile} ровно те конкретные пути, что войдут в индекс, включая ${tasksPath}. Без glob и без секретов. Драйвер вписал все существующие пути из Files: удали те, что ты не менял.`,
  ];
  if (kind === "code") {
    lines.push("Если менялись .cursor/rules/*.mdc, до stage выполни npm run rules:sync и добавь .claude/rules/ в список.");
    lines.push("Тесты запускает только cu-verify. Не запускай npm run test, vitest и второй прогон сам.");
  }
  lines.push(verify, `node scripts/cu-commit.mjs stage --paths-file ${pathsFile}`);
  return lines;
}

/**
 * Prompt of one unit. `thin` (Cursor for code, Claude Code chat for docs): two blocks, a fresh worker subagent
 * does the unit, the chat only relays. `single` (headless `claude -p`): one session does everything.
 */
export function renderPrompt({ kind, unit, tasksPath, pathsFile, mode = "thin" }) {
  const profile = PROFILES[kind];
  const a = AGENTS[kind];
  const ctx = { unit, tasksPath, pathsFile };
  const verifyFlake = "Если хвост содержит `cu-verify: test harness-failed`, код не меняй: в thin-режиме верни RESULT: verify-flake и хвост, в single-режиме запусти cu-verify ещё раз. Снова harness-failed — остановись.";
  const commit = `node scripts/cu-commit.mjs commit --paths-file ${pathsFile} --subject "${unit.subject}"`;
  const reviewCall = unit.review === "reviewer"
    ? `Вызови субагента ${a.reviewer}: в промпте только id ${profile.unit}, путь ${tasksPath} и просьба прочитать git diff --staged. Ответ ≤ 15 строк.`
    : "Review: diff-only — сделай сам по git diff --staged, оставь одну строку Review:.";
  const blocker = [
    `Blocker — исправь только его${kind === "code" ? " и добавь тест, фиксирующий этот blocker" : ""}, затем verify, stage с ${pathsFile} и один review только дельты.`,
    `Тот же blocker — один вызов architect (только docs): одна фраза инварианта в спеке. Затем ещё один проход, verify, stage и review дельты. Снова жив — остановись. Третьего круга нет.`,
  ];
  const read = kind === "code"
    ? "Прочитай только строки этого CU и указанные §. DoR проверь сам."
    : "Прочитай только строки этого DU, строку registry волны, файлы из Depends и шаблон типа документа (registry §2.3.3–§2.3.5, §6). Решения не выдумывай.";
  const noProse = kind === "docs" ? "Пиши только в docs/**; код и .mdc не трогай." : "";

  if (mode === "single") {
    return [
      `Выполни ${unit.id} по ${tasksPath}. Commit: auto уже разрешён. Между шагами не спрашивай подтверждения.`,
      read, noProse, ...workerLines(profile, kind, ctx), verifyFlake,
      "Иначе проверка упала: один повтор с текстом ошибки. Упала снова — остановись.",
      reviewCall, ...blocker, commit, GIT_GUARD,
    ].filter(Boolean).join("\n");
  }

  const [workerMarker, orchMarker] = MARKERS[kind];
  const worker = [
    `Выполни ${unit.id} по ${tasksPath}. Ты субагент ${a.worker} в режиме драйвера.`,
    read, noProse,
    `Не хватает входа или провал DoR: ничего не выдумывай, architect не вызывай, верни первой строкой RESULT: ${a.gap} и список пунктов.`,
    "Сырой git add / git commit / push не вызывай, коммит не делай, review не вызывай.",
    ...workerLines(profile, kind, ctx),
    ...(kind === "code" ? [verifyFlake] : []),
    "Иначе проверка упала: один повтор с текстом ошибки. Упала снова — верни RESULT: verify-fail и хвост.",
    unit.review === "diff-only" ? "После stage сделай diff-only review сам и включи в ответ строку Review: diff-only — …." : "",
    `Ответ ≤ 15 строк. Первая строка: RESULT: staged | ${a.gap} | verify-fail${kind === "code" ? " | verify-flake" : ""}. Дальше: файлы, итог проверки, открытые вопросы.`,
  ].filter(Boolean);
  const orchestrator = [
    `Ты оркестратор ${unit.id}. ${kind === "code" ? "Код не пиши, исходники и diff не читай" : "Документы не пиши и не читай"}, итоги прошлых ${profile.unit} не пересказывай. Commit: auto разрешён, не спрашивай подтверждения.`,
    `Вызови субагента ${a.worker}: промпт — блок выше дословно, без добавлений.`,
    `RESULT: ${a.gap} — один вызов architect (spec-gap, только docs) с этими пунктами, затем один повторный вызов ${a.worker} с тем же блоком. Повторно — остановись и доложи.`,
    ...(kind === "code" ? [`RESULT: verify-flake — сам один раз запусти ${profile.verify(unit)}. Зелёная — новый вызов ${a.worker}: только stage с ${pathsFile}. Снова harness-failed — остановись.`] : []),
    "RESULT: verify-fail — остановись и доложи пользователю.",
    `При RESULT: staged — ${reviewCall}`,
    `Blocker — новый вызов ${a.worker}: ${blocker.join(" ")}`,
    commit,
    `Хук упал — новый вызов ${a.worker} с хвостом хука, затем commit ещё раз. Упал повторно — остановись и доложи.`,
    GIT_GUARD,
    `После коммита одна строка «${unit.id} — <hash>» и сразу снова ${kind === "code" ? "run-phase" : "run-wave"}.`,
  ];
  return [workerMarker, ...worker, orchMarker, ...orchestrator].join("\n");
}

const FORBIDDEN_ARGS = ["--amend", "--no-verify", "--force", "--push", "push"];

export function parseCuCommitArgs(argv) {
  const forbidden = argv.filter((a) => FORBIDDEN_ARGS.some((f) => a === f || a.startsWith(`${f}=`)));
  if (forbidden.length) return { ok: false, reason: "forbidden", forbidden };
  const [mode, ...rest] = argv;
  if (mode !== "stage" && mode !== "commit") return { ok: false, reason: "mode" };
  let pathsFile = null;
  let subject = null;
  for (let i = 0; i < rest.length; i += 2) {
    if (rest[i] === "--paths-file") pathsFile = rest[i + 1];
    else if (rest[i] === "--subject") subject = rest[i + 1];
    else return { ok: false, reason: "unknown", arg: rest[i] };
  }
  if (!pathsFile) return { ok: false, reason: "paths-file" };
  if ((mode === "commit") !== Boolean(subject)) return { ok: false, reason: "subject" };
  return { ok: true, mode, pathsFile, subject };
}

/**
 * Environment: `cursor` | `claude-code` (default: cursor for code, claude-code for docs). Headless `claude -p` loop:
 * code — `--environment claude-code`; docs — `--harness claude`. `--harness print` is a dry run (thin prompt).
 */
export function parseRunArgs(argv, profile) {
  const out = { id: null, environment: null, harness: null, model: DEFAULT_MODEL, maxTurns: DEFAULT_MAX_TURNS };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--environment") out.environment = argv[++i];
    else if (arg === "--harness") out.harness = argv[++i];
    else if (arg === "--model") out.model = argv[++i];
    else if (arg === "--max-turns") out.maxTurns = Number(argv[++i]);
    else if (arg.startsWith("--") || out.id) return { ok: false, reason: "unknown" };
    else out.id = arg;
  }
  if (!profile.argPattern.test(out.id ?? "")) return { ok: false, reason: "id" };
  if (!/^[a-z0-9][\w.[\]-]*$/i.test(out.model ?? "")) return { ok: false, reason: "model" };
  if (!Number.isInteger(out.maxTurns) || out.maxTurns < 1) return { ok: false, reason: "max-turns" };
  const isCode = profile.unit === "CU";
  const environment = out.environment ?? (out.harness === "claude" ? "claude-code" : out.harness ? "cursor" : isCode ? "cursor" : "claude-code");
  if (!["cursor", "claude-code"].includes(environment)) return { ok: false, reason: "environment" };
  if (out.harness && !["cursor", "print", "claude"].includes(out.harness)) return { ok: false, reason: "harness" };
  const headless = out.harness ? out.harness === "claude" : isCode && environment === "claude-code";
  if (out.environment && out.harness && ((environment === "cursor" && headless) || (isCode && environment === "claude-code" && out.harness === "cursor"))) {
    return { ok: false, reason: "environment-harness" };
  }
  return { ok: true, id: out.id, environment, headless, model: out.model, maxTurns: out.maxTurns };
}

export function renderGateList(id, units) {
  const flagged = units.filter((u) => u.flag === "deferred" || u.flag === "blocking");
  const lines = [`# ${id} checklist`, ""];
  if (!flagged.length) lines.push("Нет отложенных проверок.");
  for (const u of flagged) lines.push(`- ${u.id} — ${u.subject} — ${u.flag}`);
  return `${lines.join("\n")}\n`;
}

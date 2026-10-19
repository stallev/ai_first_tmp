#!/usr/bin/env node
/**
 * The only stage and commit entry for a CU or DU.
 * stage: index from an explicit path list. commit: refuses anything outside that list, builds the commitlint header.
 * `--amend`, `--no-verify`, `--force`, `push` are rejected by the argument parser.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertCommitIndex, assertStagePaths, buildCommitMessage, logTail, parseCuCommitArgs, parsePathsFile,
  parsePorcelain, partitionChangedPaths,
} from "./unit-driver.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = parseCuCommitArgs(process.argv.slice(2));
const git = (a) => spawnSync("git", a, { cwd: rootDir, encoding: "utf8" });
const out = (r) => `${r.stdout ?? ""}${r.stderr ?? ""}`;

// Logs go next to the paths-file (.local/phase-runs or .local/wave-runs).
const logPath = args.ok ? path.join(path.dirname(path.resolve(rootDir, args.pathsFile)), `${args.mode}-${Date.now()}.log`) : "";
function fail(message, output = "") {
  console.error(`cu-commit: ${message}`);
  if (output) console.error(logTail(output));
  if (logPath) console.error(`log: ${path.relative(rootDir, logPath).replace(/\\/g, "/")}`);
  process.exit(1);
}
if (!args.ok) fail(args.reason);

const pathsAbs = path.resolve(rootDir, args.pathsFile);
if (!fs.existsSync(pathsAbs)) fail(`нет файла путей ${args.pathsFile}`);
const check = assertStagePaths(parsePathsFile(fs.readFileSync(pathsAbs, "utf8")));
if (!check.ok) fail(`список путей отклонён: ${check.refused?.map((x) => `${x.path} (${x.reason})`).join(", ") ?? check.reason}`);
for (const p of check.paths) {
  const rel = path.relative(rootDir, path.resolve(rootDir, p));
  if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) fail(`путь вне репозитория: ${p}`);
}

// The driver pre-fills every existing Files path; an untouched one would fail the index check as missing.
const status = git(["-c", "core.quotepath=off", "status", "--porcelain", "--untracked-files=all"]);
if (status.status !== 0) fail("git status failed", out(status));
const { kept: allowed, unchanged } = partitionChangedPaths(check.paths, parsePorcelain(status.stdout));
for (const p of unchanged) console.log(`unchanged: ${p}`);
if (!allowed.length) fail("в списке путей нет изменённых файлов");

if (args.mode === "stage") {
  const added = git(["add", "--", ...allowed]);
  if (added.status !== 0) fail("git add failed", out(added));
  console.log(["cu-commit: staged", ...allowed].join("\n"));
  process.exit(0);
}

const branch = git(["branch", "--show-current"]);
const message = buildCommitMessage(branch.stdout, args.subject);
if (!message.ok) fail(`сообщение отклонено: ${message.reason}`);
const cached = git(["diff", "--cached", "--name-only", "-z"]);
if (cached.status !== 0) fail("не удалось прочитать индекс", out(cached));
const index = assertCommitIndex(cached.stdout.split("\0").filter(Boolean), allowed);
if (!index.ok) fail(`индекс не совпал со списком: extra=${index.extra.join(",") || "-"} missing=${index.missing.join(",") || "-"}`);

const committed = git(["commit", "-m", message.message]);
fs.writeFileSync(logPath, out(committed));
if (committed.status !== 0) fail("git commit failed", out(committed));
console.log(`cu-commit: ${git(["rev-parse", "HEAD"]).stdout.trim()}\n${logTail(out(committed))}`);
console.log(`log: ${path.relative(rootDir, logPath).replace(/\\/g, "/")}`);

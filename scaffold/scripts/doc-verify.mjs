#!/usr/bin/env node
/**
 * DU verification (mechanical only; meaning is judged by `doc-reviewer`).
 * Checks the changed markdown files under docs/ (git status): registry §2.2 header, §2.3.1 sections, no `TBD`,
 * every `N/A` has a reason; then runs the repo checks that exist: docs:links, encoding:check, rules:check.
 * Output: `doc-verify: ok` or the findings + non-zero exit.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { logTail, parsePorcelain } from "./unit-driver.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
/** Registry §2.2: bold header lines at the top of every new document. Adapt if the project registry changes them. */
const HEADER_FIELDS = ["Тип", "Статус", "Версия", "Дата", "Волна", "Зависит от", "Связанные документы"];
/** Registry §2.3.1: sections every document carries. */
const REQUIRED_SECTIONS = ["Open questions", "Agent notes"];
/** Registry §2.2: `Проверено по` is MUST for runtime/auth/data documents (§2.7). */
const CHECKED_BY_PATH = /(^|\/)(03_data_model|04_authorization_privacy|05_runtime)\//;
/** Only documents created by waves; templates and meta docs follow their own format. */
const WAVE_DOCS = /^docs\/(prds|design|implementation)\/.+\.md$/;
const findings = [];

const status = spawnSync("git", ["status", "--porcelain", "--untracked-files=all"], { cwd: rootDir, encoding: "utf8" });
const changed = parsePorcelain(status.stdout ?? "").filter((p) => /^docs\/.+\.md$/.test(p) && fs.existsSync(path.join(rootDir, p)));

for (const file of changed) {
  const text = fs.readFileSync(path.join(rootDir, file), "utf8");
  if (WAVE_DOCS.test(file)) {
    const head = text.split(/\r?\n/).slice(0, 25).join("\n");
    for (const field of HEADER_FIELDS) {
      if (!new RegExp(`\\*\\*${field}:\\*\\*`).test(head)) findings.push(`${file}: в шапке нет «${field}»`);
    }
    if (CHECKED_BY_PATH.test(file) && !/\*\*Проверено по:\*\*/.test(head)) findings.push(`${file}: runtime/auth/data без «Проверено по»`);
    // Tasks files follow phase_tasks.template.md: header yes, §2.3.1 sections no.
    const isTasks = /\*\*Тип:\*\*\s*Tasks/.test(head);
    for (const section of isTasks ? [] : REQUIRED_SECTIONS) {
      if (!new RegExp(`^#{1,4} .*${section}`, "im").test(text)) findings.push(`${file}: нет секции «${section}»`);
    }
  }
  text.split(/\r?\n/).forEach((line, i) => {
    if (/\bTBD\b/.test(line) && !/Open questions/i.test(line)) findings.push(`${file}:${i + 1}: TBD (допустимо только в Open questions с owner)`);
    if (/\bN\/A\b/.test(line) && !/N\/A\s*[—:-]\s*\S/.test(line)) findings.push(`${file}:${i + 1}: N/A без причины`);
  });
}

const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8"));
for (const script of ["docs:links", "encoding:check", "rules:check"]) {
  if (!pkg.scripts?.[script]) continue;
  const r = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "--silent", script], {
    cwd: rootDir, encoding: "utf8", shell: process.platform === "win32",
  });
  if (r.status !== 0) findings.push(`${script} failed:\n${logTail(`${r.stdout ?? ""}${r.stderr ?? ""}`, 15)}`);
}

if (findings.length) {
  console.log(`doc-verify: ${findings.length} finding(s)`);
  console.log(logTail(findings.join("\n"), 40));
  process.exit(1);
}
console.log(`doc-verify: ok (${changed.length} file(s))`);

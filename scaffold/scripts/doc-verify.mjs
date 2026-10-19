#!/usr/bin/env node
/**
 * DU verification (mechanical only; meaning is judged by `doc-reviewer`).
 * Checks the changed markdown files under docs/ (git status): front matter, no `TBD` in MUST sections,
 * every `N/A` has a reason; then runs the repo checks that exist: docs:links, encoding:check, rules:check.
 * Output: `doc-verify: ok` or the findings + non-zero exit.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { logTail, parsePorcelain } from "./unit-driver.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
/** Adapt to registry §2.2 for the project. */
const REQUIRED_FRONT_MATTER = ["title", "status"];
const findings = [];

const status = spawnSync("git", ["status", "--porcelain", "--untracked-files=all"], { cwd: rootDir, encoding: "utf8" });
const changed = parsePorcelain(status.stdout ?? "").filter((p) => /^docs\/.+\.md$/.test(p) && fs.existsSync(path.join(rootDir, p)));

for (const file of changed) {
  const text = fs.readFileSync(path.join(rootDir, file), "utf8");
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fm) {
    for (const key of REQUIRED_FRONT_MATTER) if (!new RegExp(`^${key}:`, "m").test(fm[1])) findings.push(`${file}: front matter без «${key}»`);
  } else if (!file.startsWith("docs/meta/")) findings.push(`${file}: нет front matter`);
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

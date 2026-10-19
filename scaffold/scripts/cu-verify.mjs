#!/usr/bin/env node
/**
 * CU verification: lint → test (→ typecheck with --full). No production build (the pre-commit hook runs it).
 * Output: `cu-verify: ok` + log path, or the failing step, a 40-line tail and a non-zero exit.
 * The test step holds .local/phase-runs/vitest.lock and retries once on a Vitest harness crash; still crashing → exit 3.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isHarnessTestFailure, logTail } from "./unit-driver.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runDir = path.join(rootDir, ".local", "phase-runs");
fs.mkdirSync(runDir, { recursive: true });
const logPath = path.join(runDir, `verify-${Date.now()}.log`);
const lockPath = path.join(runDir, "vitest.lock");
const rel = (p) => path.relative(rootDir, p).replace(/\\/g, "/");
const full = process.argv.includes("--full");

// Spawn the tool's entry file with node (shell: false) so quoting and process trees stay predictable.
const bin = (pkg, file) => [path.join(rootDir, "node_modules", pkg, file)];
const STEPS = [
  { label: "lint", script: bin("eslint", "bin/eslint.js").concat(["."]) },
  { label: "test", script: bin("vitest", "vitest.mjs").concat(["run"]), lock: true },
  ...(full ? [{ label: "typecheck", script: bin("typescript", "bin/tsc").concat(["--noEmit"]) }] : []),
].filter((s) => fs.existsSync(s.script[0]));

const alive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

function acquireLock() {
  const deadline = Date.now() + 4 * 60_000;
  for (;;) {
    try { fs.writeFileSync(lockPath, String(process.pid), { flag: "wx" }); return true; } catch { /* held */ }
    const owner = Number(fs.readFileSync(lockPath, "utf8")) || 0;
    if (!alive(owner)) { fs.rmSync(lockPath, { force: true }); continue; }
    if (Date.now() > deadline) return false;
    sleep(2000);
  }
}

function run(step) {
  const r = spawnSync(process.execPath, step.script, { cwd: rootDir, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return { code: r.status ?? 1, output: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

let log = "";
for (const step of STEPS) {
  if (step.lock && !acquireLock()) { console.log("cu-verify: test harness-failed (lock timeout)"); process.exit(3); }
  let result = run(step);
  if (step.lock && result.code !== 0 && isHarnessTestFailure(result.output)) result = run(step);
  if (step.lock) fs.rmSync(lockPath, { force: true });
  log += `# ${step.label}\n${result.output}\n`;
  fs.writeFileSync(logPath, log);
  if (result.code !== 0) {
    const harness = step.lock && isHarnessTestFailure(result.output);
    console.log(harness ? "cu-verify: test harness-failed" : `cu-verify: ${step.label} failed`);
    console.log(logTail(result.output));
    console.log(`log: ${rel(logPath)}`);
    process.exit(harness ? 3 : 1);
  }
}
console.log(`cu-verify: ok (${STEPS.map((s) => s.label).join(", ") || "no steps"})\nlog: ${rel(logPath)}`);

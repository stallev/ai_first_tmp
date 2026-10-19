/**
 * Shared CLI body of run-phase.mjs (kind "code") and run-wave.mjs (kind "docs").
 * Thin mode: one unit per invocation, `STATUS:` first on stdout, two prompt blocks after it.
 * Headless mode (`--environment claude-code` for code, default for docs with --harness claude): loops `claude -p`.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PROFILES, classifyDirtyPaths, concreteAllowPaths, decideStep, logTail, parsePorcelain, parseRunArgs,
  parseUnits, renderGateList, renderPrompt, renderStatusLine,
} from "./unit-driver.mjs";

export function main(kind, argv) {
  const profile = PROFILES[kind];
  const cli = kind === "code" ? "run-phase" : "run-wave";
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const parsed = parseRunArgs(argv, profile);
  const die = (msg, code = 1) => { console.error(`${cli}: ${msg}`); process.exit(code); };
  if (!parsed.ok) die(parsed.reason);

  const tasksPath = profile.tasksPath(parsed.id);
  const tasksAbs = path.join(rootDir, tasksPath);
  if (!fs.existsSync(tasksAbs)) die(`нет файла ${tasksPath}`);
  const runDir = path.join(rootDir, profile.runDir);
  fs.mkdirSync(runDir, { recursive: true });
  const rel = (p) => path.relative(rootDir, p).replace(/\\/g, "/");
  const readUnits = () => parseUnits(fs.readFileSync(tasksAbs, "utf8"), profile);

  function prepare(units) {
    const step = decideStep(units);
    if (step.action === "complete") {
      const gate = path.join(runDir, `${parsed.id}-${kind === "code" ? "smoke" : "gate"}.md`);
      fs.writeFileSync(gate, renderGateList(parsed.id, units));
      console.log(renderStatusLine("complete", parsed.id));
      console.error(`${cli}: ${parsed.id} завершён · ${rel(gate)}`);
      process.exit(0);
    }
    if (step.action === "blocking") {
      console.log(renderStatusLine(profile.blockingState, step.blocking.id));
      die(`стоп перед ${step.next.id}: у ${step.blocking.id} ${profile.flag}: blocking`, 2);
    }
    const status = spawnSync("git", ["status", "--porcelain", "--untracked-files=all"], { cwd: rootDir, encoding: "utf8" });
    if (status.status !== 0) die("git status failed");
    const dirty = classifyDirtyPaths(parsePorcelain(status.stdout).filter((p) => !p.startsWith(".local/")), step.unit.files, tasksPath);
    if (dirty.blocked.length) {
      console.log(renderStatusLine("dirty", step.unit.id));
      die(`грязное дерево вне Files этого ${profile.unit}:\n  ${dirty.blocked.join("\n  ")}`);
    }
    const pathsAbs = path.join(runDir, `${step.unit.id}.paths`);
    const existing = concreteAllowPaths(step.unit, tasksPath).filter((p) => fs.existsSync(path.join(rootDir, p)));
    fs.writeFileSync(pathsAbs, `${existing.join("\n")}\n`);
    const prompt = renderPrompt({ kind, unit: step.unit, tasksPath, pathsFile: rel(pathsAbs), mode: parsed.headless ? "single" : "thin" });
    return { unit: step.unit, prompt, pathsFile: rel(pathsAbs) };
  }

  if (!parsed.headless) {
    const p = prepare(readUnits());
    console.error(`${cli}: ${p.unit.id} · environment ${parsed.environment} · paths: ${p.pathsFile}`);
    console.log(renderStatusLine(kind === "code" ? "cu" : "du", p.unit.id));
    console.log(p.prompt);
    console.error(`${cli}: после коммита снова: node scripts/${cli}.mjs ${parsed.id} --environment ${parsed.environment}`);
    process.exit(0);
  }

  const claude = process.platform === "win32"
    ? (spawnSync("where.exe", ["claude"], { encoding: "utf8" }).stdout ?? "").split(/\r?\n/).find(Boolean) ?? "claude.cmd"
    : "claude";
  for (let guard = readUnits().length + 1; guard > 0; guard -= 1) {
    const before = prepare(readUnits());
    console.error(`${cli}: сеанс ${before.unit.id} · model ${parsed.model} · max-turns ${parsed.maxTurns}`);
    const run = spawnSync(claude, ["-p", "--model", parsed.model, "--max-turns", String(parsed.maxTurns), "--output-format", "json"], {
      cwd: rootDir, input: before.prompt, encoding: "utf8", maxBuffer: 64 * 1024 * 1024,
      stdio: ["pipe", "pipe", "inherit"], shell: process.platform === "win32",
    });
    if (run.error) die(`не удалось запустить claude (${run.error.code ?? run.error.message})`);
    const session = path.join(runDir, `${before.unit.id}-session-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    fs.writeFileSync(session, run.stdout ?? "");
    let result = null;
    try { result = JSON.parse((run.stdout ?? "").trim()); } catch { /* not a result object */ }
    if (result?.type === "result") {
      const cost = typeof result.total_cost_usd === "number" ? `$${result.total_cost_usd.toFixed(2)}` : "-";
      console.error(`${cli}: ${before.unit.id} ${result.subtype} · turns ${result.num_turns ?? "-"} · cost ${cost}`);
      if (typeof result.result === "string") console.error(logTail(result.result));
    }
    console.error(`session: ${rel(session)}`);
    if (run.status !== 0) process.exit(run.status || 1);
    if (result && (result.is_error || result.subtype !== "success")) die(`сеанс ${before.unit.id} завершился с ошибкой ${result.subtype}`);
    const after = decideStep(readUnits());
    if (after.action === "run" && after.unit.id === before.unit.id) die(`${before.unit.id} не отмечен в ${tasksPath}`);
  }
  die("превышен предел сеансов");
}

// Run: node --test scripts/unit-driver.test.mjs  (node:test, no dependencies)
import assert from "node:assert/strict";
import test from "node:test";
import {
  PROFILES, assertCommitIndex, assertStagePaths, buildCommitMessage, classifyDirtyPaths, decideStep,
  isHarnessTestFailure, logTail, parseCuCommitArgs, parseRunArgs, parseUnits, partitionChangedPaths, renderPrompt,
} from "./unit-driver.mjs";

const CODE = `## P01
### P01-CU1 — feat(auth): add login · Review: reviewer · Smoke: blocking · Commit: auto
- [x] P01-T1 · T3 · Spec: x
      Files: \`apps/web/src/lib/auth/{config,callbacks}.ts\`, \`packages/db/**\`
- [x] P01-T2 · T1
### P01-CU2 — docs(docs): note · Review: diff-only
- [ ] P01-T3 · T0
      Files: \`README.md\`
`;
const DOCS = `### W03-DU1 — docs(prd): add flows · Gate: blocking
- [x] W03-01 · docs/a.md
      Files: \`docs/a.md\`
### W03-DU2 — docs(adr): add adr
- [ ] W03-02 · docs/b.md
`;

test("parseUnits: code grammar, braces, done", () => {
  const [a, b] = parseUnits(CODE, PROFILES.code);
  assert.equal(a.subject, "feat(auth): add login");
  assert.equal(a.flag, "blocking");
  assert.deepEqual(a.files, ["apps/web/src/lib/auth/config.ts", "apps/web/src/lib/auth/callbacks.ts", "packages/db/**"]);
  assert.equal(a.done, true);
  assert.equal(b.review, "diff-only");
  assert.equal(b.done, false);
});

test("parseUnits: docs profile uses Gate and W/DU ids; code ids are ignored", () => {
  assert.equal(parseUnits(DOCS, PROFILES.docs).length, 2);
  assert.equal(parseUnits(DOCS, PROFILES.code).length, 0);
  assert.equal(parseUnits(DOCS, PROFILES.docs)[0].flag, "blocking");
});

test("decideStep: run, blocking, complete", () => {
  assert.equal(decideStep(parseUnits(CODE, PROFILES.code)).action, "blocking");
  assert.equal(decideStep(parseUnits(DOCS.replace("Gate: blocking", "Gate: none"), PROFILES.docs)).unit.id, "W03-DU2");
  assert.equal(decideStep(parseUnits(DOCS.replace("- [ ]", "- [x]"), PROFILES.docs)).action, "complete");
});

test("classifyDirtyPaths: Files and the tasks file are allowed, the rest is blocked", () => {
  const r = classifyDirtyPaths(["README.md", "src/x.ts", "docs/t.md"], ["README.md"], "docs/t.md");
  assert.deepEqual(r.blocked, ["src/x.ts"]);
  assert.deepEqual(r.continuable, ["README.md", "docs/t.md"]);
});

test("assertStagePaths refuses secrets, parents, absolute paths, empty list", () => {
  assert.equal(assertStagePaths([]).reason, "empty");
  assert.equal(assertStagePaths([".env.local"]).refused[0].reason, "secret");
  assert.equal(assertStagePaths(["../x"]).refused[0].reason, "parent");
  assert.equal(assertStagePaths(["C:/x"]).refused[0].reason, "absolute");
  assert.deepEqual(assertStagePaths([".env.example", "a.ts", "./a.ts"]).paths, [".env.example", "a.ts"]);
});

test("assertCommitIndex: index must equal the list", () => {
  assert.equal(assertCommitIndex(["a"], ["a"]).ok, true);
  assert.deepEqual(assertCommitIndex(["a", "b"], ["a"]).extra, ["b"]);
  assert.deepEqual(assertCommitIndex(["a"], ["a", "b"]).missing, ["b"]);
  assert.equal(assertCommitIndex([], ["a"]).reason, "empty");
});

test("partitionChangedPaths keeps changed files and directories with changes", () => {
  const r = partitionChangedPaths(["a.ts", "dir", "b.ts"], ["a.ts", "dir/x.ts"]);
  assert.deepEqual(r.kept, ["a.ts", "dir"]);
  assert.deepEqual(r.unchanged, ["b.ts"]);
});

test("buildCommitMessage: branch prefix, grammar, length", () => {
  assert.equal(buildCommitMessage("feature/p1", "feat(auth): add login").message, "feature/p1: feat(auth): add login");
  assert.equal(buildCommitMessage("a b", "feat: x").reason, "branch");
  assert.equal(buildCommitMessage("m", "Feat: x").reason, "subject");
  assert.equal(buildCommitMessage("m", "feat: Add x").reason, "subject");
  assert.equal(buildCommitMessage("m", "feat: add x.").reason, "subject");
  assert.equal(buildCommitMessage("m", `feat: ${"x".repeat(120)}`).reason, "length");
});

test("parseCuCommitArgs rejects dangerous flags and bad combinations", () => {
  for (const bad of ["--amend", "--no-verify", "--force", "push"]) {
    assert.equal(parseCuCommitArgs(["commit", "--paths-file", "p", "--subject", "feat: x", bad]).reason, "forbidden");
  }
  assert.equal(parseCuCommitArgs(["stage", "--paths-file", "p", "--subject", "feat: x"]).reason, "subject");
  assert.equal(parseCuCommitArgs(["commit", "--paths-file", "p"]).reason, "subject");
  assert.equal(parseCuCommitArgs(["stage"]).reason, "paths-file");
  assert.equal(parseCuCommitArgs(["stage", "--paths-file", "p"]).ok, true);
});

test("parseRunArgs: environments, headless, conflicts", () => {
  assert.deepEqual([parseRunArgs(["P01"], PROFILES.code).environment, parseRunArgs(["P01"], PROFILES.code).headless], ["cursor", false]);
  assert.equal(parseRunArgs(["P01", "--environment", "claude-code"], PROFILES.code).headless, true);
  assert.equal(parseRunArgs(["P01", "--environment", "cursor", "--harness", "claude"], PROFILES.code).reason, "environment-harness");
  assert.equal(parseRunArgs(["W03"], PROFILES.docs).headless, false);
  assert.equal(parseRunArgs(["W03", "--harness", "claude"], PROFILES.docs).headless, true);
  assert.equal(parseRunArgs(["P1"], PROFILES.code).reason, "id");
  assert.equal(parseRunArgs(["W03"], PROFILES.code).reason, "id");
  assert.equal(parseRunArgs(["P01", "--bogus"], PROFILES.code).reason, "unknown");
});

test("renderPrompt: thin has two blocks and the right worker; single has none; docs never mention vitest", () => {
  const [unit] = parseUnits(CODE, PROFILES.code);
  const thin = renderPrompt({ kind: "code", unit, tasksPath: "t.md", pathsFile: "p.paths" });
  assert.match(thin, /=== IMPLEMENTER ===[\s\S]*=== ORCHESTRATOR ===/);
  assert.match(thin, /cu-verify\.mjs --full/);
  assert.match(thin, /verify-flake/);
  const single = renderPrompt({ kind: "code", unit, tasksPath: "t.md", pathsFile: "p.paths", mode: "single" });
  assert.doesNotMatch(single, /=== IMPLEMENTER ===/);
  const [du] = parseUnits(DOCS, PROFILES.docs);
  const docs = renderPrompt({ kind: "docs", unit: du, tasksPath: "w.md", pathsFile: "p.paths" });
  assert.match(docs, /=== WRITER ===/);
  assert.match(docs, /doc-verify/);
  assert.doesNotMatch(docs, /vitest|cu-verify/);
});

test("isHarnessTestFailure and logTail", () => {
  assert.equal(isHarnessTestFailure("Tests  no tests\nTypeError: reading 'config'"), true);
  assert.equal(isHarnessTestFailure("Tests  1 failed | 2 passed"), false);
  assert.equal(logTail("a\nb\nc\n", 2), "b\nc");
});

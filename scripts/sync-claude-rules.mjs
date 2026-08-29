#!/usr/bin/env node
/**
 * Cursor `.cursor/rules/*.mdc` (SoT) → Claude Code `.claude/rules/*.md`
 * Playbook: docs/claude-code-cursor-rules-sync.md
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cursorRulesDir = path.join(rootDir, ".cursor", "rules");
const claudeRulesDir = path.join(rootDir, ".claude", "rules");
const isCheck = process.argv.includes("--check");

function detectNewline(text) {
  return text.includes("\r\n") ? "\r\n" : "\n";
}

function stripWrappingQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function parseLinearFrontmatter(block) {
  const fields = {};
  const lines = block.split(/\r?\n/);
  let lineIndex = 0;
  while (lineIndex < lines.length) {
    const line = lines[lineIndex];
    if (!line.trim() || line.trim().startsWith("#")) {
      lineIndex += 1;
      continue;
    }
    const match = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!match) {
      lineIndex += 1;
      continue;
    }
    const key = match[1];
    const rawValue = match[2].trim();
    if (rawValue === "" && key === "globs") {
      const items = [];
      lineIndex += 1;
      while (lineIndex < lines.length) {
        const listMatch = lines[lineIndex].match(/^\s+-\s+(.+)$/);
        if (!listMatch) {
          break;
        }
        items.push(stripWrappingQuotes(listMatch[1].trim()));
        lineIndex += 1;
      }
      fields[key] = items.join(",");
      continue;
    }
    fields[key] = stripWrappingQuotes(rawValue);
    lineIndex += 1;
  }
  return fields;
}

function splitMdc(source, filePath) {
  source = source.replace(/^\uFEFF/, "");
  const newline = detectNewline(source);
  if (!source.startsWith("---")) {
    throw new Error(`${filePath}: frontmatter must start with ---`);
  }
  const rest = source.slice(source.indexOf("\n") + 1);
  const closerIndex = rest.search(/\r?\n---\r?\n/);
  if (closerIndex === -1) {
    throw new Error(`${filePath}: missing closing frontmatter ---`);
  }
  const fmBlock = rest.slice(0, closerIndex);
  const afterCloser = rest.slice(closerIndex).replace(/^\r?\n---\r?\n/, "");
  return { fields: parseLinearFrontmatter(fmBlock), body: afterCloser, newline };
}

function buildClaudeMarkdown(fields, body, newline) {
  const lines = ["---"];
  if (fields.description) {
    lines.push(`description: ${fields.description}`);
  }
  const isAlways = fields.alwaysApply === "true";
  const globList = (fields.globs ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (!isAlways && globList.length > 0) {
    lines.push("paths:");
    for (const glob of globList) {
      lines.push(`  - "${glob}"`);
    }
  }
  lines.push("---");
  const bodyWithNl = body.startsWith("\n") || body.startsWith("\r") ? body : `${newline}${body}`;
  return `${lines.join(newline)}${newline}${bodyWithNl.replace(/^\r?\n/, "")}`;
}

function listCursorMdcFiles() {
  return fs
    .readdirSync(cursorRulesDir)
    .filter((name) => name.endsWith(".mdc") && !name.endsWith(".template.mdc"))
    .sort();
}

function expectedClaudeFiles() {
  const expected = new Map();
  for (const name of listCursorMdcFiles()) {
    const sourcePath = path.join(cursorRulesDir, name);
    const source = fs.readFileSync(sourcePath, "utf8");
    const { fields, body, newline } = splitMdc(source, sourcePath);
    const stem = name.slice(0, -".mdc".length);
    expected.set(`${stem}.md`, buildClaudeMarkdown(fields, body, newline));
  }
  return expected;
}

function listClaudeMdFiles() {
  if (!fs.existsSync(claudeRulesDir)) {
    return [];
  }
  return fs.readdirSync(claudeRulesDir).filter((name) => name.endsWith(".md"));
}

function runCheck() {
  const expected = expectedClaudeFiles();
  const actualNames = new Set(listClaudeMdFiles());
  const expectedNames = new Set(expected.keys());
  const extra = [...actualNames].filter((name) => !expectedNames.has(name));
  const missing = [...expectedNames].filter((name) => !actualNames.has(name));
  const drift = [];
  for (const [name, text] of expected) {
    const dest = path.join(claudeRulesDir, name);
    if (!fs.existsSync(dest)) {
      continue;
    }
    const current = fs.readFileSync(dest, "utf8");
    if (current !== text) {
      drift.push(name);
    }
  }
  if (extra.length || missing.length || drift.length) {
    if (extra.length) {
      console.error("extra:", extra.join(", "));
    }
    if (missing.length) {
      console.error("missing:", missing.join(", "));
    }
    if (drift.length) {
      console.error("drift:", drift.join(", "));
    }
    process.exit(1);
  }
}

function runSync() {
  const expected = expectedClaudeFiles();
  fs.mkdirSync(claudeRulesDir, { recursive: true });
  for (const [name, text] of expected) {
    fs.writeFileSync(path.join(claudeRulesDir, name), text);
  }
  for (const name of listClaudeMdFiles()) {
    if (!expected.has(name)) {
      fs.unlinkSync(path.join(claudeRulesDir, name));
    }
  }
}

if (isCheck) {
  runCheck();
} else {
  runSync();
}

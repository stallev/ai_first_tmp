#!/usr/bin/env node
/** Docs wave driver. Claude Code: `node scripts/run-wave.mjs W03` once per DU. Guide: docs/guidelines/agent-docs-orchestration.md */
import { main } from "./run-unit.mjs";

main("docs", process.argv.slice(2));

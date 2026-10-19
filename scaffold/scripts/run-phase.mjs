#!/usr/bin/env node
/** Phase driver (code). Cursor AI: `node scripts/run-phase.mjs P01` once per CU. Guide: docs/guidelines/agent-phase-orchestration.md */
import { main } from "./run-unit.mjs";

main("code", process.argv.slice(2));

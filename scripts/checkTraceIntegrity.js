// scripts/checkTraceIntegrity.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRACE_DIR = path.join(__dirname, "..", "docs/math-trace");
const CODE_ROOT = path.join(__dirname, "..");

const entries = fs.readdirSync(TRACE_DIR)
  .filter(f => f.endsWith(".json"))
  .map(f => JSON.parse(fs.readFileSync(path.join(TRACE_DIR,f),"utf8")));

let failed = false;

for (const e of entries) {
  for (const file of (e.code ?? [])) {
    if (!fs.existsSync(path.join(CODE_ROOT, file))) {
      console.error(`[${e.id}] Missing code file: ${file}`);
      failed = true;
    }
  }
  for (const test of (e.tests ?? [])) {
    if (!fs.existsSync(path.join(CODE_ROOT, test))) {
      console.error(`[${e.id}] Missing test file: ${test}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log("✓ All trace files are valid");
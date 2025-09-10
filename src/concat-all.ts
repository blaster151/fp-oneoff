/**
 * Concatenate all .ts and *config.json files recursively under the repo.
 * Each file is prefixed by a header with its relative path.
 *
 * Usage:
 *   pnpm tsx scripts/dev/concat-all.ts > code-all.txt
 */

import fg from "fast-glob";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const files = await fg([
    "!**demo*.ts",
    "!**test*.ts",
    "!**example*.ts",
    "**/*.ts",
    "**/*config.json",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/build/**",
    "!**/.turbo/**",
    "!**/.next/**",
    "!**/coverage/**",
    "!**/*.d.ts", // optional: skip auto-generated type defs
  ]);

  for (const file of files) {
    const rel = path.relative(process.cwd(), file);
    console.log(`\n\n=== FILE: ${rel} ===\n`);
    const content = fs.readFileSync(file, "utf8");
    console.log(content);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

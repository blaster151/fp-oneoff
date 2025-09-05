import fs from "fs";
import path from "path";

// 1) Load manifest
const manifestPath = path.resolve("docs/laws/coverage.manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
  critical: string[];
  important: string[];
  allowlistTags: string[];
};

// 2) Dynamically import the registry and run it (so packs self-register)
import("../../src/laws/packs").then(async () => {
  const { runAll, allLawful } = await import("../../src/laws/registry");
  const packs = allLawful();
  const tags = new Set(packs.map(p => p.tag));

  const missingCritical = manifest.critical.filter(tag => !tags.has(tag));
  const missingImportant = manifest.important.filter(tag => !tags.has(tag));

  const report = runAll();
  const failing = report.filter(r => !r.ok).map(r => r.tag);

  const allow = new Set(manifest.allowlistTags);
  const missingCritFiltered = missingCritical.filter(t => !allow.has(t));
  const failingFiltered      = failing.filter(t => !allow.has(t));

  const problems: string[] = [];
  if (missingCritFiltered.length) problems.push(`Missing CRITICAL packs: ${missingCritFiltered.join(", ")}`);
  if (missingImportant.length)    problems.push(`Missing important packs: ${missingImportant.join(", ")}`);
  if (failingFiltered.length)     problems.push(`Failing law packs: ${failingFiltered.join(", ")}`);

  if (problems.length) {
    console.error("Law coverage audit failed:\n - " + problems.join("\n - "));
    process.exit(1);
  } else {
    console.log("✅ Law coverage audit passed. Packs registered:", [...tags].join(", "));
  }
}).catch(e => {
  console.error("Audit error:", e);
  process.exit(1);
});
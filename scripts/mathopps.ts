#!/usr/bin/env node
// mathopps.ts
// Mathematical opportunity scanner - surfaces relevant "Future unlocks" 
// based on current development context (git diff or specific paths)

import fs from "node:fs";
import cp from "node:child_process";
import path from "node:path";

type RegistryEntry = {
  id: string;
  title: string;
  tags?: string[];
  future?: string;   // concatenated future unlocks text
  filePath: string;  // where it lives
};

function loadRegistry(): RegistryEntry[] {
  try {
    const idx = JSON.parse(fs.readFileSync("docs/math/index.json", "utf8")) as Record<string, string>;
    const entries: RegistryEntry[] = [];
    
    for (const [id, relativePath] of Object.entries(idx)) {
      const abs = path.resolve(relativePath);
      if (!fs.existsSync(abs)) continue;
      
      const raw = fs.readFileSync(abs, "utf8");
      
      // Extract title
      const titleMatch = raw.match(/title:\s*(.+)/);
      const title = titleMatch ? titleMatch[1]!.trim() : id;
      
      // Extract tags from content (look for common keywords)
      const tags: string[] = [];
      if (raw.toLowerCase().includes("codensity")) tags.push("codensity");
      if (raw.toLowerCase().includes("ultrafilter")) tags.push("ultrafilter");
      if (raw.toLowerCase().includes("topology")) tags.push("topology");
      if (raw.toLowerCase().includes("boolean")) tags.push("boolean");
      if (raw.toLowerCase().includes("monad")) tags.push("monad");
      if (raw.toLowerCase().includes("functor")) tags.push("functor");
      if (raw.toLowerCase().includes("natural")) tags.push("naturality");
      
      // Extract future unlocks section
      const futureMatch = raw.match(/\*\*Future Unlocks\.\*\*([\s\S]*?)(?:\*\*|$)/i);
      const future = futureMatch ? futureMatch[1]!.trim() : "";
      
      entries.push({ id, title, tags, future, filePath: abs });
    }
    
    return entries;
  } catch (error) {
    console.warn(`Failed to load registry: ${(error as Error).message}`);
    return [];
  }
}

function currentSignals(args: string[]): string {
  let text = "";
  
  // Collect tokens from git diff (paths + added lines)
  if (args.includes("--diff")) {
    try {
      const diff = cp.execSync("git diff --name-only --diff-filter=ACM", {
        stdio: ["ignore", "pipe", "inherit"],
        encoding: "utf8"
      });
      const files = diff.split("\n").filter(Boolean).slice(0, 40);
      text += files.join(" ") + " ";
      
      for (const f of files) {
        if (f.endsWith(".ts") || f.endsWith(".md")) {
          try {
            const body = fs.readFileSync(f, "utf8").slice(0, 20000);
            const tokens = body.match(/[A-Za-z_][A-Za-z0-9_\-]{2,}/g) || [];
            text += " " + tokens.slice(0, 2000).join(" ");
          } catch (e) {
            // Skip files that can't be read
          }
        }
      }
    } catch (e) {
      // Git not available or no changes, continue with other signals
    }
  }
  
  // Specific paths
  const pathsArg = args.find(a => a.startsWith("--paths="));
  if (pathsArg) {
    const globs = pathsArg.split("=")[1]!.split(",").map(s => s.trim());
    for (const g of globs) {
      try {
        if (fs.existsSync(g) && fs.statSync(g).isFile()) {
          text += " " + fs.readFileSync(g, "utf8");
        }
      } catch (e) {
        // Skip files that can't be read
      }
    }
  }
  
  return text.toLowerCase();
}

function score(entry: RegistryEntry, sig: string): number {
  const bag: string[] = [];
  bag.push(entry.id.toLowerCase());
  if (entry.tags) bag.push(...entry.tags.map(t => t.toLowerCase()));
  if (entry.title) bag.push(...entry.title.toLowerCase().split(/\W+/));
  if (entry.future) bag.push(...entry.future.toLowerCase().split(/\W+/));
  
  let s = 0;
  for (const t of bag) {
    if (!t || t.length < 3) continue;
    const re = new RegExp("\\\\b" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\\\$&") + "\\\\b", "g");
    const hits = (sig.match(re) || []).length;
    if (hits) s += Math.min(hits, 3); // cap per token
  }
  
  // Small bonus if path tag matches obvious directories
  if (sig.includes("codensity")) s += (entry.tags?.includes("codensity") ? 2 : 0);
  if (sig.includes("topology")) s += (entry.tags?.includes("topology") ? 2 : 0);
  if (sig.includes("ultrafilter")) s += (entry.tags?.includes("ultrafilter") ? 2 : 0);
  
  return s;
}

function main() {
  const entries = loadRegistry();
  const sig = currentSignals(process.argv.slice(2));
  
  console.log(`🔍 Scanning ${entries.length} mathematical records...`);
  
  const ranked = entries
    .map(e => ({ e, score: score(e, sig) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  const out = [
    "# Math Opportunities (auto-suggested)",
    "",
    "These mathematical concepts may be relevant to your current development:",
    "",
    ...ranked.map(r => {
      const futureSection = r.e.future ? `\\n  _Future unlocks:_ ${r.e.future.slice(0, 200)}${r.e.future.length > 200 ? '...' : ''}` : '';
      return `- **${r.e.id}** — ${r.e.title} (relevance score: ${r.score})`
        + (r.e.tags?.length ? `\\n  _Tags:_ ${r.e.tags.join(", ")}` : "")
        + futureSection;
    }),
    "",
    `> Generated by \`npm run math:opps\` from ${entries.length} mathematical records`
  ].join("\\n");

  const ctxDir = path.resolve(".cursor/context");
  fs.mkdirSync(ctxDir, { recursive: true });
  const outputPath = path.join(ctxDir, "math-opportunities.md");
  fs.writeFileSync(outputPath, out);
  
  console.log(`✅ Wrote ${outputPath}`);
  console.log(`📊 Found ${ranked.length} relevant mathematical opportunities`);
  
  if (ranked.length > 0) {
    console.log("\\n🎯 Top opportunities:");
    ranked.slice(0, 5).forEach(r => {
      console.log(`   ${r.e.id}: ${r.e.title} (score: ${r.score})`);
    });
  }
}

if (require.main === module) {
  main();
}
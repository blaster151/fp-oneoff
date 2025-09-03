#!/usr/bin/env node
// mathbuild.ts
// Builds fresh documentation and ID lists from mathematical registry

import fs from "node:fs";
import path from "node:path";

function main() {
  console.log("🔧 Building mathematical documentation...");
  
  try {
    // Load registry
    const index = JSON.parse(fs.readFileSync("docs/math/index.json", "utf8")) as Record<string, string>;
    const registryIds = Object.keys(index);
    
    // Build ID list for VS Code/Cursor autocomplete
    const idsFile = path.resolve("docs/math/.ids.json");
    fs.writeFileSync(idsFile, JSON.stringify(registryIds, null, 2));
    console.log(`✅ Built ${idsFile} with ${registryIds.length} IDs`);
    
    // Build comprehensive README
    const readmeContent = [
      "# Mathematical Registry",
      "",
      "This directory contains mathematical documentation linking code to theorems, laws, and research sources.",
      "",
      "## Available Records",
      "",
      ...registryIds.map(id => {
        const filePath = index[id]!;
        let title = id;
        try {
          const content = fs.readFileSync(filePath, "utf8");
          const titleMatch = content.match(/title:\\s*(.+)/);
          if (titleMatch) title = titleMatch[1]!.trim();
        } catch (e) {
          // Use ID as fallback
        }
        return `- [${id}](${path.basename(filePath)}) — ${title}`;
      }),
      "",
      "## Usage",
      "",
      "### In Code",
      "```typescript",
      "/** @math THM-CODENSITY-RAN */",
      "export function codensityOf(B, G) { ... }",
      "",
      "/** @law LAW-ULTRA-AND */", 
      "export function deriveIntersectionLaw(...) { ... }",
      "```",
      "",
      "### In Tests", 
      "```typescript",
      "/** @law LAW-MONAD-LAWS */",
      "describe('monad laws', () => { ... });",
      "```",
      "",
      "### Verification",
      "```bash",
      "npm run tracecheck  # Verify all references",
      "npm run math:opps   # Find relevant opportunities",
      "```",
      "",
      `> Generated automatically from ${registryIds.length} mathematical records`
    ].join("\\n");
    
    const readmePath = path.resolve("docs/math/README.generated.md");
    fs.writeFileSync(readmePath, readmeContent);
    console.log(`✅ Built ${readmePath}`);
    
    // Build tutorial stubs
    const tutorialContent = [
      "# Mathematical Traceability Tutorial",
      "",
      "## Quick Start",
      "",
      "1. **Research** a mathematical concept",
      "2. **Document** in `docs/math/CONCEPT-ID.md` with LaTeX",
      "3. **Implement** with `/** @math CONCEPT-ID */` annotation", 
      "4. **Test** with `/** @law LAW-ID */` witness hooks",
      "5. **Verify** with `npm run tracecheck`",
      "",
      "## Available Mathematical Concepts",
      "",
      ...registryIds.slice(0, 8).map(id => `- ${id}: Implementation-ready mathematical concept`),
      "",
      "## Future Development",
      "",
      "Use `npm run math:opps` to discover relevant mathematical opportunities",
      "based on your current development context.",
      "",
      `> Tutorial based on ${registryIds.length} available mathematical records`
    ].join("\\n");
    
    const tutorialPath = path.resolve("docs/math/TUTORIAL.generated.md");
    fs.writeFileSync(tutorialPath, tutorialContent);
    console.log(`✅ Built ${tutorialPath}`);
    
    console.log("\\n🎉 Mathematical documentation build complete!");
    
  } catch (error) {
    console.error("❌ Build failed:", (error as Error).message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
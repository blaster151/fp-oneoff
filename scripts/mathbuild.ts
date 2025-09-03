#!/usr/bin/env node
// mathbuild.ts
// Enhanced mathematical documentation builder with collection support

import fs from "node:fs";
import path from "node:path";

function main() {
  console.log("🔧 Building mathematical documentation...");
  
  try {
    // Load registry using the new collection format
    const idxPath = path.resolve(process.cwd(), "docs/math/index.json");
    const index = JSON.parse(fs.readFileSync(idxPath, "utf8")) as { collections: string[] };
    const entries: any[] = [];
    
    for (const relativePath of index.collections) {
      const filePath = path.resolve(process.cwd(), relativePath);
      
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf8");
        
        // Parse sections starting with "## [ID]"
        const re = /^## \[([A-Z0-9\-]+)\][\s\S]*?(?=^## \[|$)/gm;
        let match: RegExpExecArray | null;
        
        while ((match = re.exec(raw))) {
          const id = match[1]!;
          const block = match[0];
          
          // Extract title from id: line or use ID as fallback
          const titleMatch = block.match(/id:\s*([A-Z0-9\-]+)/);
          const title = titleMatch ? titleMatch[1]!.trim() : id;
          
          // Extract tags from explicit tags: line
          const tagsMatch = block.match(/tags:\s*\[([^\]]*)\]/);
          const tags = tagsMatch ? tagsMatch[1]!.split(",").map(s => s.trim()).filter(Boolean) : [];
          
          // Extract future unlocks section
          const futureMatch = block.match(/\*\*Future unlocks\*\*([\s\S]*?)(?:\*\*|## \[|$)/i);
          const future = futureMatch ? futureMatch[1]!.trim() : "";
          
          entries.push({ id, title, tags, future, filePath });
        }
      }
    }
    
    const ids = entries.map(e => e.id).sort();
    console.log(`📚 Loaded ${entries.length} mathematical records from ${index.collections.length} collections`);
    
    // Build ID list for VS Code/Cursor autocomplete
    const idsFile = path.resolve("docs/math/.ids.json");
    fs.writeFileSync(idsFile, JSON.stringify(ids, null, 2));
    console.log(`✅ Built ${idsFile} with ${ids.length} IDs`);
    
    // Build comprehensive README with tags and future unlocks
    const readme = [
      "# Mathematical Registry (generated)",
      "",
      "This registry contains mathematical documentation linking code to theorems, laws, and research sources.",
      "",
      "## Available Records",
      "",
      ...entries.map(e => {
        const tagPart = e.tags && e.tags.length > 0 ? ` _[${e.tags.join(", ")}]_` : "";
        const futurePart = e.future ? `\\n  Future: ${e.future.slice(0, 100)}${e.future.length > 100 ? '...' : ''}` : "";
        return `- **${e.id}** — ${e.title}${tagPart}${futurePart}`;
      }),
      "",
      "## Usage Patterns",
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
      "### Development Workflow",
      "```bash",
      "npm run math:opps    # Find relevant opportunities",
      "npm run tracecheck   # Verify all references", 
      "npm run math:build   # Generate fresh documentation",
      "```",
      "",
      `> Generated automatically from ${entries.length} mathematical records`
    ].join("\\n");
    
    const readmePath = path.resolve("docs/README.generated.md");
    fs.writeFileSync(readmePath, readme);
    console.log(`✅ Built ${readmePath}`);
    
    console.log("\\n🎉 Mathematical documentation build complete!");
    
  } catch (error) {
    console.error("❌ Build failed:", (error as Error).message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
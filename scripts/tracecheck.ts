#!/usr/bin/env node
// tracecheck.ts
// Lints @math / @law tags and produces mathematical traceability report

import fs from "node:fs";
import path from "node:path";
import { glob } from "glob";
import { loadRegistry } from "../src/types/math-trace-registry.js";
import { extractMathTags, MATH_TAG, LAW_TAG } from "../src/types/math-trace-annot.js";
import { TraceReport } from "../src/types/math-trace-types.js";

async function main() {
  console.log("=".repeat(80));
  console.log("🔍 MATHEMATICAL TRACEABILITY REPORT");
  console.log("=".repeat(80));

  // Load mathematical registry
  const registry = loadRegistry();
  const registryIds = Object.keys(registry);
  
  console.log(`\n📚 Registry: ${registryIds.length} mathematical records`);
  console.log(`   Location: docs/math/index.json`);
  console.log(`   Records: ${registryIds.slice(0, 5).join(', ')}${registryIds.length > 5 ? ', ...' : ''}`);

  // Find all TypeScript files
  const files = await glob("src/**/*.ts", { ignore: ["node_modules/**", "dist/**"] });
  console.log(`\n📁 Scanning: ${files.length} TypeScript files`);

  // Extract all @math and @law tags
  const allTags: any[] = [];
  const filesWithTags = new Set<string>();
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf8");
      const tags = extractMathTags(file, content);
      
      if (tags.length > 0) {
        filesWithTags.add(file);
        allTags.push(...tags);
      }
    } catch (error) {
      console.warn(`Warning: Could not read ${file}: ${(error as Error).message}`);
    }
  }

  // Validate tags against registry
  const validTags: any[] = [];
  const missingTags: any[] = [];
  
  for (const tag of allTags) {
    if (registry[tag.id]) {
      validTags.push(tag);
    } else {
      missingTags.push(tag);
    }
  }

  // Generate report
  console.log(`\n🏷️  Tag Analysis:`);
  console.log(`   Total tags found: ${allTags.length}`);
  console.log(`   Valid tags: ${validTags.length} ✅`);
  console.log(`   Missing tags: ${missingTags.length} ${missingTags.length === 0 ? '✅' : '❌'}`);
  console.log(`   Files with tags: ${filesWithTags.size}/${files.length} (${Math.round(100 * filesWithTags.size / files.length)}%)`);

  // Show valid tags by category
  const mathTags = validTags.filter(t => t.tag === MATH_TAG);
  const lawTags = validTags.filter(t => t.tag === LAW_TAG);
  
  console.log(`\n📐 Valid Tags by Category:`);
  console.log(`   @math tags: ${mathTags.length}`);
  console.log(`   @law tags: ${lawTags.length}`);

  if (mathTags.length > 0) {
    console.log(`\n   Mathematical Concepts:`);
    const mathIds = [...new Set(mathTags.map(t => t.id))];
    mathIds.forEach(id => {
      const record = registry[id];
      const fileCount = mathTags.filter(t => t.id === id).length;
      console.log(`     ${id}: ${record?.title || 'Unknown'} (${fileCount} references)`);
    });
  }

  if (lawTags.length > 0) {
    console.log(`\n   Mathematical Laws:`);
    const lawIds = [...new Set(lawTags.map(t => t.id))];
    lawIds.forEach(id => {
      const record = registry[id];
      const fileCount = lawTags.filter(t => t.id === id).length;
      console.log(`     ${id}: ${record?.title || 'Unknown'} (${fileCount} references)`);
    });
  }

  // Show missing tags
  if (missingTags.length > 0) {
    console.log(`\n❌ Missing Registry Entries:`);
    missingTags.forEach(tag => {
      console.log(`   ${tag.id} - ${path.relative(process.cwd(), tag.file)}:${tag.line}`);
    });
    console.log(`\n   Add these to docs/math/index.json and create corresponding .md files`);
  }

  // Show most referenced concepts
  console.log(`\n🔥 Most Referenced Concepts:`);
  const refCounts = new Map<string, number>();
  allTags.forEach(tag => {
    refCounts.set(tag.id, (refCounts.get(tag.id) || 0) + 1);
  });
  
  const topRefs = [...refCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  topRefs.forEach(([id, count]) => {
    const record = registry[id];
    console.log(`   ${id}: ${count} references - ${record?.title || 'Unknown'}`);
  });

  // Coverage by file type
  console.log(`\n📊 Coverage Analysis:`);
  const filesByDir = new Map<string, { total: number; tagged: number }>();
  
  files.forEach(file => {
    const dir = path.dirname(file).split('/').slice(0, 2).join('/'); // src/types, src/examples, etc.
    if (!filesByDir.has(dir)) {
      filesByDir.set(dir, { total: 0, tagged: 0 });
    }
    const entry = filesByDir.get(dir)!;
    entry.total++;
    if (filesWithTags.has(file)) {
      entry.tagged++;
    }
  });

  filesByDir.forEach((stats, dir) => {
    const percentage = Math.round(100 * stats.tagged / stats.total);
    console.log(`   ${dir}: ${stats.tagged}/${stats.total} files (${percentage}%)`);
  });

  console.log(`\n${"=".repeat(80)}`);
  
  if (missingTags.length === 0) {
    console.log(`✅ All mathematical references are properly documented!`);
    console.log(`🔗 ${validTags.length} code locations linked to mathematical sources`);
  } else {
    console.log(`❌ ${missingTags.length} mathematical references need documentation`);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}
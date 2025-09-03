// math-trace-registry.ts
// Registry system for mathematical traceability
// Loads and manages mathematical records from docs/math/

import fs from "node:fs";
import path from "node:path";
import { MathRecord } from "./math-trace-types.js";

/**
 * Load mathematical registry from docs/math/index.json
 */
export function loadRegistry(): Record<string, MathRecord> {
  try {
    const idxPath = path.resolve(process.cwd(), "docs/math/index.json");
    const index = JSON.parse(fs.readFileSync(idxPath, "utf8")) as Record<string, string>;
    const out: Record<string, MathRecord> = {};
    
    for (const [id, relativePath] of Object.entries(index)) {
      const filePath = path.resolve(process.cwd(), relativePath);
      
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf8");
        
        // Extract title from frontmatter or use ID as fallback
        const titleMatch = raw.match(/title:\s*(.+)/);
        const title = titleMatch ? titleMatch[1]!.trim() : id;
        
        // Extract LaTeX statement if present
        const latexMatch = raw.match(/\$\$([\s\S]*?)\$\$/);
        const statementLatex = latexMatch ? latexMatch[1]!.trim() : undefined;
        
        out[id] = { 
          id, 
          title, 
          statementLatex: statementLatex || undefined,
          filePath 
        } as MathRecord;
      } else {
        console.warn(`Math registry: File not found: ${filePath}`);
      }
    }
    
    return out;
  } catch (error) {
    console.warn(`Failed to load math registry: ${(error as Error).message}`);
    return {};
  }
}

/**
 * Get mathematical record by ID
 */
export function getMathRecord(id: string): MathRecord | undefined {
  const registry = loadRegistry();
  return registry[id];
}

/**
 * Get all mathematical records
 */
export function getAllMathRecords(): MathRecord[] {
  const registry = loadRegistry();
  return Object.values(registry);
}

/**
 * Search mathematical records by keyword
 */
export function searchMathRecords(keyword: string): MathRecord[] {
  const records = getAllMathRecords();
  const lowerKeyword = keyword.toLowerCase();
  
  return records.filter(record => 
    record.title.toLowerCase().includes(lowerKeyword) ||
    record.id.toLowerCase().includes(lowerKeyword) ||
    (record.statementLatex && record.statementLatex.toLowerCase().includes(lowerKeyword))
  );
}

/**
 * Validate that all registry entries have corresponding files
 */
export function validateRegistry(): {
  valid: boolean;
  missingFiles: string[];
  totalEntries: number;
} {
  const registry = loadRegistry();
  const missingFiles: string[] = [];
  
  for (const [id, record] of Object.entries(registry)) {
    if (!fs.existsSync(record.filePath)) {
      missingFiles.push(`${id}: ${record.filePath}`);
    }
  }
  
  return {
    valid: missingFiles.length === 0,
    missingFiles,
    totalEntries: Object.keys(registry).length
  };
}
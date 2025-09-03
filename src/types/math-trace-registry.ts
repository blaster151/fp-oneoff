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
    const index = JSON.parse(fs.readFileSync(idxPath, "utf8")) as { collections: string[] };
    const out: Record<string, MathRecord> = {};
    
    for (const relativePath of index.collections) {
      const filePath = path.resolve(process.cwd(), relativePath);
      
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf8");
        
        // Parse sections starting with "## [ID]" and running until next "## [" or EOF
        const re = /^## \[([A-Z0-9\-]+)\][\s\S]*?(?=^## \[|$)/gm;
        let match: RegExpExecArray | null;
        
        while ((match = re.exec(raw))) {
          const id = match[1]!;
          const block = match[0];
          
          // Extract title from id: line or use ID as fallback
          const titleMatch = block.match(/id:\s*([A-Z0-9\-]+)/);
          const title = titleMatch ? titleMatch[1]!.trim() : id;
          
          // Extract LaTeX statement if present
          const latexMatch = block.match(/\\\(([\s\S]*?)\\\)/);
          const statementLatex = latexMatch ? latexMatch[1]!.trim() : undefined;
          
          out[id] = { 
            id, 
            title, 
            statementLatex,
            filePath 
          } as MathRecord;
        }
      } else {
        console.warn(`Math registry: Collection file not found: ${filePath}`);
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
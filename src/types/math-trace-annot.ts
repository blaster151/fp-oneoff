// math-trace-annot.ts
// Code annotation helpers for mathematical traceability
// Provides @math and @law tags for linking code to mathematical sources

/**
 * Code annotation helpers.
 * Use JSDoc in code:  @math THM-CODENSITY-END  @law LAW-ULTRA-AND
 *
 * Example:
 *  /** @math THM-CODENSITY-END @law LAW-ULTRA-AND *\/
 *  export function RanSet(...) { ... }
 */

export const MATH_TAG = "@math";
export const LAW_TAG = "@law";

export interface FoundTag {
  file: string;
  line: number;
  tag: "@math" | "@law";
  id: string;
  context?: string; // Surrounding code for context
}

/**
 * Extract @math and @law tags from source code
 */
export function extractMathTags(
  filePath: string, 
  sourceCode: string
): FoundTag[] {
  const found: FoundTag[] = [];
  const lines = sourceCode.split(/\r?\n/);
  
  lines.forEach((line, index) => {
    // Match @math or @law followed by an ID
    const tagMatches = line.matchAll(/@(math|law)\s+([A-Z0-9\-_]+)/g);
    
    for (const match of tagMatches) {
      const tag = match[1] === "math" ? MATH_TAG : LAW_TAG;
      const id = match[2]!;
      
      // Get surrounding context (3 lines before and after)
      const contextStart = Math.max(0, index - 3);
      const contextEnd = Math.min(lines.length, index + 4);
      const context = lines.slice(contextStart, contextEnd).join('\n');
      
      found.push({
        file: filePath,
        line: index + 1,
        tag: tag as "@math" | "@law",
        id,
        context
      });
    }
  });
  
  return found;
}

/**
 * Validate that a math tag ID exists in the registry
 */
export function validateMathTag(id: string, registry: Record<string, any>): boolean {
  return id in registry;
}

/**
 * Create math annotation comment
 */
export function createMathAnnotation(mathIds: string[], lawIds: string[] = []): string {
  const mathPart = mathIds.length > 0 ? `@math ${mathIds.join(' ')}` : '';
  const lawPart = lawIds.length > 0 ? `@law ${lawIds.join(' ')}` : '';
  
  const parts = [mathPart, lawPart].filter(Boolean);
  return parts.length > 0 ? `/** ${parts.join(' ')} */` : '';
}

/**
 * Extract mathematical context from code
 * Useful for understanding what mathematical concepts are implemented
 */
export function extractMathContext(
  sourceCode: string,
  mathTags: FoundTag[]
): {
  concepts: string[];
  laws: string[];
  theorems: string[];
} {
  const concepts: string[] = [];
  const laws: string[] = [];
  const theorems: string[] = [];
  
  mathTags.forEach(tag => {
    if (tag.tag === "@math") {
      if (tag.id.startsWith("THM-")) {
        theorems.push(tag.id);
      } else {
        concepts.push(tag.id);
      }
    } else if (tag.tag === "@law") {
      laws.push(tag.id);
    }
  });
  
  return {
    concepts: [...new Set(concepts)],
    laws: [...new Set(laws)],
    theorems: [...new Set(theorems)]
  };
}
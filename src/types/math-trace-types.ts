// math-trace-types.ts
// Types for mathematical traceability system
// Connects code to theorems, laws, and mathematical sources

export type SourceRef =
  | { type: "slide"; where: string; pages?: number[]; note?: string }
  | { type: "paper"; where: string; pages?: number[]; note?: string }
  | { type: "book"; where: string; pages?: number[]; note?: string }
  | { type: "standard"; where: string; pages?: number[]; note?: string }
  | { type: "url"; where: string; note?: string }
  | { type: "canonical"; where: string; note?: string }
  | { type: "knowledge"; where: string; note?: string };

export interface MathRecord {
  id: string;
  title: string;
  statementLatex?: string; // LaTeX excerpt for quick display
  implicationsTS?: string[]; // TypeScript APIs, types, operations unlocked
  witnessLaws?: string[]; // Concise law phrases for testing
  futureUnlocks?: string[]; // Ideas to remember later
  sources?: SourceRef[];
  filePath: string; // Markdown file path
}

export interface FoundTag {
  file: string;
  line: number;
  tag: "@math" | "@law";
  id: string;
  context?: string; // Surrounding code context
}

export interface TraceReport {
  totalTags: number;
  validTagCount: number;
  missingTags: FoundTag[];
  validTags: FoundTag[];
  registrySize: number;
  coverage: {
    filesWithTags: number;
    totalFiles: number;
    percentage: number;
  };
}
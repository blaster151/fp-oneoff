#!/usr/bin/env node

/**
 * Export Symbol Analysis Tool
 * 
 * Analyzes all exported symbols across the codebase to help identify:
 * - Duplicate type definitions with different names
 * - Re-exports and barrel file patterns
 * - Import usage patterns
 * - Potential consolidation opportunities
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Configuration
const CONFIG = {
  // File patterns to analyze
  includePatterns: ['**/*.ts', '**/*.js'],
  excludePatterns: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.test.ts', '**/*.spec.ts'],
  
  // Export types to track
  exportTypes: ['interface', 'type', 'function', 'const', 'class', 'enum', 'namespace'],
  
  // Output formats
  outputFormats: ['json', 'csv', 'markdown']
};

class ExportAnalyzer {
  constructor() {
    this.exports = new Map(); // symbol -> ExportInfo
    this.imports = new Map(); // file -> ImportInfo[]
    this.reExports = new Map(); // file -> ReExportInfo[]
  }

  async analyze() {
    console.log('🔍 Analyzing exports across codebase...');
    
    const files = await this.findFiles();
    console.log(`📁 Found ${files.length} files to analyze`);
    
    for (const file of files) {
      await this.analyzeFile(file);
    }
    
    this.analyzePatterns();
    return this.generateReport();
  }

  async findFiles() {
    const files = [];
    
    const walkDir = async (dir) => {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!this.shouldExcludeDir(entry.name)) {
            await walkDir(fullPath);
          }
        } else if (entry.isFile()) {
          if (this.shouldIncludeFile(entry.name)) {
            files.push(fullPath);
          }
        }
      }
    };
    
    await walkDir(projectRoot);
    return files;
  }

  shouldExcludeDir(dirName) {
    return ['node_modules', 'dist', 'build', '.git', '.vscode'].includes(dirName);
  }

  shouldIncludeFile(fileName) {
    const ext = path.extname(fileName);
    if (!['.ts', '.js'].includes(ext)) return false;
    
    // Exclude test files
    if (fileName.includes('.test.') || fileName.includes('.spec.')) return false;
    
    return true;
  }

  async analyzeFile(filePath) {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const relativePath = path.relative(projectRoot, filePath);
      
      // Parse exports
      const exports = this.parseExports(content, relativePath);
      for (const exp of exports) {
        this.exports.set(exp.name, exp);
      }
      
      // Parse imports
      const imports = this.parseImports(content, relativePath);
      this.imports.set(relativePath, imports);
      
      // Parse re-exports
      const reExports = this.parseReExports(content, relativePath);
      this.reExports.set(relativePath, reExports);
      
    } catch (error) {
      console.warn(`⚠️  Could not analyze ${filePath}: ${error.message}`);
    }
  }

  parseExports(content, filePath) {
    const exports = [];
    
    // Named exports: export interface, export type, export function, etc.
    const namedExportRegex = /export\s+(interface|type|function|const|class|enum|namespace)\s+(\w+)/g;
    let match;
    while ((match = namedExportRegex.exec(content)) !== null) {
      exports.push({
        name: match[2],
        type: match[1],
        file: filePath,
        line: this.getLineNumber(content, match.index),
        isReExport: false
      });
    }
    
    // Default exports
    const defaultExportRegex = /export\s+default\s+(?:function\s+)?(\w+)/g;
    while ((match = defaultExportRegex.exec(content)) !== null) {
      exports.push({
        name: match[1],
        type: 'default',
        file: filePath,
        line: this.getLineNumber(content, match.index),
        isReExport: false
      });
    }
    
    // Export from statements (re-exports)
    const exportFromRegex = /export\s*\{\s*([^}]+)\s*\}\s*from\s+['"]([^'"]+)['"]/g;
    while ((match = exportFromRegex.exec(content)) !== null) {
      const symbols = match[1].split(',').map(s => s.trim().split(' as ')[0]);
      const fromPath = match[2];
      
      for (const symbol of symbols) {
        exports.push({
          name: symbol,
          type: 're-export',
          file: filePath,
          line: this.getLineNumber(content, match.index),
          isReExport: true,
          originalFile: fromPath
        });
      }
    }
    
    return exports;
  }

  parseImports(content, filePath) {
    const imports = [];
    
    // Import statements
    const importRegex = /import\s+(?:\{[^}]+\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push({
        from: match[1],
        file: filePath,
        line: this.getLineNumber(content, match.index)
      });
    }
    
    return imports;
  }

  parseReExports(content, filePath) {
    const reExports = [];
    
    // Re-export patterns
    const reExportRegex = /export\s*\{\s*([^}]+)\s*\}\s*from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = reExportRegex.exec(content)) !== null) {
      reExports.push({
        symbols: match[1].split(',').map(s => s.trim()),
        from: match[2],
        file: filePath,
        line: this.getLineNumber(content, match.index)
      });
    }
    
    return reExports;
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  analyzePatterns() {
    // Find potential duplicates by analyzing type definitions
    this.findPotentialDuplicates();
    
    // Analyze barrel file patterns
    this.analyzeBarrelFiles();
    
    // Find unused exports
    this.findUnusedExports();
  }

  findPotentialDuplicates() {
    const typeDefinitions = new Map();
    
    for (const [name, exp] of this.exports) {
      if (['interface', 'type'].includes(exp.type)) {
        const key = this.normalizeTypeName(name);
        if (!typeDefinitions.has(key)) {
          typeDefinitions.set(key, []);
        }
        typeDefinitions.get(key).push(exp);
      }
    }
    
    this.duplicates = [];
    for (const [normalizedName, definitions] of typeDefinitions) {
      if (definitions.length > 1) {
        this.duplicates.push({
          normalizedName,
          definitions,
          confidence: this.calculateDuplicateConfidence(definitions)
        });
      }
    }
  }

  normalizeTypeName(name) {
    // Remove common prefixes/suffixes and normalize
    return name
      .replace(/^(Group|Finite|Small|Category|Hom|Eq|Iso)/, '')
      .replace(/(Group|Finite|Small|Category|Hom|Eq|Iso)$/, '')
      .toLowerCase();
  }

  calculateDuplicateConfidence(definitions) {
    // Simple heuristic: if they're in different files and have similar names
    const files = new Set(definitions.map(d => d.file));
    if (files.size === 1) return 0.1; // Same file, probably not duplicate
    
    const names = definitions.map(d => d.name.toLowerCase());
    const similarity = this.calculateNameSimilarity(names);
    
    return similarity;
  }

  calculateNameSimilarity(names) {
    // Simple similarity based on common substrings
    if (names.length < 2) return 0;
    
    const [first, ...rest] = names;
    let maxSimilarity = 0;
    
    for (const other of rest) {
      const similarity = this.stringSimilarity(first, other);
      maxSimilarity = Math.max(maxSimilarity, similarity);
    }
    
    return maxSimilarity;
  }

  stringSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  analyzeBarrelFiles() {
    this.barrelFiles = [];
    
    for (const [file, reExports] of this.reExports) {
      if (reExports.length > 0) {
        this.barrelFiles.push({
          file,
          reExportCount: reExports.length,
          reExports
        });
      }
    }
  }

  findUnusedExports() {
    this.unusedExports = [];
    
    for (const [name, exp] of this.exports) {
      if (exp.isReExport) continue;
      
      const usageCount = this.countUsage(name);
      if (usageCount === 0) {
        this.unusedExports.push(exp);
      }
    }
  }

  countUsage(symbolName) {
    let count = 0;
    
    for (const [file, imports] of this.imports) {
      for (const imp of imports) {
        // This is a simplified check - in reality, you'd need to parse the import destructuring
        if (imp.from.includes(symbolName)) {
          count++;
        }
      }
    }
    
    return count;
  }

  generateReport() {
    const report = {
      summary: {
        totalExports: this.exports.size,
        totalFiles: this.imports.size,
        potentialDuplicates: this.duplicates?.length || 0,
        barrelFiles: this.barrelFiles?.length || 0,
        unusedExports: this.unusedExports?.length || 0
      },
      duplicates: this.duplicates || [],
      barrelFiles: this.barrelFiles || [],
      unusedExports: this.unusedExports || [],
      allExports: Array.from(this.exports.values()).sort((a, b) => a.name.localeCompare(b.name))
    };
    
    return report;
  }
}

// Main execution
async function main() {
  const analyzer = new ExportAnalyzer();
  const report = await analyzer.analyze();
  
  // Output results
  console.log('\n📊 Export Analysis Report');
  console.log('========================');
  console.log(`Total exports: ${report.summary.totalExports}`);
  console.log(`Total files: ${report.summary.totalFiles}`);
  console.log(`Potential duplicates: ${report.summary.potentialDuplicates}`);
  console.log(`Barrel files: ${report.summary.barrelFiles}`);
  console.log(`Unused exports: ${report.summary.unusedExports}`);
  
  if (report.duplicates.length > 0) {
    console.log('\n🔍 Potential Duplicates:');
    for (const dup of report.duplicates) {
      console.log(`\n${dup.normalizedName} (confidence: ${dup.confidence.toFixed(2)})`);
      for (const def of dup.definitions) {
        console.log(`  - ${def.name} (${def.type}) in ${def.file}:${def.line}`);
      }
    }
  }
  
  if (report.barrelFiles.length > 0) {
    console.log('\n📦 Barrel Files:');
    for (const barrel of report.barrelFiles) {
      console.log(`  ${barrel.file} (${barrel.reExportCount} re-exports)`);
    }
  }
  
  // Save detailed report
  const reportsDir = path.join(projectRoot, 'reports');
  await fs.promises.mkdir(reportsDir, { recursive: true });
  
  const reportPath = path.join(reportsDir, 'export-analysis-report.json');
  await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 Detailed report saved to: ${reportPath}`);
  
  // Generate CSV for easy analysis
  const csvPath = path.join(reportsDir, 'export-analysis.csv');
  const csvContent = generateCSV(report);
  await fs.promises.writeFile(csvPath, csvContent);
  console.log(`📊 CSV report saved to: ${csvPath}`);
}

function generateCSV(report) {
  const headers = ['Name', 'Type', 'File', 'Line', 'IsReExport', 'OriginalFile'];
  const rows = report.allExports.map(exp => [
    exp.name,
    exp.type,
    exp.file,
    exp.line,
    exp.isReExport,
    exp.originalFile || ''
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ExportAnalyzer };
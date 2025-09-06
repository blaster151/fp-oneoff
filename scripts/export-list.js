#!/usr/bin/env node

/**
 * Export List Generator
 * 
 * Generates an alphabetized list of all exported symbols with:
 * - Filename
 * - Whether it's re-exported
 * - Import usage count
 * - Call sites (if available)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

async function generateExportList() {
  console.log('📋 Generating alphabetized export list...');
  
  const exports = new Map();
  const imports = new Map();
  
  // Find all files
  const files = await findFiles();
  console.log(`📁 Found ${files.length} files to analyze`);
  
  // Analyze each file
  for (const file of files) {
    await analyzeFile(file, exports, imports);
  }
  
  // Count usage
  const usageCounts = countUsage(exports, imports);
  
  // Generate alphabetized list
  const exportList = Array.from(exports.values())
    .map(exp => ({
      ...exp,
      usageCount: usageCounts.get(exp.name) || 0
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  
  // Generate reports
  await generateMarkdownReport(exportList);
  await generateCSVReport(exportList);
  
  console.log(`✅ Generated export list with ${exportList.length} symbols`);
}

async function findFiles() {
  const files = [];
  
  const walkDir = async (dir) => {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!['node_modules', 'dist', 'build', '.git', '.vscode', 'scripts'].includes(entry.name)) {
          await walkDir(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (['.ts', '.js'].includes(ext) && !entry.name.includes('.test.') && !entry.name.includes('.spec.')) {
          files.push(fullPath);
        }
      }
    }
  };
  
  await walkDir(projectRoot);
  return files;
}

async function analyzeFile(filePath, exports, imports) {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const relativePath = path.relative(projectRoot, filePath);
    
    // Parse exports
    const fileExports = parseExports(content, relativePath);
    for (const exp of fileExports) {
      exports.set(exp.name, exp);
    }
    
    // Parse imports
    const fileImports = parseImports(content, relativePath);
    imports.set(relativePath, fileImports);
    
  } catch (error) {
    console.warn(`⚠️  Could not analyze ${filePath}: ${error.message}`);
  }
}

function parseExports(content, filePath) {
  const exports = [];
  
  // Named exports
  const namedExportRegex = /export\s+(interface|type|function|const|class|enum|namespace)\s+(\w+)/g;
  let match;
  while ((match = namedExportRegex.exec(content)) !== null) {
    exports.push({
      name: match[2],
      type: match[1],
      file: filePath,
      line: getLineNumber(content, match.index),
      isReExport: false,
      originalFile: null
    });
  }
  
  // Default exports
  const defaultExportRegex = /export\s+default\s+(?:function\s+)?(\w+)/g;
  while ((match = defaultExportRegex.exec(content)) !== null) {
    exports.push({
      name: match[1],
      type: 'default',
      file: filePath,
      line: getLineNumber(content, match.index),
      isReExport: false,
      originalFile: null
    });
  }
  
  // Re-exports
  const exportFromRegex = /export\s*\{\s*([^}]+)\s*\}\s*from\s+['"]([^'"]+)['"]/g;
  while ((match = exportFromRegex.exec(content)) !== null) {
    const symbols = match[1].split(',').map(s => s.trim().split(' as ')[0]);
    const fromPath = match[2];
    
    for (const symbol of symbols) {
      exports.push({
        name: symbol,
        type: 're-export',
        file: filePath,
        line: getLineNumber(content, match.index),
        isReExport: true,
        originalFile: fromPath
      });
    }
  }
  
  return exports;
}

function parseImports(content, filePath) {
  const imports = [];
  
  // Import statements
  const importRegex = /import\s+(?:\{[^}]+\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push({
      from: match[1],
      file: filePath,
      line: getLineNumber(content, match.index)
    });
  }
  
  return imports;
}

function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

function countUsage(exports, imports) {
  const usageCounts = new Map();
  
  for (const [name, exp] of exports) {
    let count = 0;
    
    for (const [file, fileImports] of imports) {
      for (const imp of fileImports) {
        // Simple heuristic: if the import path contains the symbol name
        if (imp.from.includes(name) || imp.from.includes(name.toLowerCase())) {
          count++;
        }
      }
    }
    
    usageCounts.set(name, count);
  }
  
  return usageCounts;
}

async function generateMarkdownReport(exportList) {
  const reportsDir = path.join(projectRoot, 'reports');
  await fs.promises.mkdir(reportsDir, { recursive: true });
  
  const reportPath = path.join(reportsDir, 'export-list.md');
  
  let content = '# Export List\n\n';
  content += `Generated on ${new Date().toISOString()}\n\n`;
  content += `Total exports: ${exportList.length}\n\n`;
  
  content += '| Name | Type | File | Line | Re-export | Original File | Usage Count |\n';
  content += '|------|------|------|------|-----------|---------------|-------------|\n';
  
  for (const exp of exportList) {
    const name = exp.name;
    const type = exp.type;
    const file = exp.file;
    const line = exp.line;
    const isReExport = exp.isReExport ? '✅' : '❌';
    const originalFile = exp.originalFile || '-';
    const usageCount = exp.usageCount;
    
    content += `| ${name} | ${type} | ${file} | ${line} | ${isReExport} | ${originalFile} | ${usageCount} |\n`;
  }
  
  await fs.promises.writeFile(reportPath, content);
  console.log(`📄 Markdown report saved to: ${reportPath}`);
}

async function generateCSVReport(exportList) {
  const reportsDir = path.join(projectRoot, 'reports');
  await fs.promises.mkdir(reportsDir, { recursive: true });
  
  const reportPath = path.join(reportsDir, 'export-list.csv');
  
  const headers = ['Name', 'Type', 'File', 'Line', 'IsReExport', 'OriginalFile', 'UsageCount'];
  const rows = exportList.map(exp => [
    exp.name,
    exp.type,
    exp.file,
    exp.line,
    exp.isReExport,
    exp.originalFile || '',
    exp.usageCount
  ]);
  
  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
  await fs.promises.writeFile(reportPath, csvContent);
  console.log(`📊 CSV report saved to: ${reportPath}`);
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  generateExportList().catch(console.error);
}
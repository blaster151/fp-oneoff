#!/usr/bin/env node

/**
 * Type Shape Analysis Tool
 * 
 * Analyzes type definitions to find potential duplicates based on:
 * - Property names and types
 * - Method signatures
 * - Structural similarity
 * - Naming patterns
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

class TypeShapeAnalyzer {
  constructor() {
    this.typeDefinitions = new Map();
    this.potentialDuplicates = [];
  }

  async analyze() {
    console.log('🔍 Analyzing type shapes across codebase...');
    
    const files = await this.findTypeFiles();
    console.log(`📁 Found ${files.length} files to analyze`);
    
    for (const file of files) {
      await this.analyzeFile(file);
    }
    
    this.findShapeDuplicates();
    return this.generateReport();
  }

  async findTypeFiles() {
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
    return ['node_modules', 'dist', 'build', '.git', '.vscode', 'scripts'].includes(dirName);
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
      
      const types = this.extractTypeDefinitions(content, relativePath);
      for (const type of types) {
        this.typeDefinitions.set(type.name, type);
      }
      
    } catch (error) {
      console.warn(`⚠️  Could not analyze ${filePath}: ${error.message}`);
    }
  }

  extractTypeDefinitions(content, filePath) {
    const types = [];
    
    // Interface definitions
    const interfaceRegex = /export\s+interface\s+(\w+)(?:<[^>]*>)?\s*\{([^}]+)\}/gs;
    let match;
    while ((match = interfaceRegex.exec(content)) !== null) {
      const name = match[1];
      const body = match[2];
      const properties = this.parseInterfaceBody(body);
      
      types.push({
        name,
        type: 'interface',
        file: filePath,
        line: this.getLineNumber(content, match.index),
        properties,
        shape: this.computeShape(properties)
      });
    }
    
    // Type definitions
    const typeRegex = /export\s+type\s+(\w+)(?:<[^>]*>)?\s*=\s*([^;]+);/gs;
    while ((match = typeRegex.exec(content)) !== null) {
      const name = match[1];
      const definition = match[2].trim();
      
      types.push({
        name,
        type: 'type',
        file: filePath,
        line: this.getLineNumber(content, match.index),
        definition,
        shape: this.computeTypeShape(definition)
      });
    }
    
    return types;
  }

  parseInterfaceBody(body) {
    const properties = [];
    const lines = body.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
      
      // Match property definitions
      const propMatch = trimmed.match(/^(\w+)(\?)?\s*:\s*(.+?)(?:;|,)?$/);
      if (propMatch) {
        properties.push({
          name: propMatch[1],
          optional: !!propMatch[2],
          type: propMatch[3].trim()
        });
      }
      
      // Match method definitions
      const methodMatch = trimmed.match(/^(\w+)(\?)?\s*:\s*(\([^)]*\))\s*=>\s*(.+?)(?:;|,)?$/);
      if (methodMatch) {
        properties.push({
          name: methodMatch[1],
          optional: !!methodMatch[2],
          type: 'method',
          signature: methodMatch[3],
          returnType: methodMatch[4].trim()
        });
      }
    }
    
    return properties;
  }

  computeShape(properties) {
    // Create a normalized shape signature
    const shape = {
      propertyCount: properties.length,
      properties: properties.map(p => ({
        name: p.name,
        optional: p.optional,
        type: this.normalizeType(p.type)
      })).sort((a, b) => a.name.localeCompare(b.name))
    };
    
    return shape;
  }

  computeTypeShape(definition) {
    // For type aliases, try to extract structural information
    if (definition.includes('=>')) {
      return { type: 'function', signature: definition };
    } else if (definition.includes('{') && definition.includes('}')) {
      // Object type
      const body = definition.match(/\{([^}]+)\}/)?.[1] || '';
      const properties = this.parseInterfaceBody(body);
      return this.computeShape(properties);
    } else {
      return { type: 'primitive', definition };
    }
  }

  normalizeType(type) {
    // Normalize type names for comparison
    return type
      .replace(/\s+/g, ' ')
      .replace(/Array<([^>]+)>/g, '$1[]')
      .replace(/Promise<([^>]+)>/g, 'Promise<$1>')
      .replace(/\b(\w+)<[^>]*>/g, '$1<T>')
      .trim();
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  findShapeDuplicates() {
    const shapes = new Map();
    
    // Group types by their shape
    for (const [name, type] of this.typeDefinitions) {
      const shapeKey = this.getShapeKey(type.shape);
      if (!shapes.has(shapeKey)) {
        shapes.set(shapeKey, []);
      }
      shapes.get(shapeKey).push(type);
    }
    
    // Find duplicates
    for (const [shapeKey, types] of shapes) {
      if (types.length > 1) {
        this.potentialDuplicates.push({
          shapeKey,
          types,
          confidence: this.calculateShapeConfidence(types)
        });
      }
    }
    
    // Sort by confidence
    this.potentialDuplicates.sort((a, b) => b.confidence - a.confidence);
  }

  getShapeKey(shape) {
    if (shape.type === 'function') {
      return `function:${shape.signature}`;
    } else if (shape.type === 'primitive') {
      return `primitive:${shape.definition}`;
    } else {
      // For interfaces and object types
      const propKeys = shape.properties.map(p => 
        `${p.name}${p.optional ? '?' : ''}:${p.type}`
      ).join('|');
      return `interface:${shape.propertyCount}:${propKeys}`;
    }
  }

  calculateShapeConfidence(types) {
    if (types.length < 2) return 0;
    
    // Check if they're in different files
    const files = new Set(types.map(t => t.file));
    if (files.size === 1) return 0.1; // Same file, probably not duplicate
    
    // Check name similarity
    const names = types.map(t => t.name.toLowerCase());
    const nameSimilarity = this.calculateNameSimilarity(names);
    
    // Check if they have similar purposes (based on file location)
    const purposeSimilarity = this.calculatePurposeSimilarity(types);
    
    return (nameSimilarity + purposeSimilarity) / 2;
  }

  calculateNameSimilarity(names) {
    if (names.length < 2) return 0;
    
    const [first, ...rest] = names;
    let maxSimilarity = 0;
    
    for (const other of rest) {
      const similarity = this.stringSimilarity(first, other);
      maxSimilarity = Math.max(maxSimilarity, similarity);
    }
    
    return maxSimilarity;
  }

  calculatePurposeSimilarity(types) {
    // Group by directory structure
    const dirs = types.map(t => path.dirname(t.file));
    const uniqueDirs = new Set(dirs);
    
    if (uniqueDirs.size === 1) return 0.9; // Same directory
    if (uniqueDirs.size === 2) return 0.5; // Two directories
    return 0.1; // Many directories
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

  generateReport() {
    const report = {
      summary: {
        totalTypes: this.typeDefinitions.size,
        potentialDuplicates: this.potentialDuplicates.length,
        highConfidenceDuplicates: this.potentialDuplicates.filter(d => d.confidence > 0.7).length
      },
      duplicates: this.potentialDuplicates,
      allTypes: Array.from(this.typeDefinitions.values()).sort((a, b) => a.name.localeCompare(b.name))
    };
    
    return report;
  }
}

// Main execution
async function main() {
  const analyzer = new TypeShapeAnalyzer();
  const report = await analyzer.analyze();
  
  // Output results
  console.log('\n📊 Type Shape Analysis Report');
  console.log('=============================');
  console.log(`Total types: ${report.summary.totalTypes}`);
  console.log(`Potential duplicates: ${report.summary.potentialDuplicates}`);
  console.log(`High confidence duplicates: ${report.summary.highConfidenceDuplicates}`);
  
  if (report.duplicates.length > 0) {
    console.log('\n🔍 Potential Shape Duplicates:');
    for (const dup of report.duplicates) {
      if (dup.confidence > 0.3) { // Only show reasonable candidates
        console.log(`\n${dup.shapeKey} (confidence: ${dup.confidence.toFixed(2)})`);
        for (const type of dup.types) {
          console.log(`  - ${type.name} (${type.type}) in ${type.file}:${type.line}`);
        }
      }
    }
  }
  
  // Save detailed report
  const reportsDir = path.join(projectRoot, 'reports');
  await fs.promises.mkdir(reportsDir, { recursive: true });
  
  const reportPath = path.join(reportsDir, 'type-shape-analysis-report.json');
  await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 Detailed report saved to: ${reportPath}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { TypeShapeAnalyzer };
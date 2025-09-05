#!/usr/bin/env ts-node

/**
 * Find candidate sites for domain theory adoption.
 * Scans for while loops that compute closures or fixed points.
 */

import * as fs from 'fs';
import * as path from 'path';

interface Candidate {
  file: string;
  line: number;
  code: string;
  reason: string;
}

function findCandidates(dir: string): Candidate[] {
  const candidates: Candidate[] = [];
  
  function scanFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for while loops with change tracking
      if (line.includes('while') && line.includes('changed')) {
        candidates.push({
          file: filePath,
          line: i + 1,
          code: line.trim(),
          reason: 'while loop with change tracking'
        });
      }
      
      // Look for closure computation patterns
      if (line.includes('closure') || line.includes('Closure')) {
        candidates.push({
          file: filePath,
          line: i + 1,
          code: line.trim(),
          reason: 'closure computation'
        });
      }
      
      // Look for worklist algorithms
      if (line.includes('worklist') || line.includes('workList')) {
        candidates.push({
          file: filePath,
          line: i + 1,
          code: line.trim(),
          reason: 'worklist algorithm'
        });
      }
      
      // Look for set expansion patterns
      if (line.includes('Set') && (line.includes('add') || line.includes('push'))) {
        candidates.push({
          file: filePath,
          line: i + 1,
          code: line.trim(),
          reason: 'set expansion pattern'
        });
      }
    }
  }
  
  function scanDirectory(dirPath: string) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.js'))) {
        scanFile(fullPath);
      }
    }
  }
  
  scanDirectory(dir);
  return candidates;
}

function main() {
  const srcDir = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('src directory not found');
    process.exit(1);
  }
  
  console.log('🔍 Scanning for domain theory adoption candidates...\n');
  
  const candidates = findCandidates(srcDir);
  
  if (candidates.length === 0) {
    console.log('✅ No obvious candidates found. Your codebase might already be using domain theory!');
    return;
  }
  
  console.log(`Found ${candidates.length} potential adoption sites:\n`);
  
  for (const candidate of candidates) {
    console.log(`📁 ${candidate.file}:${candidate.line}`);
    console.log(`   Reason: ${candidate.reason}`);
    console.log(`   Code: ${candidate.code}`);
    console.log('');
  }
  
  console.log('💡 Consider replacing these with:');
  console.log('   import { powersetCPO, lfpOmega } from "../order/Domain";');
  console.log('   const fix = lfpOmega(CPO, f);');
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
#!/usr/bin/env ts-node

/**
 * Examples Runner
 * 
 * This script runs all TypeScript example files in the src/examples directory
 * to ensure they compile and run without errors.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const EXAMPLES_DIR = path.join(__dirname, '..', 'src', 'examples');

function findExampleFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    console.log(`Examples directory not found: ${dir}`);
    return [];
  }

  const files = fs.readdirSync(dir);
  return files
    .filter(file => file.endsWith('.ts') && !file.endsWith('.d.ts'))
    .map(file => path.join(dir, file));
}

function runExample(filePath: string): boolean {
  try {
    console.log(`\n🔄 Running: ${path.basename(filePath)}`);
    execSync(`npx ts-node "${filePath}"`, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log(`✅ Success: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error in ${path.basename(filePath)}:`);
    console.error(error);
    return false;
  }
}

function main() {
  console.log('🚀 Running all examples...\n');
  
  const exampleFiles = findExampleFiles(EXAMPLES_DIR);
  
  if (exampleFiles.length === 0) {
    console.log('No example files found.');
    return;
  }
  
  console.log(`Found ${exampleFiles.length} example file(s):`);
  exampleFiles.forEach(file => {
    console.log(`  - ${path.basename(file)}`);
  });
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const file of exampleFiles) {
    if (runExample(file)) {
      successCount++;
    } else {
      failureCount++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`  ✅ Successful: ${successCount}`);
  console.log(`  ❌ Failed: ${failureCount}`);
  console.log(`  📁 Total: ${exampleFiles.length}`);
  
  if (failureCount > 0) {
    console.log('\n❌ Some examples failed. Please check the errors above.');
    process.exit(1);
  } else {
    console.log('\n🎉 All examples passed successfully!');
  }
}

if (require.main === module) {
  main();
}

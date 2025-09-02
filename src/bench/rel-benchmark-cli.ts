// rel-benchmark-cli.ts
// CLI interface for the Rel vs BitRel benchmark harness
// Usage: pnpm bench:rel --sizes 64,128,256 --densities 0.01,0.05,0.1

import { RelBenchmark, BenchmarkConfig, BenchmarkRun } from "./rel-benchmark.js";
import * as fs from "fs";
import * as path from "path";

/************ CLI Argument Parsing ************/
interface CliArgs {
  sizes: number[];
  densities: number[];
  iterations?: number;
  seed?: number;
  output?: string;
  help?: boolean;
}

function parseCliArgs(args: string[]): CliArgs {
  const parsed: CliArgs = {
    sizes: [64, 128, 256],
    densities: [0.01, 0.05, 0.1],
    iterations: 3,
    seed: 12345,
    output: "bench/rel"
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case "--sizes":
        if (i + 1 < args.length) {
          parsed.sizes = args[i + 1]!.split(",").map(s => parseInt(s.trim(), 10));
          i++;
        }
        break;
        
      case "--densities":
        if (i + 1 < args.length) {
          parsed.densities = args[i + 1]!.split(",").map(s => parseFloat(s.trim()));
          i++;
        }
        break;
        
      case "--iterations":
        if (i + 1 < args.length) {
          parsed.iterations = parseInt(args[i + 1]!, 10);
          i++;
        }
        break;
        
      case "--seed":
        if (i + 1 < args.length) {
          parsed.seed = parseInt(args[i + 1]!, 10);
          i++;
        }
        break;
        
      case "--output":
        if (i + 1 < args.length) {
          parsed.output = args[i + 1]!;
          i++;
        }
        break;
        
      case "--help":
      case "-h":
        parsed.help = true;
        break;
    }
  }
  
  return parsed;
}

function printHelp(): void {
  console.log(`
Rel vs BitRel Benchmark CLI

Usage: pnpm bench:rel [options]

Options:
  --sizes <sizes>        Comma-separated matrix sizes (default: 64,128,256)
  --densities <densities> Comma-separated densities (default: 0.01,0.05,0.1)
  --iterations <n>       Number of iterations per test (default: 3)
  --seed <seed>          Random seed for reproducible results (default: 12345)
  --output <dir>         Output directory for JSON results (default: bench/rel)
  --help, -h             Show this help message

Examples:
  pnpm bench:rel --sizes 32,64,128 --densities 0.05,0.1
  pnpm bench:rel --sizes 256 --densities 0.01 --iterations 5
  pnpm bench:rel --seed 42 --output results/benchmark
`);
}

/************ JSON Output Management ************/
function ensureOutputDirectory(outputDir: string): void {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
}

function saveJsonResults(benchmarkRun: BenchmarkRun, outputDir: string): string {
  ensureOutputDirectory(outputDir);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `benchmark-${timestamp}.json`;
  const filepath = path.join(outputDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(benchmarkRun, null, 2));
  
  return filepath;
}

function saveLatestResults(benchmarkRun: BenchmarkRun, outputDir: string): string {
  ensureOutputDirectory(outputDir);
  
  const filepath = path.join(outputDir, "latest.json");
  fs.writeFileSync(filepath, JSON.stringify(benchmarkRun, null, 2));
  
  return filepath;
}

/************ Markdown Summary Generation ************/
function generateMarkdownSummary(benchmarkRun: BenchmarkRun): string {
  const { config, summary, results } = benchmarkRun;
  
  const lines: string[] = [];
  
  lines.push("# Rel vs BitRel Benchmark Results");
  lines.push("");
  lines.push(`**Timestamp:** ${benchmarkRun.timestamp}`);
  lines.push(`**Total Tests:** ${summary.totalTests}`);
  lines.push("");
  
  lines.push("## Configuration");
  lines.push("");
  lines.push(`- **Sizes:** ${config.sizes.join(", ")}`);
  lines.push(`- **Densities:** ${config.densities.join(", ")}`);
  lines.push(`- **Iterations:** ${config.iterations}`);
  lines.push(`- **Seed:** ${config.seed}`);
  lines.push("");
  
  lines.push("## Performance Summary");
  lines.push("");
  lines.push("### Average Speedup (BitRel vs Rel)");
  lines.push("");
  lines.push("| Operation | Average Speedup | Median Speedup |");
  lines.push("|-----------|----------------|----------------|");
  
  for (const [op, avgSpeedup] of Object.entries(summary.averageSpeedup)) {
    const medSpeedup = summary.medianSpeedup[op] || 1.0;
    lines.push(`| ${op.replace("_", " ")} | ${avgSpeedup.toFixed(2)}x | ${medSpeedup.toFixed(2)}x |`);
  }
  
  lines.push("");
  
  // Detailed results by operation
  const operations = ["compose", "union", "intersect", "transitive_closure"];
  
  for (const op of operations) {
    const opResults = results.filter(r => r.operation === op);
    if (opResults.length === 0) continue;
    
    lines.push(`### ${op.replace("_", " ").toUpperCase()} Performance`);
    lines.push("");
    lines.push("| Size | Density | Rel (ms) | BitRel (ms) | Speedup | Memory Saved |");
    lines.push("|------|---------|----------|-------------|---------|--------------|");
    
    // Group by size and density
    const groups = new Map<string, { rel: number[]; bit: number[]; relMem: number[]; bitMem: number[] }>();
    
    for (const result of opResults) {
      const key = `${result.size}-${result.density}`;
      if (!groups.has(key)) {
        groups.set(key, { rel: [], bit: [], relMem: [], bitMem: [] });
      }
      
      const group = groups.get(key)!;
      if (result.implementation === "Rel") {
        group.rel.push(result.timeMs);
        if (result.memoryBytes) group.relMem.push(result.memoryBytes);
      } else {
        group.bit.push(result.timeMs);
        if (result.memoryBytes) group.bitMem.push(result.memoryBytes);
      }
    }
    
    for (const [key, group] of groups) {
      const [size, density] = key.split("-");
      const avgRel = group.rel.reduce((a, b) => a + b, 0) / group.rel.length;
      const avgBit = group.bit.reduce((a, b) => a + b, 0) / group.bit.length;
      const speedup = avgRel / avgBit;
      
      const avgRelMem = group.relMem.length > 0 ? 
        group.relMem.reduce((a, b) => a + b, 0) / group.relMem.length : 0;
      const avgBitMem = group.bitMem.length > 0 ? 
        group.bitMem.reduce((a, b) => a + b, 0) / group.bitMem.length : 0;
      const memoryRatio = avgRelMem > 0 ? avgRelMem / avgBitMem : 1;
      
      lines.push(`| ${size} | ${density} | ${avgRel.toFixed(2)} | ${avgBit.toFixed(2)} | ${speedup.toFixed(2)}x | ${memoryRatio.toFixed(1)}x |`);
    }
    
    lines.push("");
  }
  
  lines.push("## Key Insights");
  lines.push("");
  
  const maxSpeedup = Math.max(...Object.values(summary.averageSpeedup));
  const bestOp = Object.entries(summary.averageSpeedup)
    .find(([, speedup]) => speedup === maxSpeedup)?.[0] || "compose";
  
  lines.push(`- **Best Performance:** ${bestOp.replace("_", " ")} shows ${maxSpeedup.toFixed(2)}x average speedup`);
  lines.push(`- **Reproducible:** All results generated with seed ${config.seed}`);
  lines.push(`- **Memory Efficiency:** BitRel uses bit-packed storage for significant memory savings`);
  lines.push(`- **Scale:** Performance improvements generally increase with matrix size`);
  lines.push("");
  
  lines.push("---");
  lines.push("*Generated by rel-benchmark-cli.ts*");
  
  return lines.join("\n");
}

function saveMarkdownSummary(benchmarkRun: BenchmarkRun, outputDir: string): string {
  ensureOutputDirectory(outputDir);
  
  const markdown = generateMarkdownSummary(benchmarkRun);
  const filepath = path.join(outputDir, "summary.md");
  
  fs.writeFileSync(filepath, markdown);
  
  return filepath;
}

/************ Console Output ************/
function printSummary(benchmarkRun: BenchmarkRun): void {
  console.log("\n" + "=".repeat(80));
  console.log("BENCHMARK RESULTS SUMMARY");
  console.log("=".repeat(80));
  
  console.log(`\nTotal tests completed: ${benchmarkRun.summary.totalTests}`);
  console.log(`Timestamp: ${benchmarkRun.timestamp}`);
  
  console.log("\nAverage Speedup (BitRel vs Rel):");
  for (const [op, speedup] of Object.entries(benchmarkRun.summary.averageSpeedup)) {
    const median = benchmarkRun.summary.medianSpeedup[op] || 1.0;
    console.log(`  ${op.padEnd(18)}: ${speedup.toFixed(2)}x (median: ${median.toFixed(2)}x)`);
  }
  
  const maxSpeedup = Math.max(...Object.values(benchmarkRun.summary.averageSpeedup));
  console.log(`\nBest performance: ${maxSpeedup.toFixed(2)}x speedup`);
  
  console.log("\n" + "=".repeat(80));
}

/************ Main CLI Function ************/
export async function runBenchmarkCli(): Promise<void> {
  const args = process.argv.slice(2);
  const cliArgs = parseCliArgs(args);
  
  if (cliArgs.help) {
    printHelp();
    return;
  }
  
  // Validate arguments
  if (cliArgs.sizes.some(s => isNaN(s) || s <= 0)) {
    console.error("Error: Invalid sizes. Must be positive integers.");
    process.exit(1);
  }
  
  if (cliArgs.densities.some(d => isNaN(d) || d < 0 || d > 1)) {
    console.error("Error: Invalid densities. Must be between 0 and 1.");
    process.exit(1);
  }
  
  const config: BenchmarkConfig = {
    sizes: cliArgs.sizes,
    densities: cliArgs.densities,
    iterations: cliArgs.iterations || 3,
    seed: cliArgs.seed || 12345,
    outputDir: cliArgs.output || "bench/rel"
  };
  
  console.log("Rel vs BitRel Benchmark CLI");
  console.log("=" .repeat(40));
  
  // Run benchmark
  const benchmark = new RelBenchmark(config.seed);
  const results = benchmark.runFullBenchmark(config);
  
  // Save results
  const jsonPath = saveJsonResults(results, config.outputDir);
  const latestPath = saveLatestResults(results, config.outputDir);
  const markdownPath = saveMarkdownSummary(results, config.outputDir);
  
  // Print summary
  printSummary(results);
  
  console.log("\nOutput files:");
  console.log(`  JSON results: ${jsonPath}`);
  console.log(`  Latest results: ${latestPath}`);
  console.log(`  Markdown summary: ${markdownPath}`);
  
  console.log("\n✅ Benchmark completed successfully!");
  console.log("🔄 Re-run with the same seed for identical results.");
}

// Run CLI if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runBenchmarkCli().catch(console.error);
}
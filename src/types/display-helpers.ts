// display-helpers.ts
// Uniform error/display helpers for consistent output across relations, optics, monads, homology
// Provides formatWitness and printLawCheck utilities with colorization and smart truncation

import { LawCheck } from './witnesses.js';

/************ Configuration ************/

interface DisplayConfig {
  maxWitnessLength: number;
  maxArrayElements: number;
  maxObjectKeys: number;
  colorEnabled: boolean;
  showMoreEnabled: boolean;
}

const defaultConfig: DisplayConfig = {
  maxWitnessLength: 200,
  maxArrayElements: 5,
  maxObjectKeys: 8,
  colorEnabled: true,
  showMoreEnabled: true
};

let globalConfig = { ...defaultConfig };

/** Configure display settings */
export function configureDisplay(config: Partial<DisplayConfig>): void {
  globalConfig = { ...globalConfig, ...config };
}

/************ Colorization (No Heavy Dependencies) ************/

/** ANSI color codes for terminal output */
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

/** Colorize text if colors are enabled */
function colorize(text: string, color: keyof typeof colors): string {
  return globalConfig.colorEnabled ? `${colors[color]}${text}${colors.reset}` : text;
}

/** Status indicators with color */
function statusIcon(ok: boolean): string {
  return ok 
    ? colorize("✅", "green")
    : colorize("❌", "red");
}

function successText(text: string): string {
  return colorize(text, "green");
}

function errorText(text: string): string {
  return colorize(text, "red");
}

function warningText(text: string): string {
  return colorize(text, "yellow");
}

function infoText(text: string): string {
  return colorize(text, "cyan");
}

function dimText(text: string): string {
  return colorize(text, "dim");
}

/************ Smart Truncation ************/

/** Truncate large payloads with show more functionality */
function truncatePayload(value: unknown): { display: string; truncated: boolean; fullValue?: string } {
  const fullString = JSON.stringify(value, null, 2);
  
  if (fullString.length <= globalConfig.maxWitnessLength) {
    return { display: fullString, truncated: false };
  }
  
  const truncated = fullString.substring(0, globalConfig.maxWitnessLength);
  const lastNewline = truncated.lastIndexOf('\n');
  const cleanTruncated = lastNewline > 0 ? truncated.substring(0, lastNewline) : truncated;
  
  return {
    display: cleanTruncated + dimText("\n    ... (truncated)"),
    truncated: true,
    fullValue: fullString
  };
}

/** Truncate arrays to manageable size */
function truncateArray(arr: unknown[]): { display: unknown[]; truncated: boolean } {
  if (arr.length <= globalConfig.maxArrayElements) {
    return { display: arr, truncated: false };
  }
  
  return {
    display: [...arr.slice(0, globalConfig.maxArrayElements), dimText(`... ${arr.length - globalConfig.maxArrayElements} more`)],
    truncated: true
  };
}

/** Truncate object keys to manageable size */
function truncateObject(obj: Record<string, unknown>): { display: Record<string, unknown>; truncated: boolean } {
  const keys = Object.keys(obj);
  
  if (keys.length <= globalConfig.maxObjectKeys) {
    return { display: obj, truncated: false };
  }
  
  const truncatedObj: Record<string, unknown> = {};
  const displayKeys = keys.slice(0, globalConfig.maxObjectKeys);
  
  for (const key of displayKeys) {
    truncatedObj[key] = obj[key];
  }
  
  truncatedObj[dimText(`... ${keys.length - globalConfig.maxObjectKeys} more keys`)] = dimText("...");
  
  return { display: truncatedObj, truncated: true };
}

/************ Core Formatting Functions ************/

/** Format any witness value for display */
export function formatWitness(witness: unknown): string {
  if (witness === null || witness === undefined) {
    return dimText("(no witness)");
  }
  
  if (typeof witness === 'boolean') {
    return witness ? successText("true") : errorText("false");
  }
  
  if (typeof witness === 'string') {
    return `"${witness}"`;
  }
  
  if (typeof witness === 'number') {
    return witness.toString();
  }
  
  if (Array.isArray(witness)) {
    const { display, truncated } = truncateArray(witness);
    const arrayStr = JSON.stringify(display);
    return truncated ? arrayStr + dimText(" (truncated)") : arrayStr;
  }
  
  if (typeof witness === 'object') {
    // Handle specific witness types
    if ('holds' in witness && typeof witness.holds === 'boolean') {
      // InclusionWitness
      if (witness.holds) {
        return successText("Inclusion holds");
      } else {
        const missing = (witness as any).missing || [];
        const { display } = truncateArray(missing);
        return errorText(`Missing ${missing.length} pairs: ${JSON.stringify(display)}`);
      }
    }
    
    if ('equal' in witness && typeof witness.equal === 'boolean') {
      // RelEqWitness
      if (witness.equal) {
        return successText("Relations equal");
      } else {
        const leftOnly = (witness as any).leftOnly?.length || 0;
        const rightOnly = (witness as any).rightOnly?.length || 0;
        return errorText(`Left-only: ${leftOnly}, Right-only: ${rightOnly}`);
      }
    }
    
    if ('ok' in witness && typeof witness.ok === 'boolean') {
      // LawCheck
      return formatLawCheck(witness as LawCheck<any>);
    }
    
    if ('loc' in witness && Array.isArray((witness as any).loc)) {
      // SNF verification witness
      const w = witness as any;
      return errorText(`Matrix diff at [${w.loc[0]}, ${w.loc[1]}]: got ${w.got}, expected ${w.expected}`);
    }
    
    if ('violatingInputs' in witness) {
      // EM-monoid witness
      const w = witness as any;
      const { display } = truncateArray(w.violatingInputs);
      return errorText(`${w.operation} violation with inputs: ${JSON.stringify(display)}`);
    }
    
    if ('input' in witness && 'leftSide' in witness && 'rightSide' in witness) {
      // Monad law witness
      const w = witness as any;
      return errorText(`Input: ${JSON.stringify(w.input)}, Expected: ${JSON.stringify(w.rightSide)}, Got: ${JSON.stringify(w.leftSide)}`);
    }
    
    // Generic object
    const { display, truncated } = truncateObject(witness as Record<string, unknown>);
    const { display: finalDisplay } = truncatePayload(display);
    return truncated ? finalDisplay + dimText(" (keys truncated)") : finalDisplay;
  }
  
  return String(witness);
}

/** Format LawCheck result for display */
function formatLawCheck<T>(check: LawCheck<T>): string {
  if (check.ok) {
    const note = check.note ? ` (${dimText(check.note)})` : "";
    return successText("Law satisfied") + note;
  } else {
    const witnessStr = check.witness ? ` - ${formatWitness(check.witness)}` : "";
    const note = check.note ? ` (${dimText(check.note)})` : "";
    return errorText("Law violated") + witnessStr + note;
  }
}

/************ Main Display Functions ************/

/** Print LawCheck result with consistent formatting */
export function printLawCheck<T>(label: string, check: LawCheck<T>): void {
  const status = statusIcon(check.ok);
  const labelText = colorize(label, "bold");
  
  if (check.ok) {
    const note = check.note ? dimText(` - ${check.note}`) : "";
    console.log(`${status} ${labelText}${note}`);
  } else {
    console.log(`${status} ${labelText}`);
    
    if (check.note) {
      console.log(`    ${dimText("Reason:")} ${check.note}`);
    }
    
    if (check.witness) {
      console.log(`    ${dimText("Witness:")} ${formatWitness(check.witness)}`);
    }
  }
}

/** Print multiple law checks in a group */
export function printLawCheckGroup(groupLabel: string, checks: Record<string, LawCheck<any>>): void {
  console.log(`\n${colorize(groupLabel, "bold")}:`);
  
  for (const [label, check] of Object.entries(checks)) {
    console.log(`  ${statusIcon(check.ok)} ${label}${check.ok ? "" : ":"}`);
    
    if (!check.ok) {
      if (check.note) {
        console.log(`      ${dimText("Reason:")} ${check.note}`);
      }
      if (check.witness) {
        console.log(`      ${dimText("Witness:")} ${formatWitness(check.witness)}`);
      }
    }
  }
}

/** Print summary statistics for multiple law checks */
export function printLawCheckSummary(
  title: string, 
  results: Record<string, LawCheck<any>>
): void {
  const entries = Object.entries(results);
  const passed = entries.filter(([, check]) => check.ok).length;
  const failed = entries.filter(([, check]) => !check.ok).length;
  const total = entries.length;
  
  console.log(`\n${colorize(title, "bold")}:`);
  console.log(`  ${successText(`✅ Passed: ${passed}`)} / ${errorText(`❌ Failed: ${failed}`)} / Total: ${total}`);
  
  if (failed > 0) {
    console.log(`  ${warningText("Failed checks:")} ${entries.filter(([, c]) => !c.ok).map(([name]) => name).join(", ")}`);
  }
  
  const successRate = total > 0 ? (passed / total * 100).toFixed(1) : "0";
  console.log(`  ${infoText(`Success rate: ${successRate}%`)}`);
}

/************ Specialized Formatters ************/

/** Format monad law results */
export function formatMonadLaws(results: {
  leftUnit: LawCheck<any>;
  rightUnit: LawCheck<any>;
  associativity: LawCheck<any>;
}): void {
  printLawCheckGroup("Monad Laws", results);
}

/** Format EM-monoid law results */
export function formatEMMonoidLaws(results: {
  monoidLaws: LawCheck<any>;
  algebraUnit: LawCheck<any>;
  multiplicativity: LawCheck<any>;
  unitMorphism: LawCheck<any>;
}): void {
  printLawCheckGroup("EM-Monoid Laws", results);
}

/** Format optics law results */
export function formatOpticsLaws(results: {
  getSet?: LawCheck<any>;
  setGet?: LawCheck<any>;
  setSet?: LawCheck<any>;
  buildMatch?: LawCheck<any>;
  partialInverse?: LawCheck<any>;
  identity?: LawCheck<any>;
  composition?: LawCheck<any>;
}): void {
  printLawCheckGroup("Optics Laws", results);
}

/** Format relational law results */
export function formatRelationalLaws(results: Record<string, LawCheck<any>[]>): void {
  for (const [category, checks] of Object.entries(results)) {
    const passed = checks.filter(c => c.ok).length;
    const failed = checks.filter(c => !c.ok).length;
    
    console.log(`\n${colorize(category, "bold")}:`);
    console.log(`  ${successText(`✅ ${passed}`)} / ${errorText(`❌ ${failed}`)} (${checks.length} total)`);
    
    if (failed > 0 && checks.length > 0) {
      const firstFailure = checks.find(c => !c.ok);
      if (firstFailure) {
        console.log(`  ${dimText("Sample failure:")} ${formatWitness(firstFailure.witness)}`);
      }
    }
  }
}

/************ Interactive Display Features ************/

/** Show more toggle for development */
let showMoreState = new Map<string, boolean>();

export function toggleShowMore(key: string): void {
  showMoreState.set(key, !showMoreState.get(key));
}

export function shouldShowMore(key: string): boolean {
  return showMoreState.get(key) || false;
}

/** Format with show more toggle */
export function formatWithToggle(
  witness: unknown, 
  key: string,
  shortDescription: string
): string {
  const showFull = shouldShowMore(key);
  
  if (showFull) {
    return formatWitness(witness);
  } else {
    const { display, truncated } = truncatePayload(witness);
    if (truncated && globalConfig.showMoreEnabled) {
      return display + dimText(` [toggle with: toggleShowMore("${key}")]`);
    }
    return display;
  }
}

/************ Domain-Specific Formatters ************/

/** Format benchmark results */
export function formatBenchmarkResults(results: {
  operation: string;
  size: number;
  density: number;
  relTime: number;
  bitTime: number;
  speedup: number;
}[]): void {
  console.log(`\n${colorize("Benchmark Results", "bold")}:`);
  console.log(`  ${dimText("Operation")} | ${dimText("Size")} | ${dimText("Density")} | ${dimText("Rel (ms)")} | ${dimText("BitRel (ms)")} | ${dimText("Speedup")}`);
  console.log(`  ${dimText("----------|------|---------|----------|-------------|--------")}`);
  
  for (const result of results.slice(0, 10)) { // Limit display
    const speedupColor = result.speedup > 2 ? "green" : result.speedup > 1.5 ? "yellow" : "red";
    const speedupText = colorize(`${result.speedup.toFixed(2)}x`, speedupColor);
    
    console.log(`  ${result.operation.padEnd(9)} | ${result.size.toString().padEnd(4)} | ${result.density.toString().padEnd(7)} | ${result.relTime.toFixed(2).padEnd(8)} | ${result.bitTime.toFixed(2).padEnd(11)} | ${speedupText}`);
  }
  
  if (results.length > 10) {
    console.log(`  ${dimText(`... ${results.length - 10} more results`)}`);
  }
}

/** Format homology computation results */
export function formatHomologyResults(results: {
  dimension: number;
  rank: number;
  torsion: number[];
  prettyForm: string;
}[]): void {
  console.log(`\n${colorize("Homology Groups", "bold")}:`);
  
  for (let i = 0; i < results.length; i++) {
    const result = results[i]!;
    const dimensionText = `H${result.dimension}`;
    const groupText = result.prettyForm;
    const torsionInfo = result.torsion.length > 0 ? 
      ` ${dimText(`(torsion: ${result.torsion.join(", ")})`)}` : "";
    
    console.log(`  ${infoText(dimensionText)} ≅ ${successText(groupText)}${torsionInfo}`);
  }
}

/************ Error Aggregation ************/

/** Collect and format multiple errors */
export function formatErrorSummary(
  errors: Array<{ source: string; error: LawCheck<any> }>
): void {
  const errorCount = errors.filter(e => !e.error.ok).length;
  const successCount = errors.filter(e => e.error.ok).length;
  
  console.log(`\n${colorize("Error Summary", "bold")}:`);
  console.log(`  ${successText(`✅ Successes: ${successCount}`)} | ${errorText(`❌ Errors: ${errorCount}`)}`);
  
  if (errorCount > 0) {
    console.log(`\n  ${errorText("Error Details:")}:`);
    
    const errorEntries = errors.filter(e => !e.error.ok).slice(0, 5); // Show first 5
    for (const entry of errorEntries) {
      const witness = !entry.error.ok ? entry.error.witness : undefined;
      console.log(`    ${entry.source}: ${formatWitness(witness)}`);
    }
    
    if (errorCount > 5) {
      console.log(`    ${dimText(`... ${errorCount - 5} more errors`)}`);
    }
  }
}

/************ Development Helpers ************/

/** Pretty print for development debugging */
export function devPrint(label: string, value: unknown): void {
  console.log(`\n${colorize(`[DEV] ${label}`, "magenta")}:`);
  
  const formatted = formatWitness(value);
  console.log(`  ${formatted}`);
}

/** Timing display helper */
export function formatTiming(label: string, timeMs: number): string {
  const timeColor = timeMs < 1 ? "green" : timeMs < 10 ? "yellow" : "red";
  return `${label}: ${colorize(`${timeMs.toFixed(2)}ms`, timeColor)}`;
}

/** Progress indicator */
export function printProgress(current: number, total: number, label: string = "Progress"): void {
  const percentage = Math.round((current / total) * 100);
  const barLength = 20;
  const filled = Math.round((percentage / 100) * barLength);
  const bar = "█".repeat(filled) + "░".repeat(barLength - filled);
  
  const progressText = `${label}: [${colorize(bar, "cyan")}] ${percentage}% (${current}/${total})`;
  process.stdout.write(`\r${progressText}`);
  
  if (current === total) {
    console.log(); // New line when complete
  }
}

/************ Utility Functions ************/

/** Check if running in CI environment */
export function isCI(): boolean {
  return !!(process.env.CI || process.env.GITHUB_ACTIONS || process.env.GITLAB_CI);
}

/** Auto-configure for environment */
export function autoConfigureDisplay(): void {
  if (isCI()) {
    configureDisplay({
      colorEnabled: false,
      showMoreEnabled: false,
      maxWitnessLength: 100
    });
  }
}

/** Reset display configuration to defaults */
export function resetDisplayConfig(): void {
  globalConfig = { ...defaultConfig };
  showMoreState.clear();
}

/************ Convenience Re-exports ************/

export {
  colorize,
  statusIcon,
  successText,
  errorText,
  warningText,
  infoText,
  dimText
};

/************ Demo Function ************/

export function demonstrateDisplayHelpers(): void {
  console.log("=".repeat(80));
  console.log(colorize("UNIFORM DISPLAY HELPERS DEMONSTRATION", "bold"));
  console.log("=".repeat(80));
  
  console.log("\n1. COLORIZED STATUS INDICATORS");
  console.log(`  Success: ${statusIcon(true)} ${successText("Operation completed")}`);
  console.log(`  Failure: ${statusIcon(false)} ${errorText("Operation failed")}`);
  console.log(`  Warning: ${warningText("⚠️ Potential issue detected")}`);
  console.log(`  Info: ${infoText("ℹ️ Additional information")}`);
  
  console.log("\n2. WITNESS FORMATTING");
  
  const witnesses = [
    { name: "Simple string", value: "test message" },
    { name: "Number", value: 42 },
    { name: "Boolean", value: true },
    { name: "Array", value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, // Will be truncated
    { name: "Complex object", value: { 
      operation: "test", 
      inputs: [1, 2, 3], 
      metadata: { timestamp: Date.now() },
      largeArray: Array.from({length: 20}, (_, i) => i)
    }}
  ];
  
  for (const witness of witnesses) {
    console.log(`\n  ${witness.name}:`);
    console.log(`    ${formatWitness(witness.value)}`);
  }
  
  console.log("\n3. LAW CHECK FORMATTING");
  
  const lawChecks = [
    { label: "Successful law", check: { ok: true, note: "All conditions satisfied" } },
    { label: "Failed law", check: { 
      ok: false, 
      witness: { violatingInputs: ["a", "b"], operation: "associativity" },
      note: "Associativity violation detected"
    }},
    { label: "Complex failure", check: {
      ok: false,
      witness: { 
        input: 42, 
        leftSide: { tag: "some", value: 43 }, 
        rightSide: { tag: "some", value: 42 }
      },
      note: "Monad left unit law violated"
    }}
  ];
  
  for (const { label, check } of lawChecks) {
    printLawCheck(label, check as LawCheck<any>);
  }
  
  console.log("\n4. GROUPED RESULTS");
  
  const groupedResults = {
    "Left Unit": { ok: true, note: "Verified" },
    "Right Unit": { ok: true, note: "Verified" },
    "Associativity": { 
      ok: false, 
      witness: { inputs: [1, 2, 3], operation: "compose" },
      note: "Failed with specific inputs"
    }
  };
  
  printLawCheckGroup("Monad Laws", groupedResults);
  
  console.log("\n5. SUMMARY STATISTICS");
  
  printLawCheckSummary("Overall Results", groupedResults);
  
  console.log("\n" + "=".repeat(80));
  console.log(colorize("DISPLAY HELPERS FEATURES:", "bold"));
  console.log(`✓ ${successText("Consistent formatting")} across all law checks`);
  console.log(`✓ ${infoText("Smart colorization")} for status indication`);
  console.log(`✓ ${warningText("Payload truncation")} with show more toggle`);
  console.log(`✓ ${dimText("Specialized formatters")} for different witness types`);
  console.log(`✓ ${successText("Scan-friendly output")} with clear hierarchy`);
  console.log("=".repeat(80));
}
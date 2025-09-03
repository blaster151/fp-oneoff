// property-shrinking.ts
// Light property-based generator for shrinking failing witnesses to minimal counterexamples
// Provides minimizeWitness(seedWitness, predicate) with simple reduction strategies

/************ Core Shrinking Interface ************/

/** Predicate function that returns true if the witness still demonstrates the failure */
export type WitnessPredicate<T> = (witness: T) => boolean;

/** Shrinking strategy that generates smaller variants of a witness */
export type ShrinkStrategy<T> = (witness: T) => T[];

/** Result of witness minimization */
export interface ShrinkResult<T> {
  minimal: T;
  shrinkSteps: number;
  originalSize: number;
  minimalSize: number;
}

/************ Generic Shrinking Engine ************/

/** 
 * Minimize a witness to the smallest counterexample that still satisfies the predicate
 * @param seedWitness - Initial failing witness
 * @param predicate - Function that returns true if witness still demonstrates failure
 * @param strategies - Array of shrinking strategies to try
 * @param maxSteps - Maximum shrinking iterations
 */
export function minimizeWitness<T>(
  seedWitness: T,
  predicate: WitnessPredicate<T>,
  strategies: ShrinkStrategy<T>[],
  maxSteps: number = 100
): ShrinkResult<T> {
  let current = seedWitness;
  let steps = 0;
  const originalSize = estimateSize(seedWitness);
  
  while (steps < maxSteps) {
    let foundSmaller = false;
    
    // Try each strategy
    for (const strategy of strategies) {
      const candidates = strategy(current);
      
      // Find the smallest candidate that still satisfies the predicate
      for (const candidate of candidates) {
        if (predicate(candidate) && estimateSize(candidate) < estimateSize(current)) {
          current = candidate;
          foundSmaller = true;
          break;
        }
      }
      
      if (foundSmaller) break;
    }
    
    if (!foundSmaller) break;
    steps++;
  }
  
  return {
    minimal: current,
    shrinkSteps: steps,
    originalSize,
    minimalSize: estimateSize(current)
  };
}

/************ Size Estimation ************/

/** Estimate the "size" of a witness for shrinking purposes */
export function estimateSize(witness: any): number {
  if (witness == null) return 0;
  if (typeof witness === 'number') return Math.abs(witness);
  if (typeof witness === 'string') return witness.length;
  if (typeof witness === 'boolean') return witness ? 1 : 0;
  if (Array.isArray(witness)) return witness.length + witness.reduce((sum, item) => sum + estimateSize(item), 0);
  if (typeof witness === 'object') {
    return Object.keys(witness).length + 
           Object.values(witness).reduce((sum: number, value) => sum + estimateSize(value), 0);
  }
  return 1;
}

/************ Common Shrinking Strategies ************/

/** Shrink arrays by removing elements */
export function shrinkArray<T>(arr: T[]): T[][] {
  if (arr.length === 0) return [];
  
  const shrunk: T[][] = [];
  
  // Remove one element at a time
  for (let i = 0; i < arr.length; i++) {
    shrunk.push([...arr.slice(0, i), ...arr.slice(i + 1)]);
  }
  
  // Take prefixes (useful for ordered data)
  for (let len = Math.floor(arr.length / 2); len > 0; len--) {
    shrunk.push(arr.slice(0, len));
  }
  
  return shrunk;
}

/** Shrink numbers towards zero */
export function shrinkNumber(n: number): number[] {
  if (n === 0) return [];
  
  const shrunk: number[] = [];
  
  // Towards zero
  if (n > 0) {
    shrunk.push(0);
    if (n > 1) shrunk.push(1);
    if (n > 2) shrunk.push(Math.floor(n / 2));
  } else {
    shrunk.push(0);
    if (n < -1) shrunk.push(-1);
    if (n < -2) shrunk.push(Math.ceil(n / 2));
  }
  
  return shrunk;
}

/** Shrink strings by removing characters */
export function shrinkString(s: string): string[] {
  if (s.length === 0) return [];
  
  const shrunk: string[] = [];
  
  // Remove one character at a time
  for (let i = 0; i < s.length; i++) {
    shrunk.push(s.slice(0, i) + s.slice(i + 1));
  }
  
  // Take prefixes
  for (let len = Math.floor(s.length / 2); len > 0; len--) {
    shrunk.push(s.slice(0, len));
  }
  
  return shrunk;
}

/** Shrink objects by removing properties or shrinking values */
export function shrinkObject<T extends Record<string, any>>(obj: T): Partial<T>[] {
  const shrunk: Partial<T>[] = [];
  const keys = Object.keys(obj);
  
  if (keys.length === 0) return [];
  
  // Remove one property at a time
  for (const keyToRemove of keys) {
    const smaller: Partial<T> = {};
    for (const key of keys) {
      if (key !== keyToRemove) {
        smaller[key as keyof T] = obj[key];
      }
    }
    shrunk.push(smaller);
  }
  
  // Shrink individual property values
  for (const key of keys) {
    const value = obj[key];
    const shrunkValues = shrinkValue(value);
    
    for (const shrunkValue of shrunkValues) {
      shrunk.push({ ...obj, [key]: shrunkValue });
    }
  }
  
  return shrunk;
}

/** Generic value shrinking dispatcher */
export function shrinkValue(value: any): any[] {
  if (value == null) return [];
  if (typeof value === 'number') return shrinkNumber(value);
  if (typeof value === 'string') return shrinkString(value);
  if (Array.isArray(value)) return shrinkArray(value);
  if (typeof value === 'object') return shrinkObject(value);
  return [];
}

/************ Domain-Specific Shrinking Strategies ************/

/** Shrink monad law witnesses */
export function shrinkMonadWitness<T>(witness: {
  input?: any;
  k?: any;
  h?: any;
  m?: T;
  leftSide?: T;
  rightSide?: T;
}): Array<typeof witness> {
  const shrunk: Array<typeof witness> = [];
  
  // Shrink input values
  if (witness.input !== undefined) {
    const shrunkInputs = shrinkValue(witness.input);
    for (const input of shrunkInputs) {
      shrunk.push({ ...witness, input });
    }
  }
  
  // For complex witnesses, try removing optional fields
  const optionalFields = ['k', 'h'] as const;
  for (const field of optionalFields) {
    if (witness[field] !== undefined) {
      const reduced = { ...witness };
      delete reduced[field];
      shrunk.push(reduced);
    }
  }
  
  return shrunk;
}

/** Shrink lens law witnesses */
export function shrinkLensWitness<S, A>(witness: {
  s?: S;
  a?: A;
  got?: A;
  after?: S;
}): Array<typeof witness> {
  const shrunk: Array<typeof witness> = [];
  
  // Shrink the subject
  if (witness.s !== undefined) {
    const shrunkSubjects = shrinkValue(witness.s);
    for (const s of shrunkSubjects) {
      shrunk.push({ ...witness, s });
    }
  }
  
  // Shrink the focus value
  if (witness.a !== undefined) {
    const shrunkValues = shrinkValue(witness.a);
    for (const a of shrunkValues) {
      shrunk.push({ ...witness, a });
    }
  }
  
  return shrunk;
}

/** Shrink relational witnesses */
export function shrinkRelationalWitness(witness: {
  R?: any;
  S?: any;
  T?: any;
  violatingPair?: readonly [any, any];
  P?: any;
  Q?: any;
}): Array<typeof witness> {
  const shrunk: Array<typeof witness> = [];
  
  // Shrink relation representations (if they're arrays of pairs)
  if (witness.R && Array.isArray(witness.R)) {
    const shrunkR = shrinkArray(witness.R);
    for (const R of shrunkR) {
      shrunk.push({ ...witness, R });
    }
  }
  
  if (witness.S && Array.isArray(witness.S)) {
    const shrunkS = shrinkArray(witness.S);
    for (const S of shrunkS) {
      shrunk.push({ ...witness, S });
    }
  }
  
  // Shrink violating pair
  if (witness.violatingPair) {
    const [a, b] = witness.violatingPair;
    const shrunkA = shrinkValue(a);
    const shrunkB = shrinkValue(b);
    
    for (const newA of shrunkA) {
      shrunk.push({ ...witness, violatingPair: [newA, b] as const });
    }
    
    for (const newB of shrunkB) {
      shrunk.push({ ...witness, violatingPair: [a, newB] as const });
    }
  }
  
  return shrunk;
}

/************ Witness-Specific Shrinking Functions ************/

/** Shrink monad left unit witness */
export function shrinkMonadLeftUnitWitness<T>(
  witness: { input: any; k: any; leftSide: T; rightSide: T },
  predicate: WitnessPredicate<typeof witness>
): ShrinkResult<typeof witness> {
  const strategies: ShrinkStrategy<typeof witness>[] = [
    (w) => shrinkValue(w.input).map(input => ({ ...w, input }))
  ];
  
  return minimizeWitness(witness, predicate, strategies);
}

/** Shrink lens counterexample */
export function shrinkLensCounterexample<S, A>(
  witness: { s: S; a?: A; got?: A; after?: S },
  predicate: WitnessPredicate<typeof witness>
): ShrinkResult<typeof witness> {
  const strategies: ShrinkStrategy<typeof witness>[] = [
    (w) => shrinkValue(w.s).map(s => ({ ...w, s }))
  ];
  
  return minimizeWitness(witness, predicate, strategies);
}

/** Shrink relational adjunction witness */
export function shrinkAdjunctionWitness(
  witness: { R: any; X: any; S: any; violatingPair?: readonly [any, any] },
  predicate: WitnessPredicate<typeof witness>
): ShrinkResult<typeof witness> {
  const strategies: ShrinkStrategy<typeof witness>[] = [
    // Custom strategy for this specific witness type
    (w) => {
      const shrunk: typeof w[] = [];
      if (w.R && Array.isArray(w.R)) {
        shrunk.push({ ...w, R: w.R.slice(0, Math.max(1, w.R.length - 1)) });
      }
      return shrunk;
    }
  ];
  
  return minimizeWitness(witness, predicate, strategies);
}

/************ Integration Helpers ************/

/** Create a shrinking predicate for law checking */
export function createLawCheckPredicate<T>(
  originalCheck: (witness: T) => boolean
): WitnessPredicate<T> {
  return (witness: T) => {
    try {
      return originalCheck(witness);
    } catch {
      return false; // If shrunk witness causes errors, it's not a valid counterexample
    }
  };
}

/** Apply shrinking to any witness with a validation function */
export function applyShrinking<T>(
  witness: T,
  validator: (w: T) => boolean,
  customStrategies: ShrinkStrategy<T>[] = []
): T {
  const defaultStrategies: ShrinkStrategy<T>[] = [
    (w) => shrinkValue(w) as T[]
  ];
  
  const allStrategies = [...customStrategies, ...defaultStrategies];
  const result = minimizeWitness(witness, validator, allStrategies);
  
  return result.minimal;
}

/************ Demonstration Utilities ************/

/** Show shrinking process for educational purposes */
export function demonstrateShrinking<T>(
  witness: T,
  predicate: WitnessPredicate<T>,
  strategies: ShrinkStrategy<T>[]
): void {
  console.log("🔍 SHRINKING DEMONSTRATION:");
  console.log("Original witness size:", estimateSize(witness));
  console.log("Original witness:", JSON.stringify(witness));
  
  const result = minimizeWitness(witness, predicate, strategies);
  
  console.log("\nShrinking results:");
  console.log("  Steps taken:", result.shrinkSteps);
  console.log("  Size reduction:", `${result.originalSize} → ${result.minimalSize}`);
  console.log("  Minimal witness:", JSON.stringify(result.minimal));
  
  const reduction = ((result.originalSize - result.minimalSize) / result.originalSize * 100);
  console.log(`  Reduction: ${reduction.toFixed(1)}%`);
}

/************ Example Shrinking Scenarios ************/

/** Example: Shrink a large array to minimal failing case */
export function exampleArrayShrinking(): void {
  console.log("\n📚 EXAMPLE: Array Shrinking");
  
  // Large array that fails some property
  const largeArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  // Property: "contains an even number greater than 6"
  const predicate = (arr: number[]) => arr.some(n => n > 6 && n % 2 === 0);
  
  const strategies: ShrinkStrategy<number[]>[] = [
    shrinkArray,
    (arr) => arr.map(n => shrinkNumber(n)).flat().map(n => [n])
  ];
  
  console.log("Original array:", largeArray);
  console.log("Predicate: contains even number > 6");
  
  const result = minimizeWitness(largeArray, predicate, strategies);
  
  console.log("Minimal counterexample:", result.minimal);
  console.log("Shrinking steps:", result.shrinkSteps);
  console.log("Size reduction:", `${result.originalSize} → ${result.minimalSize}`);
}

/** Example: Shrink a complex object to minimal failing case */
export function exampleObjectShrinking(): void {
  console.log("\n📚 EXAMPLE: Object Shrinking");
  
  // Complex object that fails some property
  const complexObject = {
    name: "very-long-name-that-is-complex",
    values: [1, 2, 3, 4, 5],
    nested: {
      x: 100,
      y: 200,
      z: 300
    },
    flags: [true, false, true, false]
  };
  
  // Property: "has values array with sum > 10"
  const predicate = (obj: typeof complexObject) => {
    return obj.values && obj.values.reduce((sum, n) => sum + n, 0) > 10;
  };
  
  const strategies: ShrinkStrategy<typeof complexObject>[] = [
    // Custom shrinking strategy that maintains required properties
    (obj) => {
      const shrunk: typeof obj[] = [];
      
      // Shrink the values array while keeping required structure
      if (obj.values && obj.values.length > 1) {
        const smallerArrays = shrinkArray(obj.values);
        for (const smallerArray of smallerArrays) {
          if (smallerArray.length > 0) {
            shrunk.push({ ...obj, values: smallerArray });
          }
        }
      }
      
      // Simplify nested object while keeping required properties  
      if (obj.nested) {
        shrunk.push({
          ...obj,
          nested: { x: obj.nested.x, y: 0, z: 0 } // Simplify but keep structure
        });
      }
      
      // Simplify name
      if (obj.name.length > 5) {
        shrunk.push({ ...obj, name: "obj" });
      }
      
      return shrunk;
    }
  ];
  
  console.log("Original object keys:", Object.keys(complexObject));
  console.log("Original values sum:", complexObject.values.reduce((a, b) => a + b, 0));
  
  const result = minimizeWitness(complexObject, predicate, strategies);
  
  console.log("Minimal counterexample:", JSON.stringify(result.minimal));
  console.log("Shrinking steps:", result.shrinkSteps);
  console.log("Size reduction:", `${result.originalSize} → ${result.minimalSize}`);
}

/************ Integration with Existing Witness Types ************/

/** Shrink monad law witnesses specifically */
export function shrinkMonadLeftUnitWitnessSpecific<T>(
  witness: { input: any; k: (a: any) => T; leftSide: T; rightSide: T },
  monadChain: (ta: T, k: (a: any) => T) => T,
  monadOf: (a: any) => T,
  eqT: (a: T, b: T) => boolean
): typeof witness {
  const predicate = (w: typeof witness) => {
    try {
      const leftResult = monadChain(monadOf(w.input), w.k);
      const rightResult = w.k(w.input);
      return !eqT(leftResult, rightResult);
    } catch {
      return false;
    }
  };
  
  const strategies: ShrinkStrategy<typeof witness>[] = [
    (w) => shrinkValue(w.input).map(input => ({ ...w, input }))
  ];
  
  const result = minimizeWitness(witness, predicate, strategies);
  return result.minimal;
}

/** Shrink lens law witnesses specifically */
export function shrinkLensGetSetWitnessSpecific<S, A>(
  witness: { s: S; got: A; after: S },
  lens: { get: (s: S) => A; set: (s: S, a: A) => S },
  eqS: (a: S, b: S) => boolean
): typeof witness {
  const predicate = (w: typeof witness) => {
    try {
      const originalValue = lens.get(w.s);
      const afterSet = lens.set(w.s, originalValue);
      return !eqS(afterSet, w.s);
    } catch {
      return false;
    }
  };
  
  const strategies: ShrinkStrategy<typeof witness>[] = [
    (w) => shrinkValue(w.s).map(s => ({ ...w, s }))
  ];
  
  const result = minimizeWitness(witness, predicate, strategies);
  return result.minimal;
}
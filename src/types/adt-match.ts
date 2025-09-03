/** @math DEF-PATTERN-MATCH */

export function match<T extends { _t: string }, R>(
  x: T,
  cases: Record<T["_t"], (x: T) => R>
): R {
  const k = (x as any)._t;
  const h = (cases as any)[k];
  if (!h) throw new Error(`Non-exhaustive match: missing case "${k}"`);
  return h(x);
}

/**
 * Partial matching with default case
 */
export function matchPartial<T extends { _t: string }, R>(
  x: T,
  cases: Partial<Record<T["_t"], (x: T) => R>>,
  defaultCase: (x: T) => R
): R {
  const k = (x as any)._t;
  const h = (cases as any)[k];
  return h ? h(x) : defaultCase(x);
}

/**
 * Match with type guards for better type safety
 */
export function matchWith<T extends { _t: string }, R>(
  x: T,
  matchers: Array<{
    guard: (x: T) => boolean;
    handler: (x: T) => R;
  }>,
  fallback?: (x: T) => R
): R {
  for (const { guard, handler } of matchers) {
    if (guard(x)) {
      return handler(x);
    }
  }
  
  if (fallback) {
    return fallback(x);
  }
  
  throw new Error(`Non-exhaustive match: no handler for tag "${(x as any)._t}"`);
}

/**
 * Create a type guard for a specific tag
 */
export function tagGuard<T extends { _t: string }, K extends T["_t"]>(
  tag: K
): (x: T) => x is Extract<T, { _t: K }> {
  return (x: T): x is Extract<T, { _t: K }> => (x as any)._t === tag;
}

/**
 * Exhaustiveness checking helper
 */
export function exhaustive(_x: never): never {
  throw new Error("Exhaustive match failed - this should never be reached");
}

/**
 * Demonstrate pattern matching system
 */
export function demonstratePatternMatching() {
  console.log("🔧 EXHAUSTIVE PATTERN MATCHING FOR ADTs");
  console.log("=" .repeat(50));
  
  console.log("\\nPattern Matching:");
  console.log("  • match(): Exhaustive matching by _t tag");
  console.log("  • matchPartial(): Partial matching with default");
  console.log("  • matchWith(): Matching with custom guards");
  console.log("  • Compile-time exhaustiveness checking");
  
  console.log("\\nType Safety:");
  console.log("  • tagGuard(): Create type guards for specific tags");
  console.log("  • exhaustive(): Compile-time exhaustiveness verification");
  console.log("  • Type narrowing: Automatic type refinement");
  
  console.log("\\nAdvantages:");
  console.log("  • Exhaustive: Compiler ensures all cases handled");
  console.log("  • Type safe: Automatic type narrowing");
  console.log("  • Extensible: Easy to add new cases");
  console.log("  • Readable: Clear case-by-case logic");
  
  console.log("\\nApplications:");
  console.log("  • ADT processing: List, Tree, Option, Either");
  console.log("  • State machines: Exhaustive state handling");
  console.log("  • Error handling: Comprehensive error case coverage");
  
  console.log("\\n🎯 Type-safe pattern matching for algebraic data types!");
}
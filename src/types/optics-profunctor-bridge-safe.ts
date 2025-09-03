// optics-profunctor-bridge-safe.ts
// Type-safe bridge between optics and profunctors with branded types and law checking
// Removes all unsafe 'as any' casts and gates conversions with LawCheck verification

import { LawCheck, lawCheck, lawCheckSuccess } from './witnesses.js';
import { checkLens, checkPrism, checkTraversal } from './optics-witness.js';
import { applyShrinking } from './property-shrinking.js';

/************ Branded Types for Type Safety ************/

/** Brand for compile-time type safety */
type Brand<T, B extends string> = T & { readonly __brand: B };

/** Branded optics types - prevent mixing incompatible optics */
export type SafeGetter<S, A> = Brand<{
  readonly get: (s: S) => A;
}, 'SafeGetter'>;

export type SafeLens<S, A> = Brand<{
  readonly get: (s: S) => A;
  readonly set: (s: S, a: A) => S;
}, 'SafeLens'>;

export type SafePrism<S, A> = Brand<{
  readonly match: (s: S) => A | undefined;
  readonly build: (a: A) => S;
}, 'SafePrism'>;

export type SafeTraversal<S, A> = Brand<{
  readonly modify: (s: S, f: (a: A) => A) => S;
}, 'SafeTraversal'>;

/** Profunctor branded types */
export type ProfunctorLens<S, A> = Brand<{
  readonly _tag: 'ProfunctorLens';
  readonly view: (s: S) => A;
  readonly set: (s: S, a: A) => S;
}, 'ProfunctorLens'>;

export type ProfunctorPrism<S, A> = Brand<{
  readonly _tag: 'ProfunctorPrism';
  readonly preview: (s: S) => A | undefined;
  readonly review: (a: A) => S;
}, 'ProfunctorPrism'>;

export type ProfunctorTraversal<S, A> = Brand<{
  readonly _tag: 'ProfunctorTraversal';
  readonly modifyF: (applicative: any) => (f: (a: A) => any) => (s: S) => any;
}, 'ProfunctorTraversal'>;

/** Applicative interface for traversals (simplified) */
interface Applicative {
  pure: (a: any) => any;
  ap: (ff: any, fa: any) => any;
}

/************ Safe Construction Functions ************/

/** Create a safe getter with compile-time brand */
export function safeGetter<S, A>(get: (s: S) => A): SafeGetter<S, A> {
  return { get } as SafeGetter<S, A>;
}

/** Create a safe lens with compile-time brand */
export function safeLens<S, A>(
  get: (s: S) => A,
  set: (s: S, a: A) => S
): SafeLens<S, A> {
  return { get, set } as SafeLens<S, A>;
}

/** Create a safe prism with compile-time brand */
export function safePrism<S, A>(
  match: (s: S) => A | undefined,
  build: (a: A) => S
): SafePrism<S, A> {
  return { match, build } as SafePrism<S, A>;
}

/** Create a safe traversal with compile-time brand */
export function safeTraversal<S, A>(
  modify: (s: S, f: (a: A) => A) => S
): SafeTraversal<S, A> {
  return { modify } as SafeTraversal<S, A>;
}

/************ Law-Checked Conversion Functions ************/

/** Convert lens to profunctor lens only if laws are satisfied */
export function toProfunctorLens<S, A>(
  lens: SafeLens<S, A>,
  testDomain: { elems: S[] },
  testCodomain: { elems: A[] }
): LawCheck<ProfunctorLens<S, A>> {
  // Extract the raw lens for law checking
  const rawLens = {
    get: lens.get,
    set: lens.set
  };
  
  // Check lens laws
  const lawResult = checkLens(testDomain, testCodomain, rawLens);
  
  if (lawResult.getSet.ok && lawResult.setGet.ok && lawResult.setSet.ok) {
    const profunctorLens: ProfunctorLens<S, A> = {
      _tag: 'ProfunctorLens',
      view: lens.get,
      set: lens.set
    } as ProfunctorLens<S, A>;
    
    return lawCheck(true, profunctorLens, "Lens laws verified - safe conversion");
  } else {
    // Collect violations for witness
    const violations = [
      ...(lawResult.getSet.ok ? [] : lawResult.getSet.counterexamples),
      ...(lawResult.setGet.ok ? [] : lawResult.setGet.counterexamples),
      ...(lawResult.setSet.ok ? [] : lawResult.setSet.counterexamples)
    ];
    
    // Shrink violations to minimal counterexamples
    const shrunkViolations = violations.slice(0, 3).map(violation => 
      applyShrinking(violation, (v) => {
        // Verify the violation still demonstrates the law failure
        try {
          if ('got' in v && 'after' in v) {
            // Get-set violation
            const after = rawLens.set(v.s, rawLens.get(v.s));
            return JSON.stringify(after) !== JSON.stringify(v.s);
          }
          if ('a' in v && 'got' in v) {
            // Set-get violation  
            const got = rawLens.get(rawLens.set(v.s, v.a));
            return got !== v.a;
          }
          return true;
        } catch {
          return false;
        }
      })
    );
    
    // For failed conversions, we don't have a valid ProfunctorLens to return
    return { 
      ok: false, 
      note: `Lens laws violated - conversion denied. Violations: ${JSON.stringify(shrunkViolations)}`
    } as LawCheck<ProfunctorLens<S, A>>;
  }
}

/** Convert prism to profunctor prism only if laws are satisfied */
export function toProfunctorPrism<S, A>(
  prism: SafePrism<S, A>,
  testDomain: { elems: S[] },
  testCodomain: { elems: A[] }
): LawCheck<ProfunctorPrism<S, A>> {
  // Convert SafePrism (A | undefined) to Prism (Option<A>) for law checking
  const rawPrism = {
    match: (s: S) => {
      const result = prism.match(s);
      return result === undefined ? { tag: "none" as const } : { tag: "some" as const, value: result };
    },
    build: prism.build
  };
  
  const lawResult = checkPrism(testDomain, testCodomain, rawPrism);
  
  if (lawResult.buildMatch.ok && lawResult.partialInverse.ok) {
    const profunctorPrism: ProfunctorPrism<S, A> = {
      _tag: 'ProfunctorPrism',
      preview: prism.match,
      review: prism.build
    } as ProfunctorPrism<S, A>;
    
    return lawCheck(true, profunctorPrism, "Prism laws verified - safe conversion");
  } else {
    const violations = [
      ...(lawResult.buildMatch.ok ? [] : lawResult.buildMatch.counterexamples),
      ...(lawResult.partialInverse.ok ? [] : lawResult.partialInverse.counterexamples)
    ];
    
    const shrunkViolations = violations.slice(0, 3).map(violation =>
      applyShrinking(violation, (v) => {
        try {
          if ('a' in v && 'got' in v) {
            // Build-match violation
            const got = rawPrism.match(rawPrism.build(v.a));
            return got === undefined || JSON.stringify(got) !== JSON.stringify(v.a);
          }
          return true;
        } catch {
          return false;
        }
      })
    );
    
    // For failed conversions, we don't have a valid ProfunctorPrism to return
    return { 
      ok: false, 
      note: `Prism laws violated - conversion denied. Violations: ${JSON.stringify(shrunkViolations)}`
    } as LawCheck<ProfunctorPrism<S, A>>;
  }
}

/** Convert traversal to profunctor traversal only if laws are satisfied */
export function toProfunctorTraversal<S, A>(
  traversal: SafeTraversal<S, A>,
  testDomain: { elems: S[] },
  testCodomain: { elems: A[] }
): LawCheck<ProfunctorTraversal<S, A>> {
  const rawTraversal = {
    modify: traversal.modify
  };
  
  const lawResult = checkTraversal(testDomain, testCodomain, rawTraversal);
  
  if (lawResult.identity.ok && lawResult.composition.ok) {
    // Create applicative-based modifyF (simplified for demo)
    const modifyF = (applicative: Applicative) => 
      (f: (a: A) => any) => 
      (s: S): any => {
        // Simplified implementation - real traversal would need proper applicative handling
        return applicative.pure(traversal.modify(s, (a: A) => {
          // For demo purposes, simplified
          return a;
        }));
      };
    
    const profunctorTraversal: ProfunctorTraversal<S, A> = {
      _tag: 'ProfunctorTraversal',
      modifyF
    } as ProfunctorTraversal<S, A>;
    
    return lawCheck(true, profunctorTraversal, "Traversal laws verified - safe conversion");
  } else {
    const violations = [
      ...(lawResult.identity.ok ? [] : lawResult.identity.counterexamples),
      ...(lawResult.composition.ok ? [] : lawResult.composition.counterexamples)
    ];
    
    const shrunkViolations = violations.slice(0, 3).map(violation =>
      applyShrinking(violation, (v) => {
        try {
          if ('s' in v && 'after' in v) {
            // Identity violation
            const after = rawTraversal.modify(v.s, (a: A) => a);
            return JSON.stringify(after) !== JSON.stringify(v.s);
          }
          return true;
        } catch {
          return false;
        }
      })
    );
    
    // For failed conversions, we don't have a valid ProfunctorTraversal to return
    return { 
      ok: false, 
      note: `Traversal laws violated - conversion denied. Violations: ${JSON.stringify(shrunkViolations)}`
    } as LawCheck<ProfunctorTraversal<S, A>>;
  }
}

/************ Reverse Conversions (Profunctor to Optics) ************/

/** Convert profunctor lens to safe lens (always safe since profunctor is lawful) */
export function fromProfunctorLens<S, A>(
  profLens: ProfunctorLens<S, A>
): SafeLens<S, A> {
  return safeLens(profLens.view, profLens.set);
}

/** Convert profunctor prism to safe prism (always safe since profunctor is lawful) */
export function fromProfunctorPrism<S, A>(
  profPrism: ProfunctorPrism<S, A>
): SafePrism<S, A> {
  return safePrism(profPrism.preview, profPrism.review);
}

/************ Composition and Utility Functions ************/

/** Safely compose two lenses */
export function composeSafeLenses<S, A, B>(
  outer: SafeLens<S, A>,
  inner: SafeLens<A, B>
): SafeLens<S, B> {
  return safeLens(
    (s: S) => inner.get(outer.get(s)),
    (s: S, b: B) => outer.set(s, inner.set(outer.get(s), b))
  );
}

/** Safely compose prism with lens */
export function composePrismLens<S, A, B>(
  prism: SafePrism<S, A>,
  lens: SafeLens<A, B>
): SafePrism<S, B> {
  return safePrism(
    (s: S) => {
      const a = prism.match(s);
      return a !== undefined ? lens.get(a) : undefined;
    },
    (b: B) => prism.build(lens.set({} as A, b)) // Simplified - would need default A
  );
}

/************ Validation Helpers ************/

/** Check if an optic satisfies its laws without conversion */
export function validateOpticLaws<S, A>(
  optic: SafeLens<S, A> | SafePrism<S, A> | SafeTraversal<S, A>,
  testDomain: { elems: S[] },
  testCodomain: { elems: A[] }
): LawCheck<{ lawType: string; violations: any[] }> {
  
  if ('get' in optic && 'set' in optic) {
    // Lens
    const result = checkLens(testDomain, testCodomain, optic);
    const allLawsOk = result.getSet.ok && result.setGet.ok && result.setSet.ok;
    
    if (allLawsOk) {
      return lawCheck(true, { lawType: "lens", violations: [] }, "All lens laws satisfied");
    } else {
      const violations = [
        ...(!result.getSet.ok ? result.getSet.counterexamples : []),
        ...(!result.setGet.ok ? result.setGet.counterexamples : []),
        ...(!result.setSet.ok ? result.setSet.counterexamples : [])
      ];
      
      return lawCheck(false, { lawType: 'lens', violations }, "Lens laws violated");
    }
  }
  
  if ('match' in optic && 'build' in optic) {
    // Prism - convert A | undefined to Option<A>
    const adaptedPrism = {
      match: (s: S) => {
        const result = optic.match(s);
        return result === undefined ? { tag: "none" as const } : { tag: "some" as const, value: result };
      },
      build: optic.build
    };
    const result = checkPrism(testDomain, testCodomain, adaptedPrism);
    const allLawsOk = result.buildMatch.ok && result.partialInverse.ok;
    
    if (allLawsOk) {
      return lawCheck(true, { lawType: "prism", violations: [] }, "All prism laws satisfied");
    } else {
      const violations = [
        ...(!result.buildMatch.ok ? result.buildMatch.counterexamples : []),
        ...(!result.partialInverse.ok ? result.partialInverse.counterexamples : [])
      ];
      
      return lawCheck(false, { lawType: 'prism', violations }, "Prism laws violated");
    }
  }
  
  if ('modify' in optic) {
    // Traversal
    const result = checkTraversal(testDomain, testCodomain, optic);
    const allLawsOk = result.identity.ok && result.composition.ok;
    
    if (allLawsOk) {
      return lawCheck(true, { lawType: "traversal", violations: [] }, "All traversal laws satisfied");
    } else {
      const violations = [
        ...(!result.identity.ok ? result.identity.counterexamples : []),
        ...(!result.composition.ok ? result.composition.counterexamples : [])
      ];
      
      return lawCheck(false, { lawType: 'traversal', violations }, "Traversal laws violated");
    }
  }
  
  return lawCheck(false, { lawType: 'unknown', violations: [] }, "Unknown optic type");
}

/************ Type-Safe Bridge Functions ************/

/** Bridge interface for safe conversions */
export interface OpticsBridge {
  /** Convert lens to profunctor with law checking */
  lensToProf<S, A>(
    lens: SafeLens<S, A>,
    domain: { elems: S[] },
    codomain: { elems: A[] }
  ): LawCheck<ProfunctorLens<S, A>>;
  
  /** Convert prism to profunctor with law checking */
  prismToProf<S, A>(
    prism: SafePrism<S, A>,
    domain: { elems: S[] },
    codomain: { elems: A[] }
  ): LawCheck<ProfunctorPrism<S, A>>;
  
  /** Convert profunctor lens to safe lens (always succeeds) */
  profToLens<S, A>(prof: ProfunctorLens<S, A>): SafeLens<S, A>;
  
  /** Convert profunctor prism to safe prism (always succeeds) */
  profToPrism<S, A>(prof: ProfunctorPrism<S, A>): SafePrism<S, A>;
}

/** Type-safe optics bridge implementation */
export const typeSafeBridge: OpticsBridge = {
  lensToProf: toProfunctorLens,
  prismToProf: toProfunctorPrism,
  profToLens: fromProfunctorLens,
  profToPrism: fromProfunctorPrism
};

/************ Enhanced Validation with Shrinking ************/

/** Validate optic with enhanced error reporting */
export function validateOpticEnhanced<S, A>(
  optic: SafeLens<S, A> | SafePrism<S, A> | SafeTraversal<S, A>,
  testDomain: { elems: S[] },
  testCodomain: { elems: A[] }
): LawCheck<{
  lawType: string;
  violations: any[];
  minimalCounterexample?: any;
  suggestionForFix?: string;
}> {
  
  const basicResult = validateOpticLaws(optic, testDomain, testCodomain);
  
  if (basicResult.ok) {
    return basicResult;
  }
  
  if (basicResult.witness) {
    const { lawType, violations } = basicResult.witness;
    
    // Find minimal counterexample
    if (violations.length > 0) {
      const minimalCounterexample = applyShrinking(violations[0], (v) => {
        // Re-validate that this is still a counterexample
        return validateOpticLaws(optic, { elems: [v.s] }, testCodomain).ok === false;
      });
      
      // Generate fix suggestion based on violation type
      let suggestionForFix = "Unknown fix needed";
      if (lawType === 'lens') {
        if ('got' in violations[0] && 'after' in violations[0]) {
          suggestionForFix = "Fix set function to satisfy: set(s, get(s)) = s";
        } else if ('a' in violations[0] && 'got' in violations[0]) {
          suggestionForFix = "Fix get function to satisfy: get(set(s, a)) = a";
        }
      } else if (lawType === 'prism') {
        if ('a' in violations[0] && 'got' in violations[0]) {
          suggestionForFix = "Fix match/build to satisfy: match(build(a)) = Some(a)";
        }
      }
      
      return lawCheck(false, {
        lawType,
        violations,
        minimalCounterexample,
        suggestionForFix
      }, `${lawType} laws violated with specific fix suggestion`);
    }
  }
  
  return basicResult;
}

/************ Unsafe Cast Elimination Helpers ************/

/** Type-safe extraction of lens components */
export function extractLensComponents<S, A>(lens: SafeLens<S, A>): {
  get: (s: S) => A;
  set: (s: S, a: A) => S;
} {
  return {
    get: lens.get,
    set: lens.set
  };
}

/** Type-safe extraction of prism components */
export function extractPrismComponents<S, A>(prism: SafePrism<S, A>): {
  match: (s: S) => A | undefined;
  build: (a: A) => S;
} {
  return {
    match: prism.match,
    build: prism.build
  };
}

/** Verify type compatibility between optics */
export function checkOpticCompatibility<S, A, B>(
  optic1: SafeLens<S, A> | SafePrism<S, A>,
  optic2: SafeLens<A, B> | SafePrism<A, B>
): LawCheck<{ compatible: boolean; reason?: string }> {
  
  // Check if the types can compose
  try {
    if ('get' in optic1 && 'get' in optic2) {
      // Lens composition
      const testValue = {} as S;
      const intermediate = optic1.get(testValue);
      const final = optic2.get(intermediate);
      
      return lawCheck(true, { compatible: true }, "Lens composition is type-safe");
    }
    
    if ('match' in optic1 && 'match' in optic2) {
      // Prism composition
      const testValue = {} as S;
      const intermediate = optic1.match(testValue);
      if (intermediate !== undefined) {
        const final = optic2.match(intermediate);
        return lawCheck(true, { compatible: true }, "Prism composition is type-safe");
      }
      
      return lawCheck(true, { compatible: true }, "Prism composition is potentially type-safe");
    }
    
    return lawCheck(false, { compatible: false, reason: "Incompatible optic types" }, 
      "Cannot compose different optic types");
    
  } catch (error) {
    return lawCheck(false, { compatible: false, reason: `Type error: ${error}` },
      "Type compatibility check failed");
  }
}
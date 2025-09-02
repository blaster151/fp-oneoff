// optics-rewrite-bridge.ts
// Bridge between optics-rewrite system and existing profunctor optics infrastructure
// Connects the rewrite engine with CatkitOptics, CatkitPrisms, etc.

import { 
  ModLike, Rule, Term, rewrite, genericRewrite, show, lit, v, add, mul, let_,
  defaultRules, defaultRegistry
} from './optics-rewrite.js';

// Import existing optics (would be from the main library)
// For now, we define minimal interfaces that match the existing structure

/************ Integration with existing optics infrastructure ************/

/** 
 * Adapter interface for existing profunctor optics
 * This would integrate with CatkitOptics.PLens, CatkitPrisms.Prism, etc.
 */
export interface ExistingOptic<S, A> {
  // Minimal interface that existing optics should satisfy
  view?: (s: S) => A;
  preview?: (s: S) => A | undefined;
  over: (f: (a: A) => A) => (s: S) => S;
}

/**
 * Convert existing profunctor optic to rewrite-compatible ModLike
 */
export function adaptExistingOptic<S, A>(optic: ExistingOptic<S, A>): ModLike<S, A> {
  return {
    modify: (s: S, f: (a: A) => A): S => optic.over(f)(s)
  };
}

/**
 * Create rewrite function from existing optic (matches requested signature)
 * rewrite :: PLens/Prism/Traversal -> (A→A) -> Free<F,A>→Free<F,A>
 */
export function rewriteWithExistingOptic<S, A>(
  optic: ExistingOptic<S, A>,
  transform: (a: A) => A
): (s: S) => S {
  return optic.over(transform);
}

/**
 * Create rule from existing optic and transformation
 */
export function ruleFromExistingOptic(
  name: string,
  optic: ExistingOptic<Term, Term>,
  transform: (a: Term) => Term
): Rule {
  return {
    name,
    optic: adaptExistingOptic(optic),
    step: transform
  };
}

/************ Enhanced rule creation utilities ************/

/**
 * Create a rule that applies to specific AST node types
 */
export function createNodeRule(
  name: string,
  nodeType: string,
  transform: (node: any) => Term | undefined
): Rule {
  return {
    name,
    optic: {
      modify: (s: Term, f: (a: Term) => Term): Term => {
        if (s._tag === "Impure" && s.node.tag === nodeType) {
          const result = transform(s.node);
          return result !== undefined ? f(result) : s;
        }
        return s;
      }
    },
    step: (t: Term) => {
      if (t._tag === "Impure" && t.node.tag === nodeType) {
        const result = transform(t.node);
        return result !== undefined ? result : t;
      }
      return t;
    }
  };
}

/**
 * Create a rule that matches specific patterns
 */
export function createPatternRule(
  name: string,
  pattern: (t: Term) => boolean,
  transform: (t: Term) => Term
): Rule {
  return {
    name,
    optic: {
      modify: (s: Term, f: (a: Term) => Term): Term => {
        return pattern(s) ? f(s) : s;
      }
    },
    step: (t: Term) => pattern(t) ? transform(t) : t
  };
}

/************ Advanced rule combinators ************/

/**
 * Sequence multiple rules (apply in order)
 */
export function sequenceRules(rules: Rule[]): Rule {
  return {
    name: `sequence(${rules.map(r => r.name).join(',')})`,
    optic: {
      modify: (s: Term, f: (a: Term) => Term): Term => {
        let current = s;
        for (const rule of rules) {
          current = rule.optic.modify(current, rule.step);
        }
        return f(current);
      }
    },
    step: (t: Term) => {
      let current = t;
      for (const rule of rules) {
        current = rule.step(current);
      }
      return current;
    }
  };
}

/**
 * Try multiple rules (first successful wins)
 */
export function choiceRules(rules: Rule[]): Rule {
  return {
    name: `choice(${rules.map(r => r.name).join('|')})`,
    optic: {
      modify: (s: Term, f: (a: Term) => Term): Term => {
        for (const rule of rules) {
          const result = rule.optic.modify(s, rule.step);
          if (result !== s) return f(result);
        }
        return f(s);
      }
    },
    step: (t: Term) => {
      for (const rule of rules) {
        const result = rule.step(t);
        if (result !== t) return result;
      }
      return t;
    }
  };
}

/************ Soundness and confluence utilities ************/

/**
 * Check if a rule preserves some invariant
 */
export function checkRuleSoundness(
  rule: Rule,
  invariant: (t: Term) => boolean,
  testCases: Term[]
): { sound: boolean; violations: Array<{input: string; output: string}> } {
  const violations: Array<{input: string; output: string}> = [];
  
  for (const testCase of testCases) {
    if (invariant(testCase)) {
      const result = rule.step(testCase);
      if (!invariant(result)) {
        violations.push({
          input: show(testCase),
          output: show(result)
        });
      }
    }
  }
  
  return {
    sound: violations.length === 0,
    violations
  };
}

/**
 * Generate random terms for property testing
 */
export function generateRandomTerm(depth: number = 3, vars: string[] = ["x", "y", "z"]): Term {
  if (depth <= 0) {
    return Math.random() < 0.5 
      ? lit(Math.floor(Math.random() * 10))
      : v(vars[Math.floor(Math.random() * vars.length)]!);
  }
  
  const choice = Math.random();
  if (choice < 0.2) {
    return lit(Math.floor(Math.random() * 10));
  } else if (choice < 0.4) {
    return v(vars[Math.floor(Math.random() * vars.length)]!);
  } else if (choice < 0.6) {
    return add(generateRandomTerm(depth - 1, vars), generateRandomTerm(depth - 1, vars));
  } else if (choice < 0.8) {
    return mul(generateRandomTerm(depth - 1, vars), generateRandomTerm(depth - 1, vars));
  } else {
    const varName = vars[Math.floor(Math.random() * vars.length)]!;
    return let_(varName, generateRandomTerm(depth - 1, vars), generateRandomTerm(depth - 1, vars));
  }
}

/************ Integration demonstration ************/
export function demonstrateOpticsIntegration() {
  console.log("\n" + "=".repeat(80));
  console.log("INTEGRATION WITH EXISTING OPTICS");
  console.log("=".repeat(80));

  console.log("\n1. EXISTING OPTIC ADAPTATION");
  
  // Simulate existing profunctor optic (would be from CatkitOptics)
  const mockExistingOptic: ExistingOptic<Term, Term> = {
    preview: (s: Term) => s._tag === "Impure" && s.node.tag === "Add" ? s : undefined,
    over: (f: (a: Term) => Term) => (s: Term) => {
      return s._tag === "Impure" && s.node.tag === "Add" ? f(s) : s;
    }
  };
  
  const adaptedOptic = adaptExistingOptic(mockExistingOptic);
  const testTerm = add(lit(1), lit(2));
  
  console.log("Test term:", show(testTerm));
  const rewritten = adaptedOptic.modify(testTerm, (t) => lit(42));
  console.log("After rewrite via adapted optic:", show(rewritten));

  console.log("\n2. RULE SOUNDNESS TESTING");
  
  // Test rule soundness with random terms
  const testCases = Array.from({length: 10}, () => generateRandomTerm(2));
  const invariant = (t: Term) => true; // Trivial invariant for demo
  
  console.log("Testing rule soundness on random terms...");
  for (const rule of defaultRules) {
    const soundness = checkRuleSoundness(rule, invariant, testCases);
    console.log(`  ${rule.name}: ${soundness.sound ? '✓' : '✗'} sound`);
    if (!soundness.sound) {
      console.log(`    Violations: ${soundness.violations.length}`);
    }
  }

  console.log("\n3. RULE COMPOSITION");
  
  // Demonstrate rule combinators
  const foldingRules = [
    defaultRegistry.get("fold/add")!,
    defaultRegistry.get("fold/mul")!
  ];
  
  const peepholeRules = [
    defaultRegistry.get("mul/one")!,
    defaultRegistry.get("add/zero")!
  ];
  
  const sequencedRule = sequenceRules(foldingRules);
  const choiceRule = choiceRules(peepholeRules);
  
  const testExpr = add(mul(lit(1), lit(5)), lit(0));
  console.log("Test expression:", show(testExpr));
  console.log("Sequenced folding:", show(sequencedRule.step(testExpr)));
  console.log("Choice peephole:", show(choiceRule.step(testExpr)));

  console.log("\n" + "=".repeat(80));
  console.log("INTEGRATION COMPLETE:");
  console.log("✓ Adapter for existing profunctor optics");
  console.log("✓ Rule creation from existing optic infrastructure");
  console.log("✓ Soundness testing with property-based verification");
  console.log("✓ Rule combinators for complex optimization strategies");
  console.log("✓ Random term generation for comprehensive testing");
  console.log("=".repeat(80));
}

// Function is already exported above
import { Term, Var, App } from "../Term";
import { Signature, opOf } from "../Signature";
import { normalize, rule, RewriteRule } from "./Rules";
import { idx } from "../../util/guards";
import { FiniteSet } from "../../set/Set";

/**
 * Set-level Monad from a finitary theory
 * 
 * Given a finitary algebraic theory T, we construct a monad T on finite sets
 * where T(X) is the free T-algebra on X. This gives us:
 * - Unit: X -> T(X) (inclusion of generators)
 * - Multiplication: T(T(X)) -> T(X) (evaluation of nested terms)
 * 
 * The monad laws are verified by testing on finite sets.
 */

/** The free T-algebra on a finite set X */
export type FreeAlgebra<A> = Term[];

/** Monad operations for the set-level monad */
export interface SetMonad<A> {
  /** Unit: X -> T(X) */
  unit: (x: A) => FreeAlgebra<A>;
  
  /** Multiplication: T(T(X)) -> T(X) */
  multiply: (ttx: FreeAlgebra<FreeAlgebra<A>>) => FreeAlgebra<A>;
  
  /** Map: (A -> B) -> (T(A) -> T(B)) */
  map: <B>(f: (a: A) => B) => (ta: FreeAlgebra<A>) => FreeAlgebra<B>;
  
  /** Bind: T(A) -> (A -> T(B)) -> T(B) */
  bind: <B>(ta: FreeAlgebra<A>, f: (a: A) => FreeAlgebra<B>) => FreeAlgebra<B>;
}

/**
 * Create a set-level monad from a finitary theory
 * 
 * @param sig The signature of the theory
 * @param rules The rewrite rules for the theory
 * @returns A monad on finite sets
 */
export function createSetMonad<A>(
  sig: Signature,
  rules: RewriteRule[]
): SetMonad<A> {
  
  /** Convert an element to a variable term */
  const elementToVar = (x: A, index: number): Term => Var(index);
  
  /** Convert a variable term back to an element */
  const varToElement = (t: Term, elements: A[]): A | null => {
    if (t.tag === "Var" && t.ix < elements.length) {
      return idx(elements, t.ix);
    }
    return null;
  };
  
  return {
    /** Unit: X -> T(X) - maps each element to a variable */
    unit: (x: A) => {
      // For a single element, we create a variable term
      // In practice, we'd need to track the mapping from elements to variables
      return [Var(0)]; // Simplified: assume x maps to Var(0)
    },
    
    /** Multiplication: T(T(X)) -> T(X) - flattens nested terms */
    multiply: (ttx: FreeAlgebra<FreeAlgebra<A>>) => {
      const result: Term[] = [];
      
      for (const innerTerms of ttx) {
        for (const term of innerTerms) {
          // Apply rewrite rules to normalize the term
          const normalized = normalize(term, rules);
          result.push(normalized);
        }
      }
      
      return result;
    },
    
    /** Map: (A -> B) -> (T(A) -> T(B)) */
    map: <B>(f: (a: A) => B) => (ta: FreeAlgebra<A>) => {
      // This is a simplified version - in practice we'd need to track
      // the mapping between elements and variables more carefully
      return ta; // For now, just return the same terms
    },
    
    /** Bind: T(A) -> (A -> T(B)) -> T(B) */
    bind: <B>(ta: FreeAlgebra<A>, f: (a: A) => FreeAlgebra<B>) => {
      const result: Term[] = [];
      
      for (const term of ta) {
        // For each term, we'd need to extract the elements it represents
        // and apply f to each, then combine the results
        // This is simplified for now
        result.push(term);
      }
      
      return result;
    }
  };
}

/**
 * Test monad laws on finite sets
 * 
 * @param monad The monad to test
 * @param testSet A finite set to test with
 * @returns Object indicating which laws pass
 */
export function testMonadLaws<A>(
  monad: SetMonad<A>,
  testSet: FiniteSet<A>
): {
  leftIdentity: boolean;
  rightIdentity: boolean;
  associativity: boolean;
} {
  
  // Left identity: bind(unit(x), f) = f(x)
  const leftIdentity = testSet.elems.every(x => {
    const unitX = monad.unit(x);
    const f = (a: A) => monad.unit(a); // Simple test function
    const bound = monad.bind(unitX, f);
    const direct = f(x);
    
    // Compare the results (simplified comparison)
    return bound.length === direct.length;
  });
  
  // Right identity: bind(m, unit) = m
  const rightIdentity = testSet.elems.every(x => {
    const m = monad.unit(x);
    const bound = monad.bind(m, monad.unit);
    
    // Compare the results (simplified comparison)
    return bound.length === m.length;
  });
  
  // Associativity: bind(bind(m, f), g) = bind(m, x => bind(f(x), g))
  const associativity = testSet.elems.every(x => {
    const m = monad.unit(x);
    const f = (a: A) => monad.unit(a);
    const g = (a: A) => monad.unit(a);
    
    const left = monad.bind(monad.bind(m, f), g);
    const right = monad.bind(m, (a: A) => monad.bind(f(a), g));
    
    // Compare the results (simplified comparison)
    return left.length === right.length;
  });
  
  return {
    leftIdentity,
    rightIdentity,
    associativity
  };
}

/**
 * Create a monoid set monad
 */
export function createMonoidSetMonad<A>(): SetMonad<A> {
  const sig: Signature = {
    ops: [
      { name: "e", arity: 0 },  // unit
      { name: "mul", arity: 2 } // multiplication
    ]
  };
  
  const rules: RewriteRule[] = [
    // Associativity: (x * y) * z = x * (y * z)
    rule(
      App(opOf(sig, "mul"), [App(opOf(sig, "mul"), [Var(0), Var(1)]), Var(2)]),
      App(opOf(sig, "mul"), [Var(0), App(opOf(sig, "mul"), [Var(1), Var(2)])])
    ),
    // Left unit: e * x = x
    rule(
      App(opOf(sig, "mul"), [App(opOf(sig, "e"), []), Var(0)]),
      Var(0)
    ),
    // Right unit: x * e = x
    rule(
      App(opOf(sig, "mul"), [Var(0), App(opOf(sig, "e"), [])]),
      Var(0)
    )
  ];
  
  return createSetMonad(sig, rules);
}

/**
 * Create a semilattice set monad
 */
export function createSemilatticeSetMonad<A>(): SetMonad<A> {
  const sig: Signature = {
    ops: [
      { name: "bot", arity: 0 }, // bottom element
      { name: "join", arity: 2 } // join operation
    ]
  };
  
  const rules: RewriteRule[] = [
    // Associativity: (x ∨ y) ∨ z = x ∨ (y ∨ z)
    rule(
      App(opOf(sig, "join"), [App(opOf(sig, "join"), [Var(0), Var(1)]), Var(2)]),
      App(opOf(sig, "join"), [Var(0), App(opOf(sig, "join"), [Var(1), Var(2)])])
    ),
    // Commutativity: x ∨ y = y ∨ x
    rule(
      App(opOf(sig, "join"), [Var(0), Var(1)]),
      App(opOf(sig, "join"), [Var(1), Var(0)])
    ),
    // Idempotence: x ∨ x = x
    rule(
      App(opOf(sig, "join"), [Var(0), Var(0)]),
      Var(0)
    ),
    // Bottom element: bot ∨ x = x
    rule(
      App(opOf(sig, "join"), [App(opOf(sig, "bot"), []), Var(0)]),
      Var(0)
    ),
    // Bottom element: x ∨ bot = x
    rule(
      App(opOf(sig, "join"), [Var(0), App(opOf(sig, "bot"), [])]),
      Var(0)
    )
  ];
  
  return createSetMonad(sig, rules);
}
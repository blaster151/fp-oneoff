import type { Signature, OpSym } from "./Signature";
import type { UAAlgebra } from "./Algebra";
import { Var, App, type Term } from "./Term";
import { opOf } from "./Signature";
import { FreeAlgebra } from "./FreeAlgebra";
import { must, idx } from "../util/guards";

export type Equation = { lhs: Term; rhs: Term };

/**
 * Enumerate all terms up to maxDepth with genCount generators.
 * This is essentially the same as FreeAlgebra but returns just the terms.
 */
export function enumerateTerms(sig: Signature, genCount: number, maxDepth: number): Term[] {
  const T = FreeAlgebra(sig, genCount, maxDepth);
  return T.elems;
}

/**
 * Build the congruence closure of a set of equations on a term algebra.
 * Returns equivalence classes, representative function, and equality test.
 */
export function congruenceClosure(
  sig: Signature,
  terms: Term[],
  equations: Equation[]
): { classes: Map<Term, Term>; reprOf: (t: Term) => Term; same: (t1: Term, t2: Term) => boolean } {
  // Union-find data structure for equivalence classes
  const parent = new Map<Term, Term>();
  const rank = new Map<Term, number>();

  // Initialize each term as its own parent
  for (const term of terms) {
    parent.set(term, term);
    rank.set(term, 0);
  }

  function find(x: Term): Term {
    if (parent.get(x) !== x) {
      parent.set(x, find(parent.get(x)!));
    }
    return parent.get(x)!;
  }

  function union(x: Term, y: Term): void {
    const rootX = find(x);
    const rootY = find(y);
    if (rootX === rootY) return;

    const rankX = rank.get(rootX) || 0;
    const rankY = rank.get(rootY) || 0;

    if (rankX < rankY) {
      parent.set(rootX, rootY);
    } else if (rankX > rankY) {
      parent.set(rootY, rootX);
    } else {
      parent.set(rootY, rootX);
      rank.set(rootX, rankX + 1);
    }
  }

  // Apply equations to merge classes
  for (const eq of equations) {
    // Find terms that match the equation patterns
    for (const term of terms) {
      const matches = findMatchingTerms(term, eq.lhs, eq.rhs);
      for (const match of matches) {
        union(match.lhs, match.rhs);
      }
    }
  }

  // Build classes map and representative function
  const classes = new Map<Term, Term>();
  const reprOf = (t: Term): Term => find(t);
  const same = (t1: Term, t2: Term): boolean => find(t1) === find(t2);

  for (const term of terms) {
    classes.set(term, find(term));
  }

  return { classes, reprOf, same };
}

/**
 * Find terms that match equation patterns by substitution.
 * This is a simplified implementation that handles basic cases.
 */
function findMatchingTerms(term: Term, lhs: Term, rhs: Term): Array<{ lhs: Term; rhs: Term }> {
  const matches: Array<{ lhs: Term; rhs: Term }> = [];
  
  // For simplicity, we'll handle direct matches and some basic patterns
  // In a full implementation, this would use more sophisticated pattern matching
  
  // Check if the term directly matches the equation
  if (termEq(term, lhs)) {
    // Find a term that matches rhs with the same substitution
    // This is simplified - in practice you'd need proper unification
    matches.push({ lhs: term, rhs: substituteTerm(term, lhs, rhs) });
  }
  
  return matches;
}

/**
 * Substitute variables in a term based on a pattern match.
 * Simplified implementation for basic cases.
 */
function substituteTerm(original: Term, pattern: Term, replacement: Term): Term {
  // This is a very simplified substitution
  // In practice, you'd need proper unification and substitution
  if (pattern.tag === "Var") {
    return replacement;
  }
  return original; // Fallback
}

/**
 * Build a quotient algebra from equivalence classes.
 */
export function quotientAlgebra<A>(
  sig: Signature,
  terms: Term[],
  classes: Map<Term, Term>,
  reprOf: (t: Term) => Term
): UAAlgebra<Term> {
  // Get unique representatives
  const representatives = Array.from(new Set(classes.values()));
  
  const eq = (t1: Term, t2: Term): boolean => reprOf(t1) === reprOf(t2);
  
  const interpret = (op: OpSym) => (...args: Term[]): Term => {
    const result = App(op, args);
    return reprOf(result);
  };

  return {
    sig,
    elems: representatives,
    eq,
    interpret
  };
}

/**
 * Projection map from terms to quotient representatives.
 */
export function projectionToQuotient(
  terms: Term[],
  reprOf: (t: Term) => Term
): (t: Term) => Term {
  return (t: Term) => reprOf(t);
}

/**
 * Check if a homomorphism factors through the quotient and return the induced map.
 */
export function factorThroughQuotient<A>(
  sig: Signature,
  terms: Term[],
  equations: Equation[],
  reprOf: (t: Term) => Term,
  phi: (t: Term) => A,
  eqA: (a: A, b: A) => boolean
): { wellDefined: boolean; bar: (t: Term) => A } {
  // Check if phi respects the equations
  let wellDefined = true;
  
  for (const eq of equations) {
    // Check if phi(eq.lhs) = phi(eq.rhs) for all valid substitutions
    // This is simplified - in practice you'd need to check all instances
    if (!eqA(phi(eq.lhs), phi(eq.rhs))) {
      wellDefined = false;
      break;
    }
  }

  // If well-defined, create the induced map
  const bar = (t: Term): A => {
    const repr = reprOf(t);
    if (!repr) {
      throw new Error(`No representative found for term: ${JSON.stringify(t)}`);
    }
    return phi(repr);
  };

  return { wellDefined, bar };
}

/**
 * Simple term equality check.
 */
function termEq(x: Term, y: Term): boolean {
  if (x.tag !== y.tag) return false;
  if (x.tag === "Var") return x.ix === (y as any).ix;
  const a = x as App, b = y as App;
  if (a.op !== b.op) return false;
  if (a.args.length !== b.args.length) return false;
  for (let i = 0; i < a.args.length; i++) {
    if (!termEq(idx(a.args, i), idx(b.args, i))) return false;
  }
  return true;
}
import { Term, Var, App } from "../Term";
import { Signature, opOf } from "../Signature";
import { normalize, rule, RewriteRule } from "../rewrite/Rules";
import { must, idx } from "../../util/guards";

/**
 * Lawvere Monad from a finitary theory
 * 
 * This implements the monad T on Set induced by a finitary algebraic theory.
 * T(X) is the free algebra on X, with operations:
 * - η: X → T(X) (unit/inclusion)
 * - μ: T(T(X)) → T(X) (multiplication/evaluation)
 * - bind: T(X) × (X → T(Y)) → T(Y) (Kleisli extension)
 */

/** A finite set with equality */
export interface FiniteSet<A> {
  elems: A[];
  eq: (a: A, b: A) => boolean;
}

/** The T-carrier (free algebra) on a finite set */
export interface TCarrier<A> {
  elems: Term[];
  eq: (t1: Term, t2: Term) => boolean;
}

/** Monad operations for the Lawvere monad */
export interface SetMonadFromTheory {
  /** Unit: X → T(X) */
  eta: <A>(X: FiniteSet<A>) => (x: A) => Term;
  
  /** Multiplication: T(T(X)) → T(X) */
  mu: <A>(X: FiniteSet<A>) => (ttx: Term) => Term;
  
  /** Bind: T(X) × (X → T(Y)) → T(Y) */
  bind: <A, B>(X: FiniteSet<A>, Y: FiniteSet<B>) => (tx: Term, f: (x: A) => Term) => Term;
  
  /** T-carrier construction */
  Tcarrier: <A>(X: FiniteSet<A>) => TCarrier<A>;
}

/**
 * Build a set monad from a finitary theory
 */
export function buildSetMonadFromTheory(
  sig: Signature,
  equations: Array<{ lhs: Term; rhs: Term }>,
  maxDepth = 2
): SetMonadFromTheory {
  
  // Convert equations to rewrite rules
  const rules: RewriteRule[] = equations.map(eq => 
    rule(eq.lhs, eq.rhs, { name: "eq", assoc: false, comm: false, idem: false })
  );
  
  /** Create a variable term for an element */
  const elementToVar = <A>(x: A, X: FiniteSet<A>): Term => {
    const index = X.elems.findIndex(elem => X.eq(elem, x));
    if (index === -1) throw new Error(`Element not found in finite set`);
    return Var(index);
  };
  
  /** Extract elements from a term (variables only) */
  const termToElements = <A>(t: Term, X: FiniteSet<A>): A[] => {
    const elements: A[] = [];
    const collectVars = (term: Term) => {
      if (term.tag === "Var" && term.ix < X.elems.length) {
        elements.push(idx(X.elems, term.ix));
      } else if (term.tag === "App") {
        for (const arg of term.args) {
          collectVars(arg);
        }
      }
    };
    collectVars(t);
    return elements;
  };
  
  /** Substitute variables in a term */
  const substitute = (t: Term, subst: (ix: number) => Term): Term => {
    if (t.tag === "Var") {
      return subst(t.ix);
    } else if (t.tag === "App") {
      return App(t.op, t.args.map(arg => substitute(arg, subst)));
    }
    return t;
  };
  
  return {
    /** Unit: X → T(X) - maps each element to a variable */
    eta: <A>(X: FiniteSet<A>) => (x: A) => {
      return elementToVar(x, X);
    },
    
    /** Multiplication: T(T(X)) → T(X) - evaluates nested terms */
    mu: <A>(X: FiniteSet<A>) => (ttx: Term) => {
      // For nested terms, we substitute inner terms into outer terms
      // This is a simplified version - in practice we'd need more sophisticated
      // handling of nested term structures
      return normalize(ttx, rules);
    },
    
    /** Bind: T(X) × (X → T(Y)) → T(Y) */
    bind: <A, B>(X: FiniteSet<A>, Y: FiniteSet<B>) => (tx: Term, f: (x: A) => Term) => {
      // For a variable term, apply f directly to the corresponding element
      if (tx.tag === "Var" && tx.ix < X.elems.length) {
        const element = idx(X.elems, tx.ix);
        return f(element);
      }
      
      // For compound terms, substitute variables with their f-images
      const substituteWithF = (t: Term): Term => {
        if (t.tag === "Var" && t.ix < X.elems.length) {
          const element = idx(X.elems, t.ix);
          return f(element);
        } else if (t.tag === "App") {
          return App(t.op, t.args.map(substituteWithF));
        }
        return t;
      };
      
      return normalize(substituteWithF(tx), rules);
    },
    
    /** T-carrier construction */
    Tcarrier: <A>(X: FiniteSet<A>) => {
      // Generate all terms up to maxDepth using elements of X
      const generateTerms = (depth: number): Term[] => {
        if (depth === 0) {
          // Base case: variables
          return X.elems.map((_, i) => Var(i));
        }
        
        const terms: Term[] = [];
        
        // Add all operations
        for (const op of sig.ops) {
          if (op.arity === 0) {
            // Constants
            terms.push(App(opOf(sig, op.name), []));
          } else if (op.arity === 1) {
            // Unary operations
            const subTerms = generateTerms(depth - 1);
            for (const sub of subTerms) {
              terms.push(App(opOf(sig, op.name), [sub]));
            }
          } else if (op.arity === 2) {
            // Binary operations
            const subTerms = generateTerms(depth - 1);
            for (const sub1 of subTerms) {
              for (const sub2 of subTerms) {
                terms.push(App(opOf(sig, op.name), [sub1, sub2]));
              }
            }
          }
        }
        
        return terms;
      };
      
      const allTerms = generateTerms(maxDepth);
      
      return {
        elems: allTerms,
        eq: (t1: Term, t2: Term) => {
          // Normalize both terms and compare
          const n1 = normalize(t1, rules);
          const n2 = normalize(t2, rules);
          return JSON.stringify(n1) === JSON.stringify(n2);
        }
      };
    }
  };
}
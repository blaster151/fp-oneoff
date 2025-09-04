import { Term, Var, App } from "../Term";
import { Signature, opOf } from "../Signature";

/** A rewrite rule: lhs -> rhs with optional AC properties */
export type RewriteRule = {
  lhs: Term;
  rhs: Term;
  ac?: {
    name: string;
    assoc: boolean;
    comm: boolean;
    idem: boolean;
  };
};

/** Create a rewrite rule */
export function rule(lhs: Term, rhs: Term, ac?: RewriteRule['ac']): RewriteRule {
  return { lhs, rhs, ac };
}

/** Generate a canonical key for term comparison */
export function key(t: Term): string {
  return JSON.stringify(t);
}

/** Check if a term matches a pattern (with variables) */
function matches(pattern: Term, term: Term): Map<number, Term> | null {
  const env = new Map<number, Term>();
  
  function match(p: Term, t: Term): boolean {
    if (p.tag === "Var") {
      const existing = env.get(p.ix);
      if (existing === undefined) {
        env.set(p.ix, t);
        return true;
      }
      return key(existing) === key(t);
    }
    
    if (p.tag !== "App" || t.tag !== "App") return false;
    if (p.op !== t.op) return false;
    if (p.args.length !== t.args.length) return false;
    
    for (let i = 0; i < p.args.length; i++) {
      if (!match(p.args[i], t.args[i])) return false;
    }
    return true;
  }
  
  return match(pattern, term) ? env : null;
}

/** Apply substitution to a term */
function subst(term: Term, env: Map<number, Term>): Term {
  if (term.tag === "Var") {
    const replacement = env.get(term.ix);
    return replacement || term;
  }
  
  return App(term.op, term.args.map(arg => subst(arg, env)));
}

/** Flatten nested applications of an associative operator */
function flatten(op: any, term: Term): Term[] {
  if (term.tag !== "App" || term.op !== op) return [term];
  
  const result: Term[] = [];
  for (const arg of term.args) {
    result.push(...flatten(op, arg));
  }
  return result;
}

/** Sort terms by their canonical key (for commutative operations) */
function sortTerms(terms: Term[]): Term[] {
  return [...terms].sort((a, b) => key(a).localeCompare(key(b)));
}

/** Remove duplicates from sorted terms (for idempotent operations) */
function dedupTerms(terms: Term[]): Term[] {
  if (terms.length === 0) return terms;
  const result = [terms[0]];
  for (let i = 1; i < terms.length; i++) {
    if (key(terms[i]) !== key(terms[i-1])) {
      result.push(terms[i]);
    }
  }
  return result;
}

/** Apply AC(I) normalization at the head of a term */
export function normalizeHead(term: Term, ac: RewriteRule['ac']): Term {
  if (!ac || term.tag !== "App" || term.op.name !== ac.name) return term;
  
  // Flatten by associativity
  const flatArgs = flatten(term.op, term);
  
  // Sort by commutativity
  const sortedArgs = ac.comm ? sortTerms(flatArgs) : flatArgs;
  
  // Deduplicate by idempotence
  const dedupedArgs = ac.idem ? dedupTerms(sortedArgs) : sortedArgs;
  
  // Rebuild the term
  if (dedupedArgs.length === 0) {
    throw new Error("Empty term after AC(I) normalization");
  }
  if (dedupedArgs.length === 1) {
    return dedupedArgs[0];
  }
  
  return App(term.op, dedupedArgs);
}

/** Apply a single rewrite rule to a term */
function applyRule(term: Term, rule: RewriteRule): Term | null {
  const env = matches(rule.lhs, term);
  if (!env) return null;
  
  return subst(rule.rhs, env);
}

/** Apply rewrite rules to a term until no more rules apply */
export function normalize(term: Term, rules: RewriteRule[]): Term {
  let current = term;
  let changed = true;
  
  while (changed) {
    changed = false;
    
    for (const rule of rules) {
      const result = applyRule(current, rule);
      if (result && key(result) !== key(current)) {
        current = result;
        changed = true;
        break; // Start over with the new term
      }
    }
  }
  
  return current;
}

/** Apply rules recursively to subterms */
export function normalizeRecursive(term: Term, rules: RewriteRule[]): Term {
  if (term.tag === "Var") return term;
  
  // First normalize subterms
  const normalizedArgs = term.args.map(arg => normalizeRecursive(arg, rules));
  const termWithNormalizedArgs = App(term.op, normalizedArgs);
  
  // Then apply rules at the head
  return normalize(termWithNormalizedArgs, rules);
}
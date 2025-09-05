import type { Signature, OpSym } from "./Signature";
import type { UAAlgebra } from "./Algebra";
import { evalTerm } from "./Algebra";
import { Var, App, type Term } from "./Term";

/**
 * Absolutely free algebra on a finite generator set X = {0..k-1}.
 * Carrier = terms over the signature whose variables are among X,
 * truncated by `maxDepth` (to keep elems finite for tests).
 */
export function FreeAlgebra(sig: Signature, genCount: number, maxDepth = 2): UAAlgebra<Term> {
  // enumerate all terms up to depth
  const vars = Array.from({length: genCount}, (_,i)=> Var(i));
  const elems: Term[] = [];

  function build(depth: number): Term[] {
    if (depth === 0) return vars.slice();
    const smaller = build(depth - 1);
    const out = smaller.slice();
    for (const op of sig.ops) {
      // collect all arg tuples of size arity from smaller
      const ar = op.arity;
      if (ar === 0) {
        out.push(App(op, []));
      } else {
        const tuple: Term[] = Array(ar).fill(smaller[0]);
        const backtrack = (i:number) => {
          if (i === ar) { out.push(App(op, tuple.slice())); return; }
          for (const t of smaller) { tuple[i] = t; backtrack(i+1); }
        };
        backtrack(0);
      }
    }
    return out;
  }

  for (let d=0; d<=maxDepth; d++) {
    for (const t of build(d)) elems.push(t);
  }

  // interpret ops as syntactic application (this is the term algebra)
  const interpret = (op: OpSym) => (...args: Term[]): Term => App(op, args);

  // alpha-equality: our builders share OpSym object identity & Var indices,
  // so structural equality reduces to JSON string (safe here), but
  // we prefer pointer equality fallback with on-demand stringify if needed.
  const eq = (x: Term, y: Term) => JSON.stringify(x) === JSON.stringify(y);

  return { sig, elems: dedupe(elems, eq), eq, interpret };
}

function dedupe<T>(xs: T[], eq:(x:T,y:T)=>boolean): T[] {
  const out: T[] = [];
  for (const x of xs) if (!out.some(y => eq(x,y))) out.push(x);
  return out;
}

/**
 * Universal property (evaluation): for any algebra M and map g: X→|M|,
 * there exists a unique hom φ: T(X)→M s.t. φ(Var(i)) = g(i).
 * We return that φ concretely as `induced`.
 */
export function freeInducedHom<A>(
  T: UAAlgebra<any>,
  M: UAAlgebra<A>,
  g: (ix:number)=>A
): (t:any)=>A {
  return (t:any) => evalTerm(M, g, t);
}
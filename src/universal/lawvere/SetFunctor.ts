import type { Lawvere } from "./Lawvere";
import type { UAAlgebra } from "../Algebra";
import { evalTerm } from "../Algebra";

/**
 * Interpret a Lawvere theory L in a concrete algebra A (same signature).
 * This yields a product-preserving functor F: L → Set:
 *  - On objects: n ↦ |A|^n
 *  - On morphisms s: n→m: tuple of term evaluators (A^n → A^m)
 */
export function interpretInSet<A>(L: Lawvere, A: UAAlgebra<A>) {
  const Obj = (n: number) => ({
    elems: cartesianPow(A.elems, n),
    eq: (x:A[],y:A[]) => x.length===y.length && x.every((xi,i)=>A.eq(xi,y[i]))
  });

  const onMor = (s: any[]) => {
    const n = inferArity(s);
    return (tuple: A[]) => {
      const env = (ix:number)=> tuple[ix];
      return s.map(t => {
        if (!t) {
          throw new Error("Undefined term in morphism");
        }
        return evalTerm(A, env, t);
      });
    };
  };

  return { Obj, onMor };
}

function cartesianPow<T>(elems: T[], n: number): T[][] {
  if (n===0) return [[]];
  const rest = cartesianPow(elems, n-1);
  const out: T[][] = [];
  for (const x of elems) for (const r of rest) out.push([x, ...r]);
  return out;
}

function inferArity(s: any[]): number {
  // crude: assume morphism s: n→m where n equals 1 + max var index in the tuple
  let max = -1;
  const visit = (t:any) => {
    if (!t) return;
    if (t.tag==="Var") { if (t.ix>max) max=t.ix; return; }
    if (t.args) {
      for (const u of t.args) visit(u);
    }
  };
  for (const t of s) visit(t);
  return max+1;
}
import { Signature, opOf } from "../Signature";
import { UAAlgebra, evalTerm } from "../Algebra";
import { Term, Var, App } from "../Term";
import { buildSetMonadFromTheory, SetMonadFromTheory, FiniteSet } from "../monad/LawvereMonad";

/** From a UA algebra A, build the T-algebra α_A: T(|A|) → |A| by evaluation. */
export function uaModelToTAlgebra<A>(
  sig: Signature,
  equations: Array<{ lhs:Term; rhs:Term }>,
  A: UAAlgebra<A>,
  maxDepth = 2
) {
  const T = buildSetMonadFromTheory(sig, equations, maxDepth);
  const Aset: FiniteSet<A> = { elems: A.elems, eq: A.eq };

  const alpha = (t: Term) => {
    // interpret Var(i) as the i-th element of |A| (by index in A.elems)
    const env = (ix:number)=> A.elems[ix]!;
    return evalTerm(A, env, t);
  };

  return { T, Aset, alpha };
}

/** From a T-algebra α: T(|A|)→|A|, recover a UA algebra structure on A. */
export function tAlgebraToUA<A>(
  sig: Signature,
  equations: Array<{ lhs:Term; rhs:Term }>,
  Aset: FiniteSet<A>,
  alpha: (t: Term)=>A,
  maxDepth = 2
): UAAlgebra<A> {
  const T = buildSetMonadFromTheory(sig, equations, maxDepth);

  const interpret = (op: any) => (...args: A[]) => {
    // build term op(Var(0..arity-1)) but reindex vars to actual |A| elements via encode
    const encode = (a: A) => {
      const i = Aset.elems.findIndex(x=>Aset.eq(x,a));
      return Var(i);
    };
    const term = App(op, args.map(encode));
    return alpha(term);
  };

  return { sig, elems: Aset.elems, eq: Aset.eq, interpret };
}

/** Check that h: A→B is simultaneously a UA hom and a T-algebra morphism. */
export function checkHomCoincides<A,B>(
  sig: Signature,
  equations: Array<{ lhs:Term; rhs:Term }>,
  A: UAAlgebra<A>,
  B: UAAlgebra<B>,
  h: (a:A)=>B,
  maxDepth=2
) {
  const { T, Aset, alpha: alphaA } = uaModelToTAlgebra(sig, equations, A, maxDepth);
  const { alpha: alphaB } = uaModelToTAlgebra(sig, equations, B, maxDepth);

  // UA-hom check: preserve each op on finite grid
  let uaHom = true;
  for (const op of sig.ops) {
    const ar = op.arity;
    const tuple: number[] = Array(ar).fill(0);
    const next = (i:number): boolean => {
      if (i===ar) {
        const xs = tuple.map(ix=>A.elems[ix]!);
        const lhs = h((A.interpret(op) as any)(...xs));
        const rhs = (B.interpret(op) as any)(...xs.map(h));
        if (!B.eq(lhs, rhs)) return false;
        return true;
      }
      for (let k=0;k<A.elems.length;k++){ tuple[i]=k; if (!next(i+1)) return false; }
      return true;
    };
    if (!next(0)) { uaHom = false; break; }
  }

  // T-algebra morphism: h ∘ α_A = α_B ∘ T(h) on every t∈T(|A|)
  // We need to implement T(h) manually since T.map is not available
  const TA = T.Tcarrier(Aset);
  let tAlgHom = true;
  for (const t of TA.elems) {
    const left = h(alphaA(t));
    
    // T(h) maps terms over A to terms over B by substituting variables
    const Th = (term: Term): Term => {
      if (term.tag === "Var") {
        // Map Var(i) representing A.elems[i] to Var(j) representing h(A.elems[i]) in B
        const a = Aset.elems[term.ix];
        if (a === undefined) throw new Error(`Invalid variable index: ${term.ix}`);
        const b = h(a);
        const j = B.elems.findIndex(x => B.eq(x, b));
        return Var(j);
      } else if (term.tag === "App") {
        return App(term.op, term.args.map(Th));
      }
      return term;
    };
    
    const right = alphaB(Th(t));
    if (!B.eq(left, right)) { tAlgHom = false; break; }
  }

  return { uaHom, tAlgHom };
}
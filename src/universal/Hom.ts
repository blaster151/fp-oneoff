import type { UAAlgebra } from "./Algebra";
import type { OpSym } from "./Signature";

export type UAHom<A,B> = {
  source: UAAlgebra<A>;
  target: UAAlgebra<B>;
  h: (a:A)=>B;
};

/** Is a structure homomorphism (respects each op symbol pointwise)? */
export function isUAHom<A,B>(f: UAHom<A,B>): boolean {
  const { source: A, target: B, h } = f;
  if (A.sig !== B.sig) return false; // same signature object expected
  for (const op of A.sig.ops) {
    const fA = A.interpret(op);
    const fB = B.interpret(op);
    // check multi-arity preservation on the finite grid
    // (enumerate tuples from A.elems of length op.arity)
    const pool = A.elems;
    const ar = op.arity;
    const tuple: number[] = Array(ar).fill(0);
    const next = (i:number): boolean => {
      if (i === ar) {
        const argsA = tuple.map(ix => pool[ix]);
        const lhs = h(fA(...argsA));
        const rhs = fB(...argsA.map(h));
        if (!B.eq(lhs, rhs)) return false;
        return true;
      }
      for (let k=0;k<pool.length;k++){
        tuple[i]=k;
        const ok = next(i+1);
        if (!ok) return false;
      }
      return true;
    };
    if (!next(0)) return false;
  }
  return true;
}
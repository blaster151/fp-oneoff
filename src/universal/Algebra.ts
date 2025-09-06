import type { Signature, OpSym } from "./Signature";
import type { Term } from "./Term";
import { Eq } from "../types/eq.js";

export type UAAlgebra<A> = {
  sig: Signature;
  /** Universe (finite for tests) */
  elems: A[];
  /** Equality on carrier */
  eq: Eq<A>;
  /** Interprets each op symbol as an n-ary operation on A */
  interpret: (op: OpSym) => (...args: A[]) => A;
};

/** Evaluate a term given an environment for variables env(ix) in A. */
export function evalTerm<A>(Alg: UAAlgebra<A>, env: (ix:number)=>A, t: Term): A {
  if ((t as any).tag === "Var") return env((t as any).ix);
  const { op, args } = t as any;
  const f = Alg.interpret(op);
  const vs = args.map((u:Term)=> evalTerm(Alg, env, u));
  return f(...vs);
}
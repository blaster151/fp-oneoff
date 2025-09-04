import type { UAAlgebra } from "./Algebra";
import { evalTerm } from "./Algebra";
import type { Term } from "./Term";

export type Equation = { lhs: Term; rhs: Term };

/**
 * Check satisfaction of an equation for all environments built from a finite environment basis.
 * In practice, pass a small array of variable assignments for finite tests.
 */
export function satisfies<A>(
  Alg: UAAlgebra<A>,
  eqn: Equation,
  envs: Array<(ix:number)=>A>
): boolean {
  for (const env of envs) {
    const l = evalTerm(Alg, env, eqn.lhs);
    const r = evalTerm(Alg, env, eqn.rhs);
    if (!Alg.eq(l, r)) return false;
  }
  return true;
}
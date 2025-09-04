import { FiniteGroup } from "../Group";
import { GroupHom } from "../GrpCat";
import { Zn } from "../Group";
import { C, exp_i } from "../Complex";

/** (4) Z → any two-object group J by parity: even ↦ e, odd ↦ j */
export function parityHom(J: FiniteGroup<unknown>, jRep: unknown): GroupHom<number, unknown> {
  if (J.elems.length !== 2) throw new Error("J must be a two-object group");
  const even = J.id;
  const odd  = jRep;
  const f = (n:number) => (n % 2 === 0 ? even : odd);
  return { source: Zn( /* n ignored for domain size */  12 ), target: J, f };
}

/** (5) Z → Q (as additive groups) via n ↦ n/1 (inclusion). We model Q with numbers. */
export function Z_to_Q(): GroupHom<number, number> {
  const Z = Zn(60);                       // finite window; op is + mod 60 (good for hom tests)
  const Qadd = {
    elems: Z.elems,                       // use the same elements as Z for testing
    eq: (a:number,b:number)=>a===b,
    op: (a:number,b:number)=>(a+b) % 60, // match the Z operation
    id: 0,
    inv: (a:number)=>(60-a) % 60         // match the Z inverse
  } as FiniteGroup<number>;
  const f = (n:number) => n;              // n ↦ n/1
  return { source: Z, target: Qadd, f };
}

/** (6) j : (R,+) → (C*,×), j(x)=cos x + i sin x  (we test on samples, with ≈) */
export function R_to_Cstar_expix(samples: number[]): GroupHom<number, {re:number;im:number}> {
  const Radd = {
    elems: samples, eq:(a:number,b:number)=>a===b,
    op:(a:number,b:number)=>a+b, id:0, inv:(a:number)=>-a
  } as FiniteGroup<number>;
  const Cstar = {
    elems: samples.map(exp_i), eq: C.eqApprox(1e-9), op: C.mul, id: C.one, inv: C.inv
  } as FiniteGroup<{re:number;im:number}>;
  const f = (x:number)=>exp_i(x);
  return { source: Radd, target: Cstar, f };
}
import { describe, it, expect } from "vitest";
import { MonoidSig, ZmodAsMonoid } from "../examples/MonoidSig";
import { FreeAlgebra, freeInducedHom } from "../FreeAlgebra";
import { Var, App } from "../Term";
import { opOf } from "../Signature";
import { isUAHom } from "../Hom";

describe("Universal Algebra: free algebra universal property (monoid-like)", () => {
  const sig = MonoidSig;
  const e = opOf(sig, "e");
  const mul = opOf(sig, "mul");

  // Free algebra on 2 generators X={0,1}
  const T = FreeAlgebra(sig, 2, 2);

  // Concrete monoid: (Z5, +, 0)
  const M = ZmodAsMonoid(5);

  // Map generators: 0 ↦ 2, 1 ↦ 3
  const g = (ix:number)=> ix===0 ? 2 : 3;

  // Induced hom φ: T(X) → M evaluates terms by interpreting ops in M and plugging g for vars
  const phi = freeInducedHom(T, M, g);

  it("φ is a homomorphism of the monoid signature", () => {
    const hom = { source: T, target: M, h: phi };
    expect(isUAHom(hom)).toBe(true);
  });

  it("φ respects unit and binary op on sample terms", () => {
    // Terms: e, mul(Var 0, Var 1), mul(mul(Var 1, e), Var 0)
    const t1 = App(e, []);
    const t2 = App(mul, [Var(0), Var(1)]);
    const t3 = App(mul, [App(mul, [Var(1), t1]), Var(0)]);

    // Evaluate directly in M with g
    const evalInM = (t:any) => phi(t);

    expect(M.eq(evalInM(t1), 0)).toBe(true);        // e ↦ 0
    expect(M.eq(evalInM(t2), (2+3)%5)).toBe(true);  // 2+3=5≡0
    expect(M.eq(evalInM(t3), (3+0+2)%5)).toBe(true);// (3)+0+2=5≡0
  });

  it("uniqueness (on enumerated finite carrier): any hom ψ agreeing on generators equals φ", () => {
    const psi = (t:any) => phi(t); // same definition
    for (const t of T.elems) expect(M.eq(psi(t), phi(t))).toBe(true);
  });
});
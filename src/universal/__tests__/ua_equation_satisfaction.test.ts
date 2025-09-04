import { describe, it, expect } from "vitest";
import { MonoidSig, ZmodAsMonoid } from "../examples/MonoidSig";
import { Equation, satisfies } from "../Equation";
import { Var, App } from "../Term";
import { opOf } from "../Signature";

/** Check associativity & unit equations hold in (Z5,+,0) as a monoid algebra. */
describe("Equation satisfaction in a UA algebra", () => {
  const sig = MonoidSig;
  const e = opOf(sig, "e");
  const mul = opOf(sig, "mul");
  const M = ZmodAsMonoid(5);

  const x = Var(0), y = Var(1), z = Var(2);

  // (x*y)*z = x*(y*z)
  const assoc: Equation = {
    lhs: App(mul, [App(mul, [x,y]), z]),
    rhs: App(mul, [x, App(mul, [y,z])])
  };

  // e*x = x and x*e = x
  const leftUnit: Equation = { lhs: App(mul, [App(e, []), x]), rhs: x };
  const rightUnit: Equation = { lhs: App(mul, [x, App(e, [])]), rhs: x };

  // Environments: assign 0..4 to each var in simple grid (finite sampling)
  const vals = M.elems;
  const envs = [];
  for (const a of vals) for (const b of vals) for (const c of vals) {
    envs.push((ix:number)=> ix===0?a : ix===1?b : c);
  }

  it("associativity holds on the sample grid", () => {
    expect(satisfies(M, assoc, envs)).toBe(true);
  });

  it("unit laws hold on the sample grid", () => {
    expect(satisfies(M, leftUnit, envs)).toBe(true);
    expect(satisfies(M, rightUnit, envs)).toBe(true);
  });
});
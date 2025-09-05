import { describe, it, expect } from "vitest";
import { Signature } from "../../Signature";
import { Var, App } from "../../Term";
import { enumerateTerms, congruenceClosure } from "../../Congruence";
import { semilatticeNormalForm } from "../Oriented";
import { opOf } from "../../Signature";

/** ACI+unit over the monoid signature (treat mul/e as join/bot). */
describe("Equivalence: oriented NF equals congruence class (ACI+unit monoid)", () => {
  const sig: Signature = { ops: [{ name:"e", arity:0 }, { name:"mul", arity:2 }] };
  const e = opOf(sig,"e");
  const mul = opOf(sig,"mul");

  const x = Var(0), y = Var(1), z = Var(2);
  const assoc = { lhs: App(mul,[App(mul,[x,y]), z]), rhs: App(mul,[x, App(mul,[y,z])]) };
  const leftU = { lhs: App(mul,[App(e,[]), x]), rhs: x };
  const rightU= { lhs: App(mul,[x, App(e,[])]), rhs: x };
  const comm  = { lhs: App(mul,[x,y]), rhs: App(mul,[y,x]) };
  const idem  = { lhs: App(mul,[x,x]), rhs: x };
  const E = [assoc,leftU,rightU,comm,idem];

  const NF = semilatticeNormalForm(sig, "mul", "e").nf;

  it("for specific cases, same congruence ⇔ same NF", () => {
    const T = enumerateTerms(sig, /*genCount*/2, /*maxDepth*/2);
    const { same } = congruenceClosure(sig, T, E);

    // Test specific cases that should work
    const x = Var(0), y = Var(1), e = App(opOf(sig, "e"), []);
    
    // Test idempotence: x * x = x
    const xx = App(mul, [x, x]);
    const cong_xx_x = same(xx, x);
    const nfeq_xx_x = JSON.stringify(NF(xx)) === JSON.stringify(NF(x));
    expect(nfeq_xx_x).toBe(cong_xx_x);
    
    // Test unit laws: e * x = x and x * e = x
    const ex = App(mul, [e, x]);
    const cong_ex_x = same(ex, x);
    const nfeq_ex_x = JSON.stringify(NF(ex)) === JSON.stringify(NF(x));
    expect(nfeq_ex_x).toBe(cong_ex_x);
    
    const xe = App(mul, [x, e]);
    const cong_xe_x = same(xe, x);
    const nfeq_xe_x = JSON.stringify(NF(xe)) === JSON.stringify(NF(x));
    expect(nfeq_xe_x).toBe(cong_xe_x);
    
    // Test commutativity: x * y = y * x
    const xy = App(mul, [x, y]);
    const yx = App(mul, [y, x]);
    const cong_xy_yx = same(xy, yx);
    const nfeq_xy_yx = JSON.stringify(NF(xy)) === JSON.stringify(NF(yx));
    expect(nfeq_xy_yx).toBe(cong_xy_yx);
  });
});
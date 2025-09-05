import { describe, it, expect } from "vitest";
import { Signature } from "../../Signature";
import { Var, App } from "../../Term";
import { UAAlgebra } from "../../Algebra";
import { ZmodAsMonoid } from "../../examples/MonoidSig";
import { uaModelToTAlgebra, tAlgebraToUA, checkHomCoincides } from "../Equivalence";

/** EM ↔ Lawvere models bridge for the monoid (assoc+unit) theory, executed on Z5. */
describe("Eilenberg–Moore vs UA models (monoid theory)", () => {
  const MonSig: Signature = { ops: [{ name:"e", arity:0 }, { name:"mul", arity:2 }] };
  const assoc = { lhs: App(MonSig.ops[1], [App(MonSig.ops[1], [Var(0),Var(1)]), Var(2)]),
                  rhs: App(MonSig.ops[1], [Var(0), App(MonSig.ops[1], [Var(1),Var(2)])]) };
  const leftU = { lhs: App(MonSig.ops[1], [App(MonSig.ops[0], []), Var(0)]), rhs: Var(0) };
  const rightU= { lhs: App(MonSig.ops[1], [Var(0), App(MonSig.ops[0], [])]), rhs: Var(0) };
  const E = [assoc,leftU,rightU];

  const A: UAAlgebra<number> = ZmodAsMonoid(5);
  const B: UAAlgebra<number> = ZmodAsMonoid(5);

  it("UA model → T-algebra → UA model (round trip on ops)", () => {
    const { Aset, alpha } = uaModelToTAlgebra(MonSig, E, A, 2);
    const Aback = tAlgebraToUA(MonSig, E, Aset, alpha, 2);

    for (const op of MonSig.ops) {
      // sample few arity-tuples
      const ar = op.arity;
      const vals = A.elems;
      const pick = vals.slice(0, Math.min(vals.length, 3));
      const tuples: number[][] = [];
      const mk = (i:number, acc:number[])=>{
        if (i===ar) { tuples.push(acc.slice()); return; }
        for (const v of pick) { acc[i]=v; mk(i+1, acc); }
      };
      mk(0, []);
      for (const t of tuples) {
        const lhs = (A.interpret(op) as any)(...t);
        const rhs = (Aback.interpret(op) as any)(...t);
        expect(A.eq(lhs, rhs)).toBe(true);
      }
    }
  });

  it("Homomorphisms coincide with T-algebra morphisms (example h(x)=2x mod 5)", () => {
    const h = (x:number)=> (2*x)%5;
    const { uaHom, tAlgHom } = checkHomCoincides(MonSig, E, A, B, h, 2);
    expect(uaHom).toBe(true);
    expect(tAlgHom).toBe(true);
  });
});
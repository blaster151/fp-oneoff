import { describe, it, expect } from "vitest";
import { MonoidSig } from "../../examples/MonoidSig";
import { buildLawvere } from "../Lawvere";
import { Var, App } from "../../Term";
import { opOf } from "../../Signature";
import { ZmodAsMonoid } from "../../examples/MonoidSig";
import { interpretInSet } from "../SetFunctor";

/** Use the (associative, unit) monoid theory; composition is substitution modulo ≡_E. */
describe("Lawvere theory: composition and Set interpretation (monoid)", () => {
  const sig = MonoidSig;
  const e = opOf(sig,"e");
  const mul = opOf(sig,"mul");

  // Equations: associativity and unit (no comm or idempotency needed here)
  const x = Var(0), y = Var(1), z = Var(2);
  const assoc = { lhs: App(mul,[App(mul,[x,y]), z]), rhs: App(mul,[x, App(mul,[y,z])]) };
  const leftU = { lhs: App(mul,[App(e,[]), x]), rhs: x };
  const rightU= { lhs: App(mul,[x, App(e,[])]), rhs: x };
  const E = [assoc,leftU,rightU];

  const L = buildLawvere(sig, E, /*maxDepth*/2);

  it("composition agrees with substitution modulo equations", () => {
    // r : 1→2  as <x, mul(x,x)>
    const r = [ Var(0), App(mul,[Var(0), Var(0)]) ];
    // s : 2→1  as <mul(x0, x1)>
    const s = [ App(mul, [Var(0), Var(1)]) ];

    // s ∘ r : 1→1  should be <mul( x, mul(x,x) )> reduced via assoc if needed
    const comp = L.compose(s, r);
    expect(comp.length).toBe(1);
    // Nothing deep to assert syntactically (since reduce chooses reps),
    // but we can test functorial semantics into a concrete algebra.

    const A = ZmodAsMonoid(5); // (Z5,+,0)
    const F = interpretInSet(L, A);

    const Fr = (t: number[]) => F.onMor(r)(t);
    const Fs = (t: number[]) => F.onMor(s)(t);
    const Fcomp = (t: number[]) => F.onMor(comp)(t);

    // pick an input to object 1 (i.e., a single element)
    const inp = [3];

    // F(s∘r)(3) = F(s)(F(r)(3))
    const lhs = Fcomp(inp)[0];
    const rhs = Fs(Fr(inp))[0];

    expect(A.eq(lhs, rhs)).toBe(true);
  });

  it("identity morphism acts as identity under interpretation", () => {
    const id1 = L.id(1);
    const A = ZmodAsMonoid(5);
    const F = interpretInSet(L, A);
    const f = F.onMor(id1);
    expect(A.eq(f([2])[0], 2)).toBe(true);
  });
});
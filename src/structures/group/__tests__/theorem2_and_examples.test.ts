import { describe, it, expect } from "vitest";
import { Zn } from "../Group";
import { hom, idHom, comp } from "../GrpCat";
import { injectiveOn, surjectiveTo, approxEq } from "../HomHelpers";
import { parityHom, Z_to_Q, R_to_Cstar_expix } from "../homs/Examples24";
import { FiniteGroup } from "../Group";

// ---------- Theorem 2: Hom category laws
describe("Theorem 2 (Grp homs form a category)", () => {
  it("(1) g∘f is a hom when types match; (2) composition associative; (3) identities", () => {
    const Z6 = Zn(6), Z3 = Zn(3), Z2 = Zn(2);

    const f = hom(Z6, Z3, x => x % 3);
    const g = hom(Z3, Z2, x => x % 2);
    const h = hom(Z2, Z2, x => x); // id

    // (1) closure under composition
    const g_of_f = comp(f,g);
    for (const x of Z6.elems) expect(Z2.eq(g_of_f.f(x), (x%3)%2)).toBe(true);

    // (2) associativity
    const left  = comp(g_of_f, h);     // h ∘ (g ∘ f)
    const right = comp(f, comp(g,h));  // (h ∘ g) ∘ f
    for (const x of Z6.elems) expect(Z2.eq(left.f(x), right.f(x))).toBe(true);

    // (3) identities
    const idZ6 = idHom(Z6), idZ3 = idHom(Z3);
    const f1 = comp(idZ6, f);
    const f2 = comp(f, idZ3);
    for (const x of Z6.elems) expect(Z3.eq(f1.f(x), f.f(x))).toBe(true);
    for (const x of Z6.elems) expect(Z3.eq(f2.f(x), f.f(x))).toBe(true);
  });
});

// ---------- Page examples (4)-(6)
describe("Examples 4–6 (page 12–13)", () => {
  it("(4) Z → two-object group by parity", () => {
    // target J: Z2 under addition (0 identity, 1 other)
    const Z2 = Zn(2) as unknown as FiniteGroup<unknown>;
    const φ = parityHom(Z2, 1);
    // Check hom law on a window of Z (domain is mod 12 in construction)
    for (const a of (φ.source.elems as number[])) for (const b of (φ.source.elems as number[])) {
      const lhs = φ.f(φ.source.op(a,b));
      const rhs = (Z2 as any).op(φ.f(a), φ.f(b));
      expect((Z2 as any).eq(lhs, rhs)).toBe(true);
    }
    // Surjective but not injective (on a small sample)
    const xs = [0,1,2,3,4,5,6,7];
    const eqZ2 = (a:any,b:any)=> (Z2 as any).eq(a,b);
    expect(surjectiveTo(xs, (Z2 as any).elems, φ.f as any, eqZ2)).toBe(true);
    expect(injectiveOn(xs, φ.f as any, eqZ2)).toBe(false);
  });

  it("(5) Z → Q via n ↦ n/1 is injective (on window) not surjective", () => {
    const ψ = Z_to_Q();
    // hom law on Z6-style window used inside Z_to_Q
    for (const a of ψ.source.elems) for (const b of ψ.source.elems) {
      expect(ψ.target.eq(ψ.f(ψ.source.op(a,b)), ψ.target.op(ψ.f(a), ψ.f(b)))).toBe(true);
    }
    const xs = [-5,-2,-1,0,1,2,5];
    const codSample = [-5,-2,-1,0,1,2,5, 1/2, 3/2]; // include rationals not of form n/1
    expect(injectiveOn(xs, ψ.f, ψ.target.eq)).toBe(true);
    expect(surjectiveTo(xs, codSample, ψ.f, ψ.target.eq)).toBe(false); // misses 1/2, 3/2, …
  });

  it("(6) j(x)=cos x + i sin x : (R,+)→(C*,×) is a hom; neither inj nor surj", () => {
    const samples = [0, Math.PI/3, Math.PI, 4*Math.PI/3, 2*Math.PI]; // enough to witness periodicity
    const j = R_to_Cstar_expix(samples);

    // Hom law: j(x+y)=j(x)⋅j(y) (≈ with epsilon)
    const eqC = (j.target.eq);
    for (const a of j.source.elems) for (const b of j.source.elems) {
      const lhs = j.f(j.source.op(a,b));
      const rhs = j.target.op(j.f(a), j.f(b));
      expect(eqC(lhs, rhs)).toBe(true);
    }

    // Not injective (x and x+2π collide)
    const approx = approxEq(1e-9);
    const collide = approx(samples[0] + 2*Math.PI, samples[samples.length-1]); // 0 vs 2π sample
    expect(collide).toBe(true);
    expect(eqC(j.f(0), j.f(2*Math.PI))).toBe(true);

    // Not surjective onto C*: image is unit circle; 2 ∉ image
    const two = { re: 2, im: 0 };
    const inImage = j.source.elems.some(x => eqC(j.f(x), two));
    expect(inImage).toBe(false);
  });
});
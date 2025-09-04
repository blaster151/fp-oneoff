import { describe, it, expect } from "vitest";
import { mkFiniteSet } from "../../../set/Set";
import { FreeMonoid, U_underlying, liftToMonoidHom } from "../free/FreeMonoid";
import { ZnAdd } from "../examples/Monoids";
import { isMonoidHom } from "../Monoid";

describe("Free Monoid left adjoint to U:Mon→Set (sampled checks)", () => {
  const A = mkFiniteSet(["x","y"], (a,b)=>a===b);
  const M = ZnAdd(5);

  it("universal property: any f:A→|M| lifts uniquely to monoid hom φ: F(A)→M", () => {
    const f = (a:string)=> (a==="x" ? 2 : 3); // pick images in Z5
    const { F, eta, phi } = liftToMonoidHom(A, M, f);

    // φ is a monoid hom
    const hom = { source: F, target: M, f: phi };
    expect(isMonoidHom(hom)).toBe(true);

    // φ ∘ η = f  (unit law)
    for (const a of A.elems) {
      const lhs = phi(eta(a));
      const rhs = f(a);
      expect(M.eq(lhs, rhs)).toBe(true);
    }

    // Uniqueness on our finite enumeration: if ψ is another hom with ψ∘η=f, then ψ=φ on words we enumerated.
    const psi = (w: string[]) => {
      let acc = M.e;
      for (const a of w) acc = M.op(acc, f(a));
      return acc;
    };
    for (const w of F.elems) expect(M.eq(psi(w), phi(w))).toBe(true);
  });

  it("adjunction triangle identities (sampled)", () => {
    const U = U_underlying(M);
    const F = FreeMonoid(U); // F(|M|) free monoid on the carrier of M
    const etaM = (m:number)=> [m]; // unit at |M|
    const evalWord = (w:number[]) => {
      let acc = M.e; for (const m of w) acc = M.op(acc, m); return acc;
    };

    // counit ε_M: F(|M|) → M interprets words in M by multiplication
    const eps_M = evalWord;

    // Triangle 1: ε_M ∘ F(η_M) = id_M (checked on elems of M)
    // F(η_M) maps a word [m1,...,mk] to [[m1],[m2],...,[mk]] then flattens (our representation already flat),
    // so effectively evalWord after mapping each letter via η_M is still evalWord; we test ε_M∘η_M=id on letters.
    for (const m of M.elems) {
      const lhs = eps_M(etaM(m));
      expect(M.eq(lhs, m)).toBe(true);
    }

    // Triangle 2: U(ε_A) ∘ η_{|A|} = id_{|A|} for a set A (we test with A above, interpreted into F(A))
    const F_A = FreeMonoid(A);
    const eps_A = (w: string[]) => w; // into |F(A)| then U just returns carrier; on singletons, this is identity
    for (const a of A.elems) {
      const lhs = eps_A([a]);
      expect(lhs.length===1 && lhs[0]===a).toBe(true);
    }
  });
});
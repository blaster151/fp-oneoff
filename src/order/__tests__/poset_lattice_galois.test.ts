import { describe, it, expect } from "vitest";
import { Poset, isPoset, posetEqFromLeq } from "../Poset";
import { powersetLattice, lfp } from "../Lattice";
import { GaloisConnection, isGalois, closureOnX } from "../Galois";

describe("Poset sanity (≤ on numbers)", () => {
  const E = [0,1,2,3];
  const P: Poset<number> = { elems:E, leq:(a,b)=>a<=b, eq:(a,b)=>a===b };
  it("poset laws hold", () => {
    expect(isPoset(P).ok).toBe(true);
  });
});

describe("Powerset lattice & lfp", () => {
  const U = [0,1,2];
  const L = powersetLattice(U, (a,b)=>a===b);

  it("boolean lattice has ⊥=∅ and ⊤=U", () => {
    expect(L.eq(L.bot, [])).toBe(true);
    expect(L.eq(L.top, U)).toBe(true);
  });

  it("lfp computes closure of a monotone function f(S)=S ∪ F(S)", () => {
    // monotone f: always add 0, then add 1 if 0 present, then add 2 if 1 present
    const f = (S:number[]) => {
      const out = S.slice();
      if (!out.includes(0)) out.push(0);
      if (out.includes(0) && !out.includes(1)) out.push(1);
      if (out.includes(1) && !out.includes(2)) out.push(2);
      return out;
    };
    const res = lfp(L, f);
    expect(L.eq(res, U)).toBe(true); // starting from ⊥, closure reaches all of U
  });
});

describe("Galois connection via relation image/preimage", () => {
  // X = P({a,b}), Y = P({1,2}); R = {(a,1),(b,2)}
  const XU = ["a","b"], YU = [1,2];
  const X = powersetLattice(XU, (x,y)=>x===y);
  const Y = powersetLattice(YU, (x,y)=>x===y);

  const R = new Map<string, number[]>([ ["a",[1]], ["b",[2]] ]);

  const alpha = (A:string[]) => { // forward image
    const out: number[] = [];
    for (const x of A) for (const y of (R.get(x) || []))
      if (!out.includes(y)) out.push(y);
    return out;
  };
  const gamma = (B:number[]) => { // inverse image
    const out: string[] = [];
    for (const x of XU) {
      const imgs = R.get(x) || [];
      if (imgs.some(y => B.includes(y))) out.push(x);
    }
    return out;
  };

  const G: GaloisConnection<string[], number[]> = { X, Y, alpha, gamma };

  it("satisfies α(x)≤y ⇔ x≤γ(y)", () => {
    expect(isGalois(G)).toBe(true);
  });

  it("closure γ∘α is inflationary, idempotent, monotone (sampled)", () => {
    const c = closureOnX(G);
    const A = ["a"];
    const cA = c(A);
    // inflationary: A ≤ c(A)
    expect(X.leq(A,cA)).toBe(true);
    // idempotent: c(c(A)) = c(A)
    expect(X.eq(c(cA), cA)).toBe(true);
    // monotone (sampled)
    const A2: string[] = [];
    const cA2 = c(A2);
    expect(X.leq(A2, A)).toBe(true);
    expect(X.leq(cA2, cA)).toBe(true);
  });
});
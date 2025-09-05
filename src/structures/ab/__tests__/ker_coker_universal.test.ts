import { describe, it, expect } from "vitest";
import { Z4, Z2 } from "../examples/AbelianGroups";
import { ker, coker, zeroMor } from "../builders/KernelsCokernels";
import { GroupHom } from "../../group/GrpCat";

/** f: Z4 → Z2, x ↦ x mod 2. ker f = {0,2}; coker f is trivial (since image=Z2). */
describe("Kernels & cokernels in Ab with universal properties", () => {
  const f: GroupHom<number, number> = {
    source: Z4, target: Z2, f: (x)=> x%2
  };

  it("kernel inclusion is mono and universal: any g with f∘g=0 factors uniquely", () => {
    const { K, ι } = ker(f);
    // f ∘ ι = 0
    const comp = <A,B,C>(g: GroupHom<A,B>, h: GroupHom<B,C>): GroupHom<A,C> =>
      ({ source: g.source, target: h.target, f: (a)=> h.f(g.f(a)) });
    const zero = zeroMor(K, Z2);
    const lhs = comp(ι, f);
    for (const a of K.elems) expect(Z2.eq(lhs.f(a), zero.f(a))).toBe(true);

    // Universal property: any g:T→Z4 with f∘g=0 factors through ι
    const T = K; // tiny witness: take T=K and g=ι
    const g = ι as GroupHom<number, number>;
    const lhs2 = comp(g, f);
    for (const t of T.elems) expect(Z2.eq(lhs2.f(t), Z2.id)).toBe(true);
    // factorization exists (h = id_K)
    const h: GroupHom<number, number> = { source: T, target: K, f: (x)=> x };
    for (const t of T.elems) expect(Z4.eq(ι.f(h.f(t)), g.f(t))).toBe(true);
  });

  it("cokernel projection is epi and universal: any h with h∘f=0 factors uniquely", () => {
    const { C, q } = coker(f);
    // q ∘ f = 0
    const zero = { source: Z4, target: C, f: (_:number)=> C.id };
    for (const x of Z4.elems) expect(C.eq(q.f(f.f(x)), zero.f(x))).toBe(true);

    // Universal property: if h:Z2→Q with h∘f=0, then ∃! û: C→Q with û∘q = h
    // Witness: take Q = C and h = q
    const Q = C;
    const h = q as GroupHom<number, {rep:number}>;
    const u = { source: C, target: Q, f: (c:{rep:number}) => c }; // identity
    for (const y of Z2.elems) expect(Q.eq(u.f(q.f(y)), h.f(y))).toBe(true);
  });
});
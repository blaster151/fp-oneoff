import { describe, it, expect } from "vitest";
import { Z2, Z3, directSum } from "../examples/AbelianGroups";
import { tupleScheme } from "../../group/pairing/PairingScheme";
import { biproduct } from "../builders/Biproduct";
import { GroupHom } from "../../group/Group";

// extensional hom equality on a finite source
function homEq<A,B>(h1: GroupHom<A,B>, h2: GroupHom<A,B>): boolean {
  for (const a of h1.source.elems) if (!h1.target.eq(h1.f(a), h2.f(a))) return false;
  return true;
}

describe("Abelian groups + biproduct (direct sum)", () => {
  it("Z2, Z3 are abelian and direct sum is abelian of size 6", () => {
    const G = Z2, H = Z3;
    const GH = directSum(G, H, tupleScheme());
    expect(GH.elems.length).toBe(6);
    // commutativity sample
    for (const x of GH.elems) for (const y of GH.elems) {
      expect(GH.eq(GH.op(x,y), GH.op(y,x))).toBe(true);
    }
  });

  it("Biproduct equations: p1∘i1=id_G, p2∘i2=id_H, p1∘i2=0, p2∘i1=0, and i1∘p1 + i2∘p2 = id", () => {
    const G = Z2, H = Z3;
    const S = tupleScheme<number,number>();
    const { GH, i1, i2, p1, p2 } = biproduct(G, H, S);

    const comp = <A,B,C>(f: GroupHom<A,B>, g: GroupHom<B,C>): GroupHom<A,C> =>
      ({ source: f.source, target: g.target, f: (a)=> g.f(f.f(a)) });
    const id = <A>(G0: typeof G): GroupHom<A,A> => ({ source:G0 as any, target:G0 as any, f:(a:A)=>a });

    // p1∘i1 = id_G, p2∘i2 = id_H
    expect(homEq(comp(i1, p1) as any, id(G))).toBe(true);
    expect(homEq(comp(i2, p2) as any, id(H))).toBe(true);

    // p1∘i2 = 0, p2∘i1 = 0
    const zeroG_H: GroupHom<number,number> = { source:H, target:G, f: (_)=> G.id };
    const zeroH_G: GroupHom<number,number> = { source:G, target:H, f: (_)=> H.id };
    expect(homEq(comp(i2, p1) as any, zeroG_H as any)).toBe(true);
    expect(homEq(comp(i1, p2) as any, zeroH_G as any)).toBe(true);

    // i1∘p1 + i2∘p2 = id_{G⊕H} (pointwise)
    const sum = (h:GroupHom<any, any>, k:GroupHom<any, any>): GroupHom<any, any> => ({
      source: h.source, target: h.target,
      f: (o:any)=> GH.op(h.f(o), k.f(o))
    });
    const idGH: GroupHom<any, any> = { source: GH as any, target: GH as any, f: (o:any)=> o };
    expect(homEq(sum(comp(p1 as any, i1 as any), comp(p2 as any, i2 as any)), idGH)).toBe(true);
  });
});
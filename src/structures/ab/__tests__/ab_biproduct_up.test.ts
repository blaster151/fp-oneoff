import { describe, it, expect } from "vitest";
import { Zn } from "../../group/util/FiniteGroups";
import { asAbelian } from "../AbGroup";
import { biproduct, productLift, coproductLift } from "../AbCategory";
import { tupleScheme } from "../../group/pairing/PairingScheme";

function homEq<A,B>(H:any, f:any, g:any): boolean {
  for (const a of f.source.elems) if (!H.eq(f.f(a), g.f(a))) return false;
  return true;
}

describe("Biproduct universal properties (product and coproduct) in Ab", () => {
  const G = asAbelian(Zn(2));
  const H = asAbelian(Zn(3));
  const S = tupleScheme<number,number>();

  it("product U.P.: unique pairing ⟨p,q⟩", () => {
    const X = asAbelian(Zn(4));
    const p = { source:X, target:G, f:(x:number)=> x%2 };
    const q = { source:X, target:H, f:(x:number)=> x%3 };

    const { GH, pair } = productLift(X,G,H,p,q);
    const { p1, p2 } = biproduct(G,H);

    // projections equal given legs
    expect(homEq(G, {source:X,target:G,f:(x:number)=>p1.f(pair.f(x))}, p)).toBe(true);
    expect(homEq(H, {source:X,target:H,f:(x:number)=>p2.f(pair.f(x))}, q)).toBe(true);

    // uniqueness on finite carriers
    const pair2 = { source:X, target:GH, f:(x:number)=> S.pair(p.f(x), q.f(x)) };
    expect(homEq(GH, pair, pair2)).toBe(true);
  });

  it("coproduct U.P.: unique copair [f,g]", () => {
    const Y = asAbelian(Zn(6));
    const f = { source:G, target:Y, f:(u:number)=> u };
    const g = { source:H, target:Y, f:(v:number)=> (2*v)%6 };

    const { GH, copair } = coproductLift(G,H,Y,f,g);
    const { i1, i2 } = biproduct(G,H);

    // copair∘i1 = f, copair∘i2 = g
    const comp = <A,B,C>(h1:any,h2:any)=> ({ source:h1.source, target:h2.target, f:(a:A)=>h2.f(h1.f(a)) });
    expect(homEq(Y, comp(i1,copair), f)).toBe(true);
    expect(homEq(Y, comp(i2,copair), g)).toBe(true);
  });
});
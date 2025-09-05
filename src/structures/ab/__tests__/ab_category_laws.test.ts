import { describe, it, expect } from "vitest";
import { Zn } from "../../group/util/FiniteGroups";
import { asAbelian } from "../AbGroup";
import { id, compose, zero, zeroObject } from "../AbCategory";

describe("Ab as a Category: identities, composition, zero", () => {
  const Z4 = asAbelian(Zn(4));
  const Z2 = asAbelian(Zn(2));

  const f = { source: Z4, target: Z2, f: (x:number)=> x%2 };
  const g = { source: Z2, target: Z4, f: (y:number)=> (y*2)%4 };

  it("identities and associativity", () => {
    const id4 = id(Z4), id2 = id(Z2);
    // id ∘ f = f and f ∘ id = f
    const comp = <A,B,C>(u:any,v:any)=> ({ source:u.source, target:v.target, f:(a:A)=>v.f(u.f(a)) });
    for (const x of Z4.elems) expect(Z2.eq(comp(id4,f).f(x), f.f(x))).toBe(true);
    for (const x of Z4.elems) expect(Z2.eq(comp(f,id2).f(x), f.f(x))).toBe(true);
    // associativity (g ∘ f) ∘ id = g ∘ (f ∘ id)
    const left = comp(comp(id4,f), g);
    const right = comp(id4, comp(f,g));
    for (const x of Z4.elems) expect(Z4.eq(left.f(x), right.f(x))).toBe(true);
  });

  it("zero object and zero morphisms", () => {
    const zeroObj = zeroObject();
    const z = zero(Z4,Z2);
    for (const x of Z4.elems) expect(Z2.eq(z.f(x), Z2.id)).toBe(true);
    expect(zeroObj.elems.length).toBe(1);
  });
});
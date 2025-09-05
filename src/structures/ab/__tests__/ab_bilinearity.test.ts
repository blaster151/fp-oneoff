import { describe, it, expect } from "vitest";
import { Zn } from "../../group/util/FiniteGroups";
import { asAbelian, homAdd, homNeg, zeroHom } from "../AbGroup";
import { id } from "../AbCategory";

describe("Preadditive bilinearity: h∘(f+g) = h∘f + h∘g and (f+g)∘k = f∘k + g∘k", () => {
  const A = asAbelian(Zn(2));
  const B = asAbelian(Zn(2));
  const C = asAbelian(Zn(2));

  const f = { source:A, target:B, f:(x:number)=> x };
  const g = { source:A, target:B, f:(x:number)=> 0 };
  const h = { source:B, target:C, f:(y:number)=> y };

  const comp = <X,Y,Z>(u:any,v:any)=> ({ source:u.source, target:v.target, f:(x:X)=> v.f(u.f(x)) });

  it("right bilinear", () => {
    const fg = homAdd(f,g,B);
    const left = comp(fg, h);
    const right = homAdd(comp(f,h), comp(g,h), C);
    for (const a of A.elems) expect(C.eq(left.f(a), right.f(a))).toBe(true);
  });

  it("left bilinear", () => {
    const fg = homAdd(f,g,B);
    const idA = id(A);
    const left = comp(idA, fg);
    const right = homAdd(comp(idA,f), comp(idA,g), B);
    for (const a of A.elems) expect(B.eq(left.f(a), right.f(a))).toBe(true);
  });
});
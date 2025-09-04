import { describe, it, expect } from "vitest";
import { fromNumber, Z, S } from "../Nat";
import { Vec, vnil, vcons, length, toArray } from "../Vec";
import { vecConViaLan, Pair } from "../Vec.Lan";
import type { Lan1 } from "../../../category/Lan";
import { refl } from "../../../category/Eq";

/** Lan builders for vectors: for c = S n, either produce head+tail */
function lanVec<A,N>(head:A, tail:any): Lan1<typeof S, {fst:A; snd:any}, any> {
  return <B>(_eq:any) => ({ fst: head, snd: tail });
}

describe("Vec (length-indexed vectors) via higher-order fixpoint + Lan", () => {
  it("vnil has length 0; vcons builds length 1 and 2", () => {
    const xs0 = vnil<number>();
    expect(length(xs0)).toBe(0);

    const one = fromNumber(1);
    const xs1 = vcons(one as any, 7, xs0 as any);
    expect(length(xs1)).toBe(1);
    expect(toArray(xs1)).toEqual([7]);

    const two = fromNumber(2);
    const xs2 = vcons(two as any, 9, xs1 as any);
    expect(length(xs2)).toBe(2);
    expect(toArray(xs2)).toEqual([9,7]);
  });

  it("vecConViaLan cons-es using Lan S (Pair A, Vec n A)", () => {
    const n = fromNumber(1);           // n = S Z
    const c = S(n);                    // S n
    const tail = vcons(n as any, 1, vnil<number>() as any); // length 1
    const lan = lanVec<number, any>(2, tail);               // head=2, tail=length 1
    const xs = vecConViaLan<number, any>(c as any, lan);
    expect(length(xs)).toBe(2);
    expect(toArray(xs)).toEqual([2,1]);
  });
});
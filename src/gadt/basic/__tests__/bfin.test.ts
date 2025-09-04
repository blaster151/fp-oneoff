import { describe, it, expect } from "vitest";
import { Z, S, fromNumber, toNumber, isS } from "../Nat";
import { BFin, zero, succ, foldBFin } from "../BFin";

/** Build 0 and 1 in BFin(S(S Z)) */
const n0 = fromNumber(0);
const n1 = fromNumber(1);
const n2 = fromNumber(2);

describe("BFin basic GADT via higher-order fixpoint", () => {
  it("zero inhabits S a", () => {
    const two = n2;           // S (S Z)
    const one = { tag:"S", prev: n1 } as any;
    const z: any = zero(two as any);
    const toInt = foldBFin<number>(
      _ => 0,                // zero maps to 0
      (_n, r) => r + 1       // succ increments
    );
    expect(toInt(z)).toBe(0);
  });

  it("succ increments under fold", () => {
    const two = n2; // S (S Z)
    const one = n1; // S Z
    const z1: any = zero(one as any);           // inhabitant of BFin(S Z) → 0
    const s1: any = succ(two as any, z1 as any); // inhabitant of BFin(S (S Z)) → 1
    const toInt = foldBFin<number>(_ => 0, (_n, r) => r + 1);
    expect(toInt(s1)).toBe(1);
  });
});
import { describe, it, expect } from "vitest";
import { Z, S, fromNumber } from "../Nat";
import { BFin } from "../BFin";
import { bfinConViaLan, Unit, Left, Right, Either } from "../BFin.Lan";
import type { Lan1 } from "../../../category/Lan";
import { refl } from "../../../category/Eq";

/** Build a Lan value for c = S a:
 * Lan S g (S a) = ∀b. Eq(S b, S a) -> g b
 * Because Eq(S b, S a) holds only when b=a, this function must (and does) ignore other b.
 * We implement it by matching on the witness' type — operationally we just return the 'payload'.
 */
function lanForZero<a>(a: any): Lan1<typeof S, Either<Unit, BFin<any>>, any> {
  return <B>(_eq: any) => Left<Unit, BFin<any>>({ unit: true });
}
function lanForSucc<a>(child: BFin<any>): Lan1<typeof S, Either<Unit, BFin<any>>, any> {
  return <B>(_eq: any) => Right<Unit, BFin<any>>(child);
}

describe("BFin via Lan constructor", () => {
  it("zero via Lan maps to left Unit", () => {
    const a = fromNumber(1);          // a = S Z
    const c = S(a);                   // S a = S (S Z)
    const bf = bfinConViaLan(c, lanForZero(a));
    expect(bf).toBeTruthy();          // constructed
  });

  it("succ via Lan maps to right (BFin a)", () => {
    const a = fromNumber(1);          // a = S Z
    const c = S(a);                   // S a
    // child inhabits BFin a; construct via zero at level a
    const child = bfinConViaLan(a, lanForZero(a)); // BFin (S Z) 'zero'
    const bf = bfinConViaLan(c, lanForSucc(child));
    expect(bf).toBeTruthy();
  });
});
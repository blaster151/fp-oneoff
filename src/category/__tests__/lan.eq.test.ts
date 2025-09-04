import { describe, it, expect } from "vitest";
import { Lan1 } from "../Lan";
import { Eq, refl } from "../Eq";

/** Example:
 * h<X> = X (identity), g<X> = {box:X}, c = number
 * Lan h g c ~ ∀b. Eq<b, number> -> {box:b}
 */
type Box<A> = { box: A };

const mkLan: Lan1<number, Box<number>, number> =
  (e: Eq<number, number>) => ({ box: e.cast(123) });

describe("Lan via Eq: smoke test", () => {
  it("construct and use Lan (Id along Id)", () => {
    const e = refl<number>();
    const val = mkLan(e);   // Box<number>
    expect(val.box).toBe(123);
  });
});
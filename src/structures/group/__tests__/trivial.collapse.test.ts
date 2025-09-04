import { describe, it, expect } from "vitest";
import { Zn, trivial } from "../Group";
import { toTrivial, fromTrivial, collapse, hom } from "../GrpCat";

describe("Trivial maps", () => {
  it("unique homs to/from 1", () => {
    const Z5 = Zn(5);
    const one = trivial(Z5.id, Z5.eq);

    const f = toTrivial(Z5); // Z5 -> 1
    const g = fromTrivial(Z5); // 1 -> Z5
    expect(f.verify?.()).toBe(true);
    expect(g.verify?.()).toBe(true);

    // uniqueness up to function extensionality is obvious in finite enumeration
    for (const a of Z5.elems) expect(one.eq(f.f(a), one.id)).toBe(true);
  });

  it("collapse hom sends everything to identity and is a hom", () => {
    const Z4 = Zn(4);
    const c = collapse(Z4);
    expect(c.verify?.()).toBe(true);
    for (const x of Z4.elems) expect(Z4.eq(c.f(x), Z4.id)).toBe(true);
  });
});
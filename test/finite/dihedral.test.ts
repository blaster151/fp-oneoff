import { Dn } from "../../src/algebra/group/finite/Dihedral";
import { isLatinSquare } from "../../src/algebra/group/iso/CanonicalTable";

describe("Dn", () => {
  it("D4 has size 8 and basic relations", () => {
    const t = Dn(4);
    expect(t.length).toBe(8);
    expect(isLatinSquare(t)).toBe(true);

    // identity should be (0,0) = index 0
    const e = 0;
    for (let a = 0; a < 8; a++) {
      expect(t[e]![a]).toBe(a);
      expect(t[a]![e]).toBe(a);
    }

    // r = (1,0) has order 4; s = (0,1) has order 2; s r s = r^{-1}
    const r = 1, s = 4; // because (i,f) pack: (1,0)->1 ; (0,1)->4
    // r^4 = e
    let x = r;
    for (let i = 0; i < 3; i++) x = t[x]![r]!;
    expect(x).toBe(e);
    // s^2 = e
    expect(t[s]![s]).toBe(e);
    // s r s = r^{-1} = r^3
    const rinv = 3; // r^3
    expect(t[t[s]![r]!]![s]).toBe(rinv);
  });
});
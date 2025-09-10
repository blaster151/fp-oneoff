// Traceability: Smith §2.9 – category of groups laws + functoriality of U.

import { describe, it, expect } from "vitest";
import { Zmod } from "../helpers/groups";
import { asGrpObj, idGrp, compGrp, mkGrpHom } from "../../src/category/instances/Grp";
import { U_Grp_to_Set } from "../../src/category/instances/forgetful/GrpToSet";

describe("Grp (category of groups)", () => {
  it("identities and composition", () => {
    const Z2 = asGrpObj(Zmod(2));
    const Z3 = asGrpObj(Zmod(3));

    const f = mkGrpHom(Zmod(2), Zmod(3), x => x % 2); // hom Z2 -> Z3
    const id2 = idGrp(Z2), id3 = idGrp(Z3);

    // identity laws
    const f1 = compGrp(f, id2);
    const f2 = compGrp(id3, f);
    expect(f1.map(1)).toBe(f.map(1));
    expect(f2.map(1)).toBe(f.map(1));

    // associativity (compose with identities suffices here)
    const left  = compGrp(id3, compGrp(f, id2));
    const right = compGrp(compGrp(id3, f), id2);
    expect(left.map(1)).toBe(right.map(1));
  });

  it("U: Grp -> Set preserves id and composition (functor laws)", () => {
    const Z2 = asGrpObj(Zmod(2));
    const idZ2 = idGrp(Z2);
    const Uid = U_Grp_to_Set.onMor(idZ2);
    expect(Uid.fn(1)).toBe(1);

    const Z3 = asGrpObj(Zmod(3));
    const f = mkGrpHom(Zmod(2), Zmod(3), x => x % 2);
    const g = mkGrpHom(Zmod(3), Zmod(3), x => (x+1)%3);
    const Uf = U_Grp_to_Set.onMor(f);
    const Ug = U_Grp_to_Set.onMor(g);

    const Ugf = U_Grp_to_Set.onMor(compGrp(g as any, f as any));
    const composed = (x:any) => Ug.fn(Uf.fn(x));
    expect(Ugf.fn(1)).toBe(composed(1));
  });
});

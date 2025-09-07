import { lookupIsoClass } from "../../src/algebra/group/iso/Catalog";
import { V4, Cn } from "../../src/algebra/group/finite/StandardGroups";
import { Dn } from "../../src/algebra/group/finite/Dihedral";

describe("Iso catalog", () => {
  it("labels V4 and C4 distinctly", () => {
    expect(lookupIsoClass(V4())?.name).toMatch(/V4/);
    expect(lookupIsoClass(Cn(4))?.name).toMatch(/C4/);
  });

  it("recognizes D4", () => {
    expect(lookupIsoClass(Dn(4))?.name).toMatch(/D4/);
  });

  it("provides enhanced metadata for V4", () => {
    const v4Info = lookupIsoClass(V4());
    expect(v4Info?.properties).toContain("abelian");
    expect(v4Info?.properties).toContain("non-cyclic");
    expect(v4Info?.crossRef).toMatch(/iso-automorphism\.md/);
  });

  it("distinguishes abelian from non-abelian groups", () => {
    const v4Info = lookupIsoClass(V4());
    const d4Info = lookupIsoClass(Dn(4));
    
    expect(v4Info?.properties).toContain("abelian");
    expect(d4Info?.properties).toContain("non-abelian");
  });
});
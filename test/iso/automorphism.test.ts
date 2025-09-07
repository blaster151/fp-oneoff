import { V4 } from "../../src/algebra/group/finite/StandardGroups";
import { Cn } from "../../src/algebra/group/finite/StandardGroups";
import { automorphisms, autGroupTable } from "../../src/algebra/group/iso/Automorphism";
import { isLatinSquare } from "../../src/algebra/group/iso/CanonicalTable";

describe("Automorphism groups (small)", () => {
  it("Aut(V4) has size 6 and forms a group (isomorphic to S3)", () => {
    const autos = automorphisms(V4());
    expect(autos.length).toBe(6);
    const table = autGroupTable(autos);
    expect(isLatinSquare(table)).toBe(true);
  });

  it("Aut(C4) has size φ(4)=2", () => {
    const autos = automorphisms(Cn(4));
    expect(autos.length).toBe(2);
  });

  it("Aut(C5) has size φ(5)=4", () => {
    const autos = automorphisms(Cn(5));
    expect(autos.length).toBe(4);
  });
});
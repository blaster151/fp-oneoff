import { IsoClass } from "../../src/algebra/group/iso/IsoClass";
import { V4, Cn } from "../../src/algebra/group/finite/StandardGroups";

describe("IsoClass: Klein four examples", () => {
  it("V4 vs another V4 presentation are equal up to relabeling", () => {
    const v4a = new IsoClass(V4());
    // Make a relabeled copy by swapping element names (0 1 2 3) -> (0 2 1 3)
    const t = V4();
    const p = [0,2,1,3];
    const t2 = t.map((row, i) => p.map((_, j) => p[t[p.indexOf(i)][p.indexOf(j)]]));
    const v4b = new IsoClass(t2);
    expect(v4a.equals(v4b)).toBe(true);
  });

  it("C4 is not isomorphic to V4 (different canonical keys)", () => {
    const c4 = new IsoClass(Cn(4));
    const v4 = new IsoClass(V4());
    expect(c4.equals(v4)).toBe(false);
  });
});
import { describe, it, expect } from "vitest";
import { Z8 } from "../util/FiniteGroups";
import { subgroupFromPredicate, isSubgroup } from "../Subgroup";

describe("Subgroup from predicate (even integers mod 8)", () => {
  const G = Z8;
  const even = (x: number) => x % 2 === 0;
  const S = subgroupFromPredicate(G, even);

  it("carrier & identity", () => {
    expect(S.elems.sort()).toEqual([0, 2, 4, 6]);
    expect(S.id).toBe(0);
  });

  it("closure checks (implicit by builder) and inclusion", () => {
    expect(isSubgroup(G, S)).toBe(true);
    // sample op/ inv remain from G
    expect(S.op(2, 6)).toBe(0);
    expect(S.inv(2)).toBe(6);
  });
});
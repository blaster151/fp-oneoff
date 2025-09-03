import { describe, it, expect } from "vitest";
import { mkCodensityMonad } from "../codensity-monad.js";
import { MiniFinSet, G_inclusion } from "../mini-finset.js";
import { SetObj } from "../catkit-kan.js";
import {
  ultrafilterFromCodensity,
  principalUltrafilter,
  verifyUltrafilterLaws,
  verifyPrincipalProperty,
  subset, inter, union, compl,
  allSubsets,
  demonstrateUltrafilter
} from "../ultrafilter.js";

describe("Ultrafilters from Codensity of FinSet→Set (finite, principal)", () => {
  it("η_A(a) yields the principal ultrafilter at a", () => {
    const { of } = mkCodensityMonad(MiniFinSet, G_inclusion);

    const A: SetObj<string> = {
      id: "A",
      elems: ["a", "b", "c"],
      eq: (x, y) => x === y
    };
    
    const a0 = "b";

    const t = of(A)(a0); // η_A("b")
    const U = ultrafilterFromCodensity<string>(A, t);
    const P = principalUltrafilter<string>(A, a0);

    // Test singletons
    expect(U.contains(subset([a0]))).toBe(true); // Should contain {b}
    expect(U.contains(subset(["a"]))).toBe(false); // Should not contain {a}
    expect(U.contains(subset(["c"]))).toBe(false); // Should not contain {c}

    // Test all subsets systematically
    const allSubs = [
      subset<string>([]),
      subset(["a"]), subset(["b"]), subset(["c"]),
      subset(["a","b"]), subset(["a","c"]), subset(["b","c"]),
      subset(["a","b","c"]),
    ];
    
    console.log(`     Testing principal ultrafilter at "${a0}":`);
    
    for (const S of allSubs) {
      const UcontainsS = U.contains(S);
      const PcontainsS = P.contains(S);
      
      expect(UcontainsS).toBe(PcontainsS);
      
      console.log(`       U({${[...S].join(', ')}}) = ${UcontainsS} ✅`);
    }

    expect(U.isPrincipal).toBe(true);
    expect(U.principalWitness).toBe(a0);
    
    console.log(`     Principal ultrafilter verified: witness = "${a0}" ✅`);
  });

  it("Ultrafilter laws hold for η(a): upward closure, finite intersection, and prime", () => {
    const { of } = mkCodensityMonad(MiniFinSet, G_inclusion);
    
    const A: SetObj<number> = {
      id: "A",
      elems: [0, 1, 2, 3],
      eq: (a, b) => a === b
    };
    
    const a0 = 2;
    const t = of(A)(a0);
    const U = ultrafilterFromCodensity<number>(A, t);

    // Test specific subsets
    const S = subset([2, 3]);
    const T = subset([1, 2]);
    const intersection = inter(S, T); // {2}
    const unionST = union(S, T); // {1, 2, 3}
    const superset = subset([0, 2, 3]); // superset of S

    console.log('     Testing ultrafilter laws:');

    // Upward closure: S ⊆ Sup ∧ U(S) ⇒ U(Sup)
    if (U.contains(S)) {
      expect(U.contains(superset)).toBe(true);
      console.log('       Upward closure: ✅');
    }

    // Closed under finite intersection: U(S) ∧ U(T) ⇔ U(S ∩ T)
    const containsS = U.contains(S);
    const containsT = U.contains(T);
    const containsIntersection = U.contains(intersection);
    
    expect(containsS && containsT).toBe(containsIntersection);
    console.log(`       Intersection: U(S)=${containsS}, U(T)=${containsT}, U(S∩T)=${containsIntersection} ✅`);

    // Prime property: U(S ∪ T) ⇔ U(S) ∨ U(T)
    const containsUnion = U.contains(unionST);
    expect(containsUnion).toBe(containsS || containsT);
    console.log(`       Prime: U(S∪T)=${containsUnion}, U(S)∨U(T)=${containsS || containsT} ✅`);
    
    // Comprehensive law verification
    const lawCheck = verifyUltrafilterLaws(A, U);
    expect(lawCheck.valid).toBe(true);
    console.log(`       All ultrafilter laws: ${lawCheck.valid ? '✅' : '❌'}`);
    
    if (!lawCheck.valid) {
      lawCheck.violations.forEach(v => console.log(`         ${v}`));
    }
  });

  it("Exactly one singleton is in U for η(a)", () => {
    const { of } = mkCodensityMonad(MiniFinSet, G_inclusion);
    
    const A: SetObj<string> = {
      id: "A",
      elems: ["x", "y", "z"],
      eq: (a, b) => a === b
    };
    
    const a0 = "y";
    const t = of(A)(a0);
    const U = ultrafilterFromCodensity<string>(A, t);

    // Test all singletons
    const singletons = A.elems.map(v => subset([v]));
    const containedSingletons = singletons.filter(S => U.contains(S));
    
    console.log('     Testing singleton membership:');
    singletons.forEach((S, i) => {
      const element = A.elems[i]!;
      const contained = U.contains(S);
      console.log(`       U({${element}}) = ${contained} ${element === a0 ? '✅' : contained ? '❌' : '✅'}`);
    });

    expect(containedSingletons.length).toBe(1);
    expect(U.contains(subset([a0]))).toBe(true);
    
    console.log(`     Exactly one singleton ({${a0}}) in ultrafilter ✅`);
  });

  it("verifyPrincipalProperty works for all elements", () => {
    const A: SetObj<number> = {
      id: "A",
      elems: [1, 2],
      eq: (a, b) => a === b
    };

    const verification = verifyPrincipalProperty(A);
    
    expect(verification.verified).toBe(true);
    expect(verification.details.length).toBe(A.elems.length);
    
    console.log('     Principal property verification:');
    verification.details.forEach(detail => {
      console.log(`       Element ${detail.element}: principal=${detail.isPrincipal}, witness=${detail.witness}, agrees=${detail.agreesWithPrincipal} ✅`);
    });
  });

  it("ultrafilter laws verification works", () => {
    const A: SetObj<boolean> = {
      id: "A",
      elems: [true, false],
      eq: (a, b) => a === b
    };

    // Test with principal ultrafilter at true
    const U = principalUltrafilter(A, true);
    const lawCheck = verifyUltrafilterLaws(A, U);
    
    expect(lawCheck.valid).toBe(true);
    expect(lawCheck.violations.length).toBe(0);
    
    console.log('     Ultrafilter laws for principal at true:');
    console.log(`       Valid: ${lawCheck.valid ? '✅' : '❌'}`);
    console.log(`       Violations: ${lawCheck.violations.length}`);
  });

  it("all subsets enumeration works correctly", () => {
    const A: SetObj<string> = {
      id: "A",
      elems: ["x", "y"],
      eq: (a, b) => a === b
    };

    const subsets = allSubsets(A);
    
    // Should have 2^|A| = 2^2 = 4 subsets
    expect(subsets.length).toBe(4);
    
    // Verify specific subsets exist
    const expectedSubsets = [
      new Set<string>([]),           // ∅
      new Set<string>(["x"]),        // {x}
      new Set<string>(["y"]),        // {y}  
      new Set<string>(["x", "y"])    // {x,y}
    ];
    
    expectedSubsets.forEach(expected => {
      const found = subsets.some(actual => 
        actual.size === expected.size && 
        [...expected].every(x => actual.has(x))
      );
      expect(found).toBe(true);
    });
    
    console.log(`     All subsets of {x,y}: ${subsets.length} subsets ✅`);
    subsets.forEach(S => {
      console.log(`       {${[...S].join(', ')}}`);
    });
  });

  it("demonstration function runs without errors", () => {
    expect(() => {
      demonstrateUltrafilter();
    }).not.toThrow();
  });
});
import { describe, it, expect } from "vitest";
import { SetObj } from "../catkit-kan.js";
import { 
  MiniFinSet, 
  G_inclusion, 
  chi, 
  pairTo2x2, 
  and2, 
  or2, 
  not2,
  xor2,
  nand2,
  BoolMorphisms 
} from "../mini-finset.js";
import { endToNat } from "../codensity-nat-bridge.js";
import { UF } from "../ultrafilter-monad.js";

describe("Naturality yields boolean laws for ultrafilters (no principal witness used)", () => {
  it("Complement: U(A\\S) = ¬ U(S) via naturality with not : 2→2", () => {
    // Use object "3" with elements [0,1,2]
    const A: SetObj<number> = {
      id: "A",
      elems: [0, 1, 2],
      eq: (a, b) => a === b
    };
    
    const t = UF.of(A)(1); // Principal ultrafilter at 1

    const alpha = endToNat(MiniFinSet, A, G_inclusion, t);

    const S = new Set([0, 2]); // Subset not containing 1
    const chiS = chi("3", S);
    const US = alpha.at("2")(chiS.fn as any);

    console.log('     Testing complement law via naturality:');
    console.log(`       S = {${[...S].join(', ')}} (doesn't contain 1)`);
    console.log(`       U(S) = ${US}`);

    // Complement via not ∘ χ_S
    const notChiS = (a: number) => not2.fn(chiS.fn(a));
    const UcompS = alpha.at("2")(notChiS);

    console.log(`       U(A\\S) via ¬ ∘ χ_S = ${UcompS}`);
    console.log(`       ¬U(S) = ${!US}`);
    console.log(`       Complement law holds: ${UcompS === !US ? '✅' : '❌'}`);

    expect(UcompS).toBe(!US);
  });

  it("Union: U(S ∪ T) = U(S) ∨ U(T) via naturality with or : 2×2→2", () => {
    const A: SetObj<number> = {
      id: "A",
      elems: [0, 1, 2],
      eq: (a, b) => a === b
    };
    
    const t = UF.of(A)(1); // Principal ultrafilter at 1
    const alpha = endToNat(MiniFinSet, A, G_inclusion, t);

    const S = new Set([1, 2]); // Contains 1
    const T = new Set([0, 1]); // Contains 1
    const union = new Set([0, 1, 2]); // S ∪ T

    console.log('     Testing union law via naturality:');
    console.log(`       S = {${[...S].join(', ')}}`);
    console.log(`       T = {${[...T].join(', ')}}`);
    console.log(`       S ∪ T = {${[...union].join(', ')}}`);

    const chiS = chi("3", S);
    const chiT = chi("3", T);
    const pair = pairTo2x2("3", chiS, chiT);

    // Left side: U(S ∪ T) via or ∘ ⟨χ_S, χ_T⟩
    const left = alpha.at("2")((a: number) => or2.fn(pair.fn(a)));
    
    // Right side: U(S) ∨ U(T) computed separately
    const US = alpha.at("2")(chiS.fn as any);
    const UT = alpha.at("2")(chiT.fn as any);
    const right = (US === true) || (UT === true);

    console.log(`       U(S ∪ T) via ∨ ∘ ⟨χ_S, χ_T⟩ = ${left}`);
    console.log(`       U(S) ∨ U(T) = ${US} ∨ ${UT} = ${right}`);
    console.log(`       Union law holds: ${left === right ? '✅' : '❌'}`);

    expect(left).toBe(right);
  });

  it("De Morgan: or ≡ ¬(and ∘ ⟨¬-, ¬-⟩) at the α component (naturality)", () => {
    const A: SetObj<string> = {
      id: "A",
      elems: ["p", "q", "r"],
      eq: (a, b) => a === b
    };
    
    const t = UF.of(A)("p"); // Principal ultrafilter at "p"
    const alpha = endToNat(MiniFinSet, A, G_inclusion, t);

    const S = new Set(["p"]); // Contains "p"
    const T = new Set(["r"]); // Doesn't contain "p"

    console.log('     Testing De Morgan law via naturality:');
    console.log(`       S = {${[...S].join(', ')}} (contains "p")`);
    console.log(`       T = {${[...T].join(', ')}} (doesn't contain "p")`);

    const chiS = chi("3", S);
    const chiT = chi("3", T);
    const pair = pairTo2x2("3", chiS, chiT);

    // Direct OR: U(S) ∨ U(T) via or ∘ ⟨χ_S, χ_T⟩
    const orViaDirect = alpha.at("2")((a: string) => or2.fn(pair.fn(a)));

    // De Morgan: ¬(¬U(S) ∧ ¬U(T)) = ¬(and ∘ ⟨¬χ_S, ¬χ_T⟩)
    const orViaDeMorgan = alpha.at("2")((a: string) => {
      const p = pair.fn(a) as [boolean, boolean];
      const notS = not2.fn(p[0]); // ¬χ_S(a)
      const notT = not2.fn(p[1]); // ¬χ_T(a)
      const andNotSNotT = and2.fn([notS, notT]); // ¬χ_S(a) ∧ ¬χ_T(a)
      return not2.fn(andNotSNotT); // ¬(¬χ_S(a) ∧ ¬χ_T(a))
    });

    console.log(`       U(S) ∨ U(T) via direct OR = ${orViaDirect}`);
    console.log(`       U(S) ∨ U(T) via De Morgan = ${orViaDeMorgan}`);
    console.log(`       De Morgan law holds: ${orViaDirect === orViaDeMorgan ? '✅' : '❌'}`);

    expect(orViaDirect).toBe(orViaDeMorgan);
  });

  it("Intersection: U(S ∩ T) = U(S) ∧ U(T) via naturality with and : 2×2→2", () => {
    const A: SetObj<number> = {
      id: "A",
      elems: [0, 1, 2],
      eq: (a, b) => a === b
    };
    
    const t = UF.of(A)(1); // Principal ultrafilter at 1
    const alpha = endToNat(MiniFinSet, A, G_inclusion, t);

    const S = new Set([1, 2]); // Contains 1
    const T = new Set([0, 1]); // Contains 1
    const intersection = new Set([1]); // S ∩ T

    console.log('     Testing intersection law via naturality:');
    console.log(`       S = {${[...S].join(', ')}}`);
    console.log(`       T = {${[...T].join(', ')}}`);
    console.log(`       S ∩ T = {${[...intersection].join(', ')}}`);

    const chiS = chi("3", S);
    const chiT = chi("3", T);
    const pair = pairTo2x2("3", chiS, chiT);

    // Left side: U(S ∩ T) via and ∘ ⟨χ_S, χ_T⟩
    const left = alpha.at("2")((a: number) => and2.fn(pair.fn(a)));
    
    // Right side: U(S) ∧ U(T)
    const US = alpha.at("2")(chiS.fn as any);
    const UT = alpha.at("2")(chiT.fn as any);
    const right = (US === true) && (UT === true);

    console.log(`       U(S ∩ T) via ∧ ∘ ⟨χ_S, χ_T⟩ = ${left}`);
    console.log(`       U(S) ∧ U(T) = ${US} ∧ ${UT} = ${right}`);
    console.log(`       Intersection law holds: ${left === right ? '✅' : '❌'}`);

    expect(left).toBe(right);
  });

  it("All Boolean morphisms are available and functional", () => {
    console.log('     Testing Boolean morphism availability:');
    
    // Test all Boolean morphisms exist
    expect(BoolMorphisms.pi1).toBeDefined();
    expect(BoolMorphisms.pi2).toBeDefined();
    expect(BoolMorphisms.and2).toBeDefined();
    expect(BoolMorphisms.or2).toBeDefined();
    expect(BoolMorphisms.xor2).toBeDefined();
    expect(BoolMorphisms.nand2).toBeDefined();
    expect(BoolMorphisms.not2).toBeDefined();

    console.log(`       π₁ (first projection): ✅`);
    console.log(`       π₂ (second projection): ✅`);
    console.log(`       ∧ (AND): ✅`);
    console.log(`       ∨ (OR): ✅`);
    console.log(`       ⊕ (XOR): ✅`);
    console.log(`       ↑ (NAND): ✅`);
    console.log(`       ¬ (NOT): ✅`);

    // Test NOT function
    expect(not2.fn(true)).toBe(false);
    expect(not2.fn(false)).toBe(true);

    // Test OR function on sample inputs
    expect(or2.fn([true, false])).toBe(true);
    expect(or2.fn([false, false])).toBe(false);
    expect(or2.fn([true, true])).toBe(true);

    console.log('     Boolean operations compute correctly ✅');
  });

  it("Categorical Boolean algebra enables rich naturality tests", () => {
    const A: SetObj<number> = {
      id: "A",
      elems: [0, 1, 2],
      eq: (a, b) => a === b
    };
    
    const t = UF.of(A)(2); // Principal ultrafilter at 2
    const alpha = endToNat(MiniFinSet, A, G_inclusion, t);

    // Test multiple Boolean combinations
    const testSets = [
      { S: new Set([2]), T: new Set([0, 2]), desc: "subset case" },
      { S: new Set([1]), T: new Set([2]), desc: "disjoint case" },
      { S: new Set([0, 1]), T: new Set([1, 2]), desc: "overlap case" }
    ];

    console.log('     Testing rich Boolean combinations:');

    testSets.forEach(({ S, T, desc }) => {
      // Test all operations
      const chiS = chi("3", S);
      const chiT = chi("3", T);
      const pair = pairTo2x2("3", chiS, chiT);

      const andResult = alpha.at("2")((a: number) => and2.fn(pair.fn(a)));
      const orResult = alpha.at("2")((a: number) => or2.fn(pair.fn(a)));
      const xorResult = alpha.at("2")((a: number) => xor2.fn(pair.fn(a)));
      
      const US = alpha.at("2")(chiS.fn as any);
      const UT = alpha.at("2")(chiT.fn as any);
      
      console.log(`       ${desc}:`);
      console.log(`         U(S ∩ T) = ${andResult}, U(S) ∧ U(T) = ${US && UT} ${andResult === (US && UT) ? '✅' : '❌'}`);
      console.log(`         U(S ∪ T) = ${orResult}, U(S) ∨ U(T) = ${US || UT} ${orResult === (US || UT) ? '✅' : '❌'}`);
      console.log(`         U(S ⊕ T) = ${xorResult}, U(S) ⊕ U(T) = ${US !== UT} ${xorResult === (US !== UT) ? '✅' : '❌'}`);

      expect(andResult).toBe(US && UT);
      expect(orResult).toBe(US || UT);
      expect(xorResult).toBe(US !== UT);
    });
  });

  it("Complex De Morgan laws: ¬(S ∪ T) = (¬S) ∩ (¬T)", () => {
    const A: SetObj<string> = {
      id: "A",
      elems: ["a", "b", "c"],
      eq: (a, b) => a === b
    };
    
    const t = UF.of(A)("b"); // Principal ultrafilter at "b"
    const alpha = endToNat(MiniFinSet, A, G_inclusion, t);

    const S = new Set(["a"]); // Doesn't contain "b"
    const T = new Set(["c"]); // Doesn't contain "b"

    console.log('     Testing complex De Morgan: ¬(S ∪ T) = (¬S) ∩ (¬T)');
    console.log(`       S = {${[...S].join(', ')}}, T = {${[...T].join(', ')}}`);

    // Left side: ¬(S ∪ T) via not ∘ (or ∘ ⟨χ_S, χ_T⟩)
    const chiS = chi("3", S);
    const chiT = chi("3", T);
    const pair = pairTo2x2("3", chiS, chiT);
    
    const leftSide = alpha.at("2")((a: string) => {
      const orResult = or2.fn(pair.fn(a));
      return not2.fn(orResult);
    });

    // Right side: (¬S) ∩ (¬T) via and ∘ ⟨¬χ_S, ¬χ_T⟩
    const rightSide = alpha.at("2")((a: string) => {
      const p = pair.fn(a) as [boolean, boolean];
      const notS = not2.fn(p[0]);
      const notT = not2.fn(p[1]);
      return and2.fn([notS, notT]);
    });

    console.log(`       ¬(S ∪ T) = ${leftSide}`);
    console.log(`       (¬S) ∩ (¬T) = ${rightSide}`);
    console.log(`       Complex De Morgan holds: ${leftSide === rightSide ? '✅' : '❌'}`);

    expect(leftSide).toBe(rightSide);
  });

  it("All Boolean operations preserve naturality", () => {
    const A: SetObj<number> = {
      id: "A", 
      elems: [0, 1, 2],
      eq: (a, b) => a === b
    };
    
    const t = UF.of(A)(0); // Principal ultrafilter at 0
    const alpha = endToNat(MiniFinSet, A, G_inclusion, t);

    // Test all Boolean morphisms with various subset combinations
    const subsetPairs = [
      { S: new Set([0]), T: new Set([1]) },
      { S: new Set([0, 1]), T: new Set([1, 2]) },
      { S: new Set([0]), T: new Set([0, 2]) }
    ];

    console.log('     Testing naturality preservation for all Boolean operations:');

    subsetPairs.forEach(({ S, T }, index) => {
      const chiS = chi("3", S);
      const chiT = chi("3", T);
      const pair = pairTo2x2("3", chiS, chiT);

      // Test all Boolean operations
      const operations = [
        { name: "AND", morphism: and2, op: (a: boolean, b: boolean) => a && b },
        { name: "OR", morphism: or2, op: (a: boolean, b: boolean) => a || b },
        { name: "XOR", morphism: xor2, op: (a: boolean, b: boolean) => a !== b },
        { name: "NAND", morphism: nand2, op: (a: boolean, b: boolean) => !(a && b) }
      ];

      console.log(`       Test case ${index + 1}: S={${[...S].join(', ')}}, T={${[...T].join(', ')}}`);

      operations.forEach(({ name, morphism, op }) => {
        const viaCategory = alpha.at("2")((a: number) => morphism.fn(pair.fn(a)));
        
        const US = alpha.at("2")(chiS.fn as any) === true;
        const UT = alpha.at("2")(chiT.fn as any) === true;
        const viaDirect = op(US, UT);

        console.log(`         ${name}: categorical=${viaCategory}, direct=${viaDirect} ${viaCategory === viaDirect ? '✅' : '❌'}`);
        expect(viaCategory).toBe(viaDirect);
      });
    });
  });

  it("Naturality enables Boolean algebra without principal witnesses", () => {
    const A: SetObj<number> = {
      id: "A",
      elems: [0, 1, 2, 3],
      eq: (a, b) => a === b
    };
    
    // Use different principal ultrafilters to show generality
    const testElements = [0, 1, 2, 3];
    
    console.log('     Testing Boolean algebra laws across different ultrafilters:');

    testElements.forEach(element => {
      const t = UF.of(A)(element);
      const alpha = endToNat(MiniFinSet, A, G_inclusion, t);

      // Test subset
      const S = new Set([1, 3]);
      const chiS = chi("3", S); // Treating A as object "3" by isomorphism
      
      // Test complement via NOT
      const US = alpha.at("2")(chiS.fn as any);
      const UcompS = alpha.at("2")((a: number) => not2.fn(chiS.fn(a)));
      
      // Should satisfy: U(S) ∨ U(¬S) = true, U(S) ∧ U(¬S) = false
      const orResult = US || UcompS;
      const andResult = US && UcompS;
      
      console.log(`       Element ${element}: U(S)=${US}, U(¬S)=${UcompS}, U(S)∨U(¬S)=${orResult}, U(S)∧U(¬S)=${andResult}`);
      
      expect(orResult).toBe(true); // Law of excluded middle
      expect(andResult).toBe(false); // Law of non-contradiction
    });
    
    console.log('     Boolean algebra laws hold for all ultrafilters ✅');
    console.log('     Derived purely from categorical naturality ✅');
  });

  it("Rich category provides comprehensive Boolean algebra testing", () => {
    // Show the power of having objects 0,1,2,3,2×2 with all morphisms
    const stats = {
      objects: MiniFinSet.objects.length,
      morphisms: MiniFinSet.morphisms.length,
      booleanMorphisms: Object.keys(BoolMorphisms).length
    };

    console.log('     Rich category statistics:');
    console.log(`       Objects: ${stats.objects} (0, 1, 2, 3, 2×2)`);
    console.log(`       Total morphisms: ${stats.morphisms}`);
    console.log(`       Boolean morphisms: ${stats.booleanMorphisms}`);

    // Test that we have the expected Boolean operations
    const boolOps = Object.keys(BoolMorphisms);
    const expectedOps = ['pi1', 'pi2', 'and2', 'or2', 'xor2', 'nand2', 'not2'];
    
    expectedOps.forEach(op => {
      expect(boolOps.includes(op)).toBe(true);
      console.log(`       ${op}: ✅`);
    });

    // Verify we can construct complex Boolean expressions
    const testPair: [boolean, boolean] = [true, false];
    
    expect(BoolMorphisms.and2.fn(testPair)).toBe(false);
    expect(BoolMorphisms.or2.fn(testPair)).toBe(true);
    expect(BoolMorphisms.xor2.fn(testPair)).toBe(true);
    expect(BoolMorphisms.nand2.fn(testPair)).toBe(true);
    expect(BoolMorphisms.not2.fn(true)).toBe(false);

    console.log('     All Boolean operations compute correctly ✅');
    console.log('     Rich categorical structure enables advanced testing ✅');
  });
});
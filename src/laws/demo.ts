import { lawfulMonoid } from "./Monoid";
import { posetLaws, completeLatticeLaws } from "./Order";
import { isoLaws } from "./Witness";
import { runLaws } from "./Witness";
import { powersetLattice } from "../order/Lattice";

console.log("=== Laws Framework Demo ===");

// Demo 1: Monoid laws
console.log("\n1. Monoid laws for string concatenation:");
const stringMonoid = {
  empty: "",
  concat: (a: string, b: string) => a + b
};

const pack = lawfulMonoid("Monoid/string/concat", (a, b) => a === b, stringMonoid, ["a", "b", "c"]);
const monoidResult = runLaws(pack.laws, { M: pack.struct, xs: ["a", "b", "c"] });
console.log("Monoid laws:", monoidResult.ok ? "✅ PASS" : "❌ FAIL");
if (!monoidResult.ok) {
  console.log("Failures:", monoidResult.failures);
}

// Demo 2: Poset laws
console.log("\n2. Poset laws for number ordering:");
const numberPoset = {
  elems: [1, 2, 3, 4, 5],
  leq: (a: number, b: number) => a <= b,
  eq: (a: number, b: number) => a === b
};

const posetLawsList = posetLaws(numberPoset);
const posetResult = runLaws(posetLawsList, { P: numberPoset });
console.log("Poset laws:", posetResult.ok ? "✅ PASS" : "❌ FAIL");

// Demo 3: Complete lattice laws
console.log("\n3. Complete lattice laws for powerset:");
const U = [1, 2, 3];
const L = powersetLattice(U, (a, b) => a === b);
const latticeLawsList = completeLatticeLaws(L);
const latticeResult = runLaws(latticeLawsList, { L });
console.log("Lattice laws:", latticeResult.ok ? "✅ PASS" : "❌ FAIL");

// Demo 4: Isomorphism laws
console.log("\n4. Isomorphism laws:");
const eqString = (a: string, b: string) => a === b;
const eqNumber = (a: number, b: number) => a === b;

const stringToNum = new Map([["a", 1], ["b", 2], ["c", 3]]);
const numToString = new Map([[1, "a"], [2, "b"], [3, "c"]]);

const iso = {
  to: (s: string) => stringToNum.get(s) ?? 0,
  from: (n: number) => numToString.get(n) ?? ""
};

const isoLawsList = isoLaws(eqString, eqNumber, iso);
const isoResult = runLaws(isoLawsList, {
  samplesA: ["a", "b", "c"],
  samplesB: [1, 2, 3]
});
console.log("Isomorphism laws:", isoResult.ok ? "✅ PASS" : "❌ FAIL");

// Demo 5: Failing laws (for demonstration)
console.log("\n5. Failing laws demonstration:");
const brokenMonoid = {
  empty: 0,
  concat: (a: number, b: number) => a + b + 1 // Wrong! Not associative
};

const brokenPack = lawfulMonoid("Broken/monoid", (a, b) => a === b, brokenMonoid, [1, 2, 3]);
const brokenResult = runLaws(brokenPack.laws, { M: brokenPack.struct, xs: [1, 2, 3] });
console.log("Broken monoid laws:", brokenResult.ok ? "✅ PASS" : "❌ FAIL");
if (!brokenResult.ok) {
  console.log("Failures:", brokenResult.failures.map(f => f.name));
}

console.log("\n=== Demo Complete ===");
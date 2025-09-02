/**
 * Developer Demo:
 * - This file is not part of the library build.
 * - Do not import it from 'src/index.ts' or 'src/types/index.ts'.
 */

// optics-example.ts
import { fstLens, propLens, view, setL, over, checkLensLaws } from "../types/catkit-optics";

console.log("🎯 Profunctor Optics Demo");
console.log("=========================\n");

console.log("📊 What we're demonstrating:");
console.log("• Profunctor lenses with Strong dictionaries (Function, Forget)");
console.log("• Generic lens constructor: lens(get, set)");
console.log("• Interpreters: view (Forget), over/setL (Function)");
console.log("• Automatic law checking: get-set, set-get, set-set");
console.log();

// Example 1: fst lens
console.log("🔍 Example 1: First Element Lens");
console.log("==================================");
const s1: [number, string] = [10, "z"];
console.log("Original pair:", s1);
console.log("[fst] view:", view(fstLens as any, s1));
console.log("[fst] set 99:", setL(fstLens as any, 99)(s1));
console.log("[fst] over (*2):", over(fstLens as any, (n:number)=>n*2)(s1));

const fstLaws = checkLensLaws(fstLens as any, s1, 7, 8);
console.log("[fst] laws:", fstLaws);
console.log("  • get-set:", fstLaws.getSet ? "✅ PASS" : "❌ FAIL");
console.log("  • set-get:", fstLaws.setGet ? "✅ PASS" : "❌ FAIL");
console.log("  • set-set:", fstLaws.setSet ? "✅ PASS" : "❌ FAIL");
console.log();

// Example 2: property lens on {x:number, y:string}
console.log("🔍 Example 2: Property Lens (x field)");
console.log("=====================================");
type S = { x:number, y:string };
const lx = propLens<"x", S, number>("x");
const s2: S = { x: 1, y: "ok" };
console.log("Original record:", s2);
console.log("[prop x] view:", view(lx as any, s2));
console.log("[prop x] set 42:", setL(lx as any, 42)(s2));
console.log("[prop x] over (+3):", over(lx as any, (n:number)=>n+3)(s2));

const propLaws = checkLensLaws(lx as any, s2, 5, 6);
console.log("[prop x] laws:", propLaws);
console.log("  • get-set:", propLaws.getSet ? "✅ PASS" : "❌ FAIL");
console.log("  • set-get:", propLaws.setGet ? "✅ PASS" : "❌ FAIL");
console.log("  • set-set:", propLaws.setSet ? "✅ PASS" : "❌ FAIL");
console.log();

// Example 3: Type-changing property lens
console.log("🔍 Example 3: Type-Changing Property Lens");
console.log("==========================================");
type PersonInt = { name: string, age: number };

const ageLens = propLens<"age", PersonInt, string>("age");
const person: PersonInt = { name: "Alice", age: 30 };
console.log("Original person (age: number):", person);

const personWithStrAge = setL(ageLens, "thirty")(person);
console.log("After setting age to string:", personWithStrAge);
console.log("Type changed from { name: string, age: number } to { name: string, age: string }!");
console.log();

console.log("🎉 Profunctor Optics Demo Complete!");
console.log("\nWhat we demonstrated:");
console.log("• Profunctor encoding: Lens s t a b = ∀p. Strong p ⇒ p a b → p s t");
console.log("• Function profunctor for setters/updaters via dimap + first");
console.log("• Forget profunctor for getters via dimap + first");
console.log("• Automatic law verification catches invalid lens implementations");
console.log("• Type-changing lenses that transform the structure type");
console.log("• Composition is just function composition (profunctors compose!)");
console.log("🚀 The profunctor approach makes optics both elegant and lawful!");

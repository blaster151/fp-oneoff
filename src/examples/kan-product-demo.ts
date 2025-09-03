/**
 * Developer Demo:
 * - This file is not part of the library build.
 * - Do not import it from 'src/index.ts' or 'src/types/index.ts'.
 */

// kan-product-demo.ts
// Simple demonstration of Right Kan extension giving products for discrete categories
// Perfect for understanding the discrete-2 + terminal example

import { RanSet } from "../types/ran-set.js";
import { SmallCategory } from "../types/category-to-nerve-sset.js";
import { SetFunctor, SetObj, Functor, HasHom, RightKan_Set } from "../types/catkit-kan.js";

const id = <T>(x: T) => x;

console.log('='.repeat(70));
console.log('🎯 KAN EXTENSION PRODUCT DEMO');
console.log('='.repeat(70));

// Build discrete category with 2 objects: A, B (no morphisms between them)
type CObj = "A" | "B";
type CM = { tag: "id", o: CObj };

const DiscreteCategory: SmallCategory<CObj, CM> & { objects: CObj[]; morphisms: CM[] } = {
  objects: ["A", "B"],
  morphisms: [{ tag: "id", o: "A" }, { tag: "id", o: "B" }],
  id: (o: CObj) => ({ tag: "id", o }),
  src: (m: CM) => m.o,
  dst: (m: CM) => m.o,
  comp: (g: CM, f: CM) => {
    if (g.o === f.o) return g;
    throw new Error("Cannot compose across different objects in discrete category");
  }
};

// Terminal category: single object ★
type DObj = "★";
type DM = { tag: "id" };

const TerminalCategory: SmallCategory<DObj, DM> & HasHom<DObj, DM> & { objects: DObj[] } = {
  objects: ["★"],
  id: (_) => ({ tag: "id" }),
  src: (_) => "★",
  dst: (_) => "★", 
  comp: (_g, _f) => ({ tag: "id" }),
  hom: (_x, _y) => [{ tag: "id" }]
};

// Unique functor !: Discrete → Terminal (bang functor)
const bang: Functor<CObj, CM, DObj, DM> = {
  Fobj: (_) => "★",
  Fmor: (_) => ({ tag: "id" })
};

// Set-valued functor h: Discrete → Set
const setA: SetObj<number> = { id: "h(A)", elems: [0, 1], eq: (a, b) => a === b };
const setB: SetObj<string> = { id: "h(B)", elems: ["x", "y", "z"], eq: (a, b) => a === b };

const h: SetFunctor<CObj, CM> = {
  obj: (o) => o === "A" ? setA : setB,
  map: (m) => (x: any) => x // Identity on morphisms (only identities exist)
};

const keyC = (c: CObj) => c;
const keyDMor = (_: DM) => "id";

console.log('\n📐 SETUP:');
console.log(`   Discrete Category C: objects [${DiscreteCategory.objects.join(', ')}], no morphisms between them`);
console.log(`   Terminal Category D: object [${TerminalCategory.objects.join(', ')}]`);
console.log(`   Functor g = !: C → D (unique functor to terminal)`);
console.log(`   Set functor h: C → Set`);
console.log(`     h(A) = {${setA.elems.join(', ')}} (${setA.elems.length} elements)`);
console.log(`     h(B) = {${setB.elems.join(', ')}} (${setB.elems.length} elements)`);

console.log('\n🎯 THEORETICAL PREDICTION:');
console.log(`   For discrete categories: (Ran_! h)(★) ≅ lim h ≅ h(A) × h(B)`);
console.log(`   Expected cardinality: |h(A)| × |h(B)| = ${setA.elems.length} × ${setB.elems.length} = ${setA.elems.length * setB.elems.length}`);

console.log('\n🔧 COMPUTATION:');

try {
  // Compute Right Kan extension using existing robust implementation
  const Ran = RightKan_Set(DiscreteCategory, TerminalCategory, bang, h, keyC, keyDMor);
  const RanResult = Ran.obj("★");
  
  console.log(`   Computing (Ran_! h)(★)...`);
  console.log(`   Result: ${RanResult.elems.length} natural families found`);
  console.log(`   ID: "${RanResult.id}"`);
  
  // Analyze the structure
  if (RanResult.elems.length > 0) {
    console.log(`\n📊 ANALYSIS:`);
    console.log(`   Each natural family represents a choice:`);
    console.log(`   • Component at A: function D(★,★) → h(A)`);  
    console.log(`   • Component at B: function D(★,★) → h(B)`);
    console.log(`   Since D(★,★) = {id_★}, this is just picking one element from each set`);
    
    // Show first few families if not too many
    if (RanResult.elems.length <= 10) {
      console.log(`\n🔍 NATURAL FAMILIES (showing all ${RanResult.elems.length}):`);
      RanResult.elems.forEach((family, i) => {
        if (typeof family === 'object' && family !== null) {
          const familyObj = family as any;
          let description = `   Family ${i + 1}: `;
          
          if (familyObj.A && familyObj.B) {
            // Try to extract the mappings
            const compA = familyObj.A;
            const compB = familyObj.B;
            
            if (compA.get && compB.get) {
              const aVal = compA.get("id");
              const bVal = compB.get("id");
              description += `(A → ${aVal}, B → ${bVal})`;
            } else {
              description += `(complex structure)`;
            }
          } else {
            description += `(unknown structure)`;
          }
          
          console.log(description);
        }
      });
    } else {
      console.log(`   Too many families to display (${RanResult.elems.length}), showing structure only`);
    }
    
    // Verify product property
    const expectedSize = setA.elems.length * setB.elems.length;
    if (RanResult.elems.length === expectedSize) {
      console.log(`\n✅ VERIFICATION: Perfect match! ${RanResult.elems.length} = ${expectedSize}`);
      console.log(`   This confirms: (Ran_! h)(★) ≅ h(A) × h(B) for discrete categories`);
    } else {
      console.log(`\n⚠️  VERIFICATION: Size mismatch. Got ${RanResult.elems.length}, expected ${expectedSize}`);
      console.log(`   This may be due to implementation details or representation differences`);
      console.log(`   The mathematical essence should still be captured`);
    }
  }
  
  // Test functoriality
  console.log(`\n🔄 FUNCTORIALITY TEST:`);
  const identityMorphism = TerminalCategory.id("★");
  const morphismAction = Ran.map(identityMorphism);
  console.log(`   Identity morphism action defined: ${typeof morphismAction === 'function'}`);
  
  if (RanResult.elems.length > 0) {
    const testFamily = RanResult.elems[0];
    try {
      const mappedFamily = morphismAction(testFamily!);
      const isEqual = RanResult.eq(testFamily!, mappedFamily);
      console.log(`   id_★ acts as identity on families: ${isEqual}`);
    } catch (error) {
      console.log(`   Identity test: ${(error as Error).message}`);
    }
  }
  
} catch (error) {
  console.log(`   ❌ Error computing Right Kan extension: ${(error as Error).message}`);
}

console.log('\n🧮 MANUAL VERIFICATION:');
console.log(`   Product h(A) × h(B) should contain:`);
setA.elems.forEach(a => {
  setB.elems.forEach(b => {
    console.log(`   (${a}, ${b})`);
  });
});

console.log('\n📚 MATHEMATICAL INSIGHT:');
console.log(`   This example demonstrates the fundamental theorem:`);
console.log(`   "Right Kan extensions along functors to terminal categories`);
console.log(`    compute limits, and limits of discrete diagrams are products"`);
console.log(`   `);
console.log(`   Formula: (Ran_! h)(★) ≅ ∏_{c ∈ C} h(c)`);
console.log(`   This is why Kan extensions are so powerful in category theory!`);

console.log('\n' + '='.repeat(70));
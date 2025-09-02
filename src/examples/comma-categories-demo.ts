// comma-categories-demo.ts
// Demonstration of comma categories, slices, and coslices
// Shows how these fundamental constructions work in practice

import { Category, Functor, slice, coslice, comma } from "../types/catkit-comma-categories.js";

console.log("=".repeat(80));
console.log("COMMA CATEGORIES DEMO");
console.log("=".repeat(80));

// ------------------------------------------------------------
// Example 1: Simple finite category for slices/coslices
// ------------------------------------------------------------

type SimpleObj = "X" | "Y" | "Z";
type SimpleMor = { src: SimpleObj; dst: SimpleObj; label: string };

const SimpleCategory: Category<SimpleObj, SimpleMor> = {
  id: (o) => ({ src: o, dst: o, label: `id_${o}` }),
  
  dom: (m) => m.src,
  cod: (m) => m.dst,
  
  compose: (g, f) => {
    if (f.dst !== g.src) throw new Error(`Cannot compose ${f.label} ; ${g.label}`);
    return { 
      src: f.src, 
      dst: g.dst, 
      label: `${g.label}∘${f.label}` 
    };
  }
};

// Some morphisms in our simple category
const f_XY: SimpleMor = { src: "X", dst: "Y", label: "f" };
const g_YZ: SimpleMor = { src: "Y", dst: "Z", label: "g" };
const h_XZ: SimpleMor = { src: "X", dst: "Z", label: "h" };

console.log("\n1. SLICE CATEGORY C ↓ Z");
console.log("Objects: morphisms with codomain Z");

const SliceZ = slice(SimpleCategory, "Z");

// Objects in C ↓ Z are morphisms into Z
const obj1 = SliceZ.mkSliceObj("Y", g_YZ); // g: Y → Z
const obj2 = SliceZ.mkSliceObj("X", h_XZ); // h: X → Z

console.log("Slice objects:");
console.log(`  obj1: ${obj1.a} -[${obj1.alpha.label}]-> Z`);
console.log(`  obj2: ${obj2.a} -[${obj2.alpha.label}]-> Z`);

// Morphism in slice: f: X → Y such that g ∘ f = h
try {
  const slice_mor = SliceZ.mkSliceMor(obj2, obj1, f_XY);
  console.log(`✓ Slice morphism: ${f_XY.label} makes the triangle commute`);
} catch (e) {
  console.log(`✗ Slice morphism failed: ${e}`);
}

console.log("\n" + "-".repeat(60));

// ------------------------------------------------------------
// Example 2: Coslice category
// ------------------------------------------------------------

console.log("\n2. COSLICE CATEGORY X ↓ C");
console.log("Objects: morphisms with domain X");

const CosliceX = coslice(SimpleCategory, "X");

// Objects in X ↓ C are morphisms from X  
const coobj1 = CosliceX.mkCosliceObj("Y", f_XY); // f: X → Y
const coobj2 = CosliceX.mkCosliceObj("Z", h_XZ); // h: X → Z

console.log("Coslice objects:");
console.log(`  coobj1: X -[${coobj1.alpha.label}]-> ${coobj1.b}`);
console.log(`  coobj2: X -[${coobj2.alpha.label}]-> ${coobj2.b}`);

// Morphism in coslice: g: Y → Z such that g ∘ f = h
try {
  const coslice_mor = CosliceX.mkCosliceMor(coobj1, coobj2, g_YZ);
  console.log(`✓ Coslice morphism: ${g_YZ.label} makes the triangle commute`);
} catch (e) {
  console.log(`✗ Coslice morphism failed: ${e}`);
}

console.log("\n" + "-".repeat(60));

// ------------------------------------------------------------
// Example 3: General comma category (simplified)
// ------------------------------------------------------------

console.log("\n3. GENERAL COMMA CATEGORY (F ↓ G)");
console.log("Simplified example with identity functors");

// For demonstration, use Id: Simple → Simple and Const_Z: 1 → Simple
type OneObj = "•";
type OneMor = "id";

const ONE: Category<OneObj, OneMor> = {
  id: () => "id",
  dom: () => "•",
  cod: () => "•", 
  compose: () => "id"
};

const IdFunctor: Functor<SimpleObj, SimpleMor, SimpleObj, SimpleMor> = {
  dom: SimpleCategory,
  cod: SimpleCategory,
  onObj: x => x,
  onMor: f => f
};

const ConstZ: Functor<OneObj, OneMor, SimpleObj, SimpleMor> = {
  dom: ONE,
  cod: SimpleCategory,
  onObj: () => "Z",
  onMor: () => SimpleCategory.id("Z")
};

const CommaIdConstZ = comma(IdFunctor, ConstZ);

// This is equivalent to the slice C ↓ Z
console.log("Comma (Id ↓ Const_Z) ≅ Slice C ↓ Z");

try {
  const comma_obj = CommaIdConstZ.mkObj("Y", "•", g_YZ);
  console.log(`✓ Comma object: (${comma_obj.a}, ${comma_obj.b}, ${comma_obj.alpha.label})`);
} catch (e) {
  console.log(`✗ Comma object creation failed: ${e}`);
}

console.log("\n" + "=".repeat(80));
console.log("COMMA CATEGORY FEATURES DEMONSTRATED:");
console.log("✓ Slice categories C ↓ c (objects over c)");
console.log("✓ Coslice categories c ↓ C (objects under c)");
console.log("✓ General comma construction (F ↓ G)");
console.log("✓ Commuting square verification");
console.log("✓ Type-safe morphism construction");
console.log("=".repeat(80));
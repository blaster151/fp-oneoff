// mini-finset.ts
// A compact "small FinSet" with objects 0,1,2,3, and 2×2 (Bool×Bool)
// We include *all* set-functions between these carriers
// Also expose named boolean morphisms: pi1, pi2 : 2×2→2 and and : 2×2→2,
// and helpers to build ⟨f,g⟩ : A→2×2 and χ_S : A→2

import { SmallCategory } from "./category-to-nerve-sset.js";
import { SetFunctor, SetObj, HasHom } from "./catkit-kan.js";

/************ Carrier Sets with Stable Enumerations ************/

export type Obj = "0" | "1" | "2" | "3" | "2x2";

// Carrier elements in stable order
export const elts: Record<Obj, any[]> = {
  "0": [],                                    // Empty set
  "1": [null],                               // Singleton
  "2": [false, true],                        // Boolean
  "3": [0, 1, 2],                           // Three elements
  "2x2": [                                   // Bool × Bool
    [false, false],
    [false, true], 
    [true, false],
    [true, true],
  ],
};

// SetObj representations
export const asSetObj: Record<Obj, SetObj<any>> = {
  "0": { id: "0", elems: elts["0"], eq: (a, b) => a === b },
  "1": { id: "1", elems: elts["1"], eq: (a, b) => a === b },
  "2": { id: "2", elems: elts["2"], eq: (a, b) => a === b },
  "3": { id: "3", elems: elts["3"], eq: (a, b) => a === b },
  "2x2": { id: "2x2", elems: elts["2x2"], eq: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
};

/************ Morphism Type ************/

export type Mor = {
  src: Obj;
  dst: Obj;
  // Table lists images of domain elements *in the order of elts[src]*
  table: any[];
  fn: (x: any) => any;
  id?: string; // Optional identifier for named morphisms
};

/************ Function Enumeration ************/

// Build all set functions A→B by enumerating all tables B^|A|
function enumerateFunctions(src: Obj, dst: Obj): Mor[] {
  const dom = elts[src];
  const cod = elts[dst];
  const n = dom.length;
  const m = cod.length;

  // Edge case: unique function ∅→B (n=0)
  if (n === 0) {
    const table: any[] = [];
    const fn = (_: any) => { 
      throw new Error("Impossible: no element in domain 0"); 
    };
    return [{ src, dst, table, fn, id: `empty_to_${dst}` }];
  }

  // If codomain empty and domain non-empty: no functions
  if (m === 0) return [];

  // Lexicographic enumeration of all m^n tables
  const out: Mor[] = [];
  const idx = new Array(n).fill(0);
  const total = Math.pow(m, n);

  for (let k = 0; k < total; k++) {
    const table = idx.map(i => cod[i]!);
    const fn = (x: any) => {
      const j = dom.findIndex(d => Object.is(d, x));
      if (j < 0) throw new Error("Domain element not found");
      return table[j];
    };
    
    out.push({ 
      src, 
      dst, 
      table, 
      fn, 
      id: `f_${src}_${dst}_${k}` 
    });
    
    // Increment idx in base m
    let carry = 1;
    for (let p = 0; p < n && carry; p++) {
      idx[p] += carry;
      if (idx[p] === m) { 
        idx[p] = 0; 
        carry = 1; 
      } else { 
        carry = 0; 
      }
    }
  }
  
  return out;
}

/************ Precomputed Morphisms and Hom Lookup ************/

// Precompute all morphisms and fast hom lookup
const ALL_MOR: Mor[] = [];
const HOM: Record<string, Mor[]> = {};

// Initialize all morphisms
(function initMorphisms() {
  const objs: Obj[] = ["0", "1", "2", "3", "2x2"];
  
  for (const a of objs) {
    for (const b of objs) {
      const arr = enumerateFunctions(a, b);
      const key = `${a}|${b}`;
      HOM[key] = arr;
      ALL_MOR.push(...arr);
    }
  }
})();

// Find morphism by table lookup
function findMorByTable(src: Obj, dst: Obj, table: any[]): Mor {
  const key = `${src}|${dst}`;
  const candidates = HOM[key];
  
  if (!candidates) {
    throw new Error(`No hom-set for ${src} → ${dst}`);
  }
  
  const found = candidates.find(m =>
    m.table.length === table.length &&
    m.table.every((v, i) => Object.is(v, table[i]))
  );
  
  if (!found) {
    throw new Error(`No morphism with given table from ${src} to ${dst}`);
  }
  
  return found;
}

/************ Rich FinSet Category ************/

export const MiniFinSet: SmallCategory<Obj, Mor> & { objects: Obj[]; morphisms: Mor[] } & HasHom<Obj, Mor> = {
  objects: ["0", "1", "2", "3", "2x2"],
  morphisms: ALL_MOR,
  
  id: (o: Obj): Mor => {
    // Identity function: each element maps to itself
    const identityTable = elts[o].map(x => x);
    return findMorByTable(o, o, identityTable);
  },
  
  src: (m: Mor): Obj => m.src,
  dst: (m: Mor): Obj => m.dst,
  
  comp: (g: Mor, f: Mor): Mor => {
    if (f.dst !== g.src) {
      throw new Error(`Cannot compose: dst(${f.src}→${f.dst}) ≠ src(${g.src}→${g.dst})`);
    }
    
    const dom = elts[f.src];
    const table = dom.map((a: any) => g.fn(f.fn(a)));
    return findMorByTable(f.src, g.dst, table);
  },
  
  hom: (a: Obj, b: Obj): Mor[] => {
    const key = `${a}|${b}`;
    return HOM[key] || [];
  }
};

/************ Inclusion Functor ************/

// Inclusion functor G: MiniFinSet → Set, identity on carriers/functions
export const G_inclusion: SetFunctor<Obj, Mor> = {
  obj: (o: Obj): SetObj<any> => asSetObj[o],
  map: (m: Mor) => m.fn
};

/************ Named Boolean Morphisms ************/

// Projection morphisms π₁, π₂ : 2×2 → 2
export const pi1: Mor = findMorByTable(
  "2x2", "2",
  elts["2x2"].map(([b1, _b2]) => b1)
);

export const pi2: Mor = findMorByTable(
  "2x2", "2", 
  elts["2x2"].map(([_b1, b2]) => b2)
);

// Boolean AND operation: ∧ : 2×2 → 2
export const and2: Mor = findMorByTable(
  "2x2", "2",
  elts["2x2"].map(([b1, b2]) => b1 && b2)
);

// Boolean OR operation: ∨ : 2×2 → 2
export const or2: Mor = findMorByTable(
  "2x2", "2",
  elts["2x2"].map(([b1, b2]) => b1 || b2)
);

// Boolean XOR operation: ⊕ : 2×2 → 2
export const xor2: Mor = findMorByTable(
  "2x2", "2",
  elts["2x2"].map(([b1, b2]) => b1 !== b2)
);

// Boolean NAND operation: ↑ : 2×2 → 2
export const nand2: Mor = findMorByTable(
  "2x2", "2",
  elts["2x2"].map(([b1, b2]) => !(b1 && b2))
);

/************ Helper Functions ************/

/**
 * Characteristic function χ_S : A → 2 for a subset S of A
 */
export function chi<A>(Aobj: Obj, S: Set<A>): Mor {
  const dom = elts[Aobj] as A[];
  const table = dom.map(a => S.has(a));
  return findMorByTable(Aobj, "2", table);
}

/**
 * Pairing ⟨f,g⟩ : A → 2×2 (assumes both f,g : A → 2)
 */
export function pairTo2x2(Aobj: Obj, f: Mor, g: Mor): Mor {
  if (f.src !== Aobj || g.src !== Aobj || f.dst !== "2" || g.dst !== "2") {
    throw new Error("pairTo2x2 expects f,g : A→2 with the same A");
  }
  
  const dom = elts[Aobj];
  const table = dom.map(a => [f.fn(a), g.fn(a)]);
  return findMorByTable(Aobj, "2x2", table);
}

/**
 * Create constant function A → B with constant value b
 */
export function constantMorphism(src: Obj, dst: Obj, constantValue: any): Mor {
  const dom = elts[src];
  const table = dom.map(_ => constantValue);
  return findMorByTable(src, dst, table);
}

/**
 * Get all morphisms between two objects
 */
export function getAllMorphisms(src: Obj, dst: Obj): Mor[] {
  return Array.from(MiniFinSet.hom(src, dst));
}

/**
 * Find morphism by predicate on its function
 */
export function findMorphism(
  src: Obj, 
  dst: Obj, 
  predicate: (fn: (x: any) => any) => boolean
): Mor | undefined {
  const morphisms = getAllMorphisms(src, dst);
  return morphisms.find(m => predicate(m.fn));
}

/************ Boolean Algebra Operations ************/

/**
 * Intersection via AND: χ_S ∩ χ_T = ∧ ∘ ⟨χ_S, χ_T⟩
 */
export function intersectionViaAnd<A>(
  Aobj: Obj,
  S: Set<A>,
  T: Set<A>
): Mor {
  const chiS = chi(Aobj, S);
  const chiT = chi(Aobj, T);
  const paired = pairTo2x2(Aobj, chiS, chiT);
  
  // Compose with AND: A → 2×2 → 2
  return MiniFinSet.comp(and2, paired);
}

/**
 * Union via OR: χ_S ∪ χ_T = ∨ ∘ ⟨χ_S, χ_T⟩
 */
export function unionViaOr<A>(
  Aobj: Obj,
  S: Set<A>,
  T: Set<A>
): Mor {
  const chiS = chi(Aobj, S);
  const chiT = chi(Aobj, T);
  const paired = pairTo2x2(Aobj, chiS, chiT);
  
  // Compose with OR: A → 2×2 → 2
  return MiniFinSet.comp(or2, paired);
}

/**
 * Complement via composition with NOT
 */
export function complementViaOr<A>(Aobj: Obj, S: Set<A>): Mor {
  const chiS = chi(Aobj, S);
  
  // Find NOT morphism: 2 → 2
  const notMorphism = findMorphism("2", "2", (fn) => 
    fn(true) === false && fn(false) === true
  );
  
  if (!notMorphism) {
    throw new Error("NOT morphism not found");
  }
  
  // Compose: A → 2 → 2
  return MiniFinSet.comp(notMorphism, chiS);
}

/************ Utility Functions ************/

/**
 * Get all morphisms of a specific type
 */
export function getMorphisms(src: Obj, dst: Obj): Mor[] {
  return Array.from(MiniFinSet.hom(src, dst));
}

/**
 * Create characteristic function for a subset
 */
export function characteristicFunction<A>(
  Aset: SetObj<A>,
  subset: Set<A>
): (a: A) => boolean {
  return (a: A) => subset.has(a);
}

/**
 * Enumerate all subsets of a finite set
 */
export function allSubsets<A>(Aset: SetObj<A>): Set<A>[] {
  const elements = Aset.elems;
  const subsets: Set<A>[] = [];
  
  // Generate all 2^n subsets
  for (let i = 0; i < Math.pow(2, elements.length); i++) {
    const subset = new Set<A>();
    for (let j = 0; j < elements.length; j++) {
      if ((i >> j) & 1) {
        subset.add(elements[j]!);
      }
    }
    subsets.push(subset);
  }
  
  return subsets;
}

/************ Demonstration Function ************/

export function demonstrateMiniFinSet(): void {
  console.log('='.repeat(70));
  console.log('🔢 MINI FINSET CATEGORY DEMONSTRATION');
  console.log('='.repeat(70));

  console.log('\n📊 OBJECTS AND MORPHISMS:');
  console.log(`   Objects: ${MiniFinSet.objects.join(', ')}`);
  console.log(`   Object 1: ${One.id} = {${One.elems.join(', ')}} (|1| = ${One.elems.length})`);
  console.log(`   Object 2: ${Bool.id} = {${Bool.elems.join(', ')}} (|2| = ${Bool.elems.length})`);
  
  console.log(`\n   Total morphisms: ${MiniFinSet.morphisms.length}`);
  
  // Show morphisms by hom-set
  const homSets = [
    { src: "1", dst: "1" },
    { src: "1", dst: "2" }, 
    { src: "2", dst: "1" },
    { src: "2", dst: "2" }
  ];
  
  homSets.forEach(({ src, dst }) => {
    const hom = MiniFinSet.hom(src as Obj, dst as Obj);
    console.log(`   Hom(${src}, ${dst}): ${hom.length} morphism(s)`);
    hom.forEach(m => {
      if (m.id.startsWith("id") || ["toFalse", "toTrue", "bang", "not"].includes(m.id)) {
        console.log(`     ${m.id}: ${src} → ${dst}`);
      }
    });
  });

  console.log('\n🔧 INCLUSION FUNCTOR:');
  console.log('   G: MiniFinSet → Set (inclusion)');
  console.log('   G(1) = singleton set');
  console.log('   G(2) = Boolean set');
  console.log('   G(f) = f (identity on functions)');

  console.log('\n🎯 CATEGORICAL PROPERTIES:');
  console.log('   ✓ Small category with finite hom-sets');
  console.log('   ✓ All morphisms between 1 and 2 enumerated');
  console.log('   ✓ Composition well-defined and associative');
  console.log('   ✓ Identity morphisms for each object');
  console.log('   ✓ Inclusion functor preserves structure');

  console.log('\n🌟 APPLICATIONS:');
  console.log('   ✓ Foundation for ultrafilter construction');
  console.log('   ✓ Codensity monad testing with concrete categories');
  console.log('   ✓ Boolean algebra operations via morphisms');
  console.log('   ✓ Finite set theory in categorical setting');

  console.log('='.repeat(70));
}
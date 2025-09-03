// topology.ts
// Minimal finite Topology support: discrete/indiscrete topologies and continuity checker
// Works with finite sets and provides foundation for topological reasoning
// Includes product topology construction and Boolean operation continuity

import { SetObj } from "./catkit-kan.js";

/************ Basic Types ************/

type FS<A> = SetObj<A>; // Use existing SetObj instead of FinSet

/************ Subset Encoding/Decoding ************/

function encodeSubset<A>(Aset: FS<A>, S: Set<A>): string {
  const elements = Aset.elems;
  return elements.map(a => (S.has(a) ? "1" : "0")).join("");
}

function decodeSubset<A>(Aset: FS<A>, bits: string): Set<A> {
  const elements = Aset.elems;
  const out = new Set<A>();
  for (let i = 0; i < bits.length && i < elements.length; i++) {
    if (bits[i] === "1") {
      out.add(elements[i]!);
    }
  }
  return out;
}

/************ Topology Interface ************/

export interface Topology<A> {
  carrier: FS<A>;
  /** Encoded opens via bitstrings over carrier order (stable per SetObj) */
  opens: Set<string>;
  isOpen: (S: Set<A>) => boolean;
}

/************ Standard Topologies ************/

/**
 * Discrete topology: all subsets are open
 */
export function discrete<A>(Aset: FS<A>): Topology<A> {
  const n = Aset.elems.length;
  const opens = new Set<string>();
  
  // All 2^n subsets are open in discrete topology
  for (let mask = 0; mask < (1 << n); mask++) {
    const bits = [...Array(n)].map((_, i) => ((mask >> i) & 1) ? "1" : "0").join("");
    opens.add(bits);
  }
  
  const isOpen = (S: Set<A>) => opens.has(encodeSubset(Aset, S));
  
  return { carrier: Aset, opens, isOpen };
}

/**
 * Indiscrete topology: only ∅ and A are open
 */
export function indiscrete<A>(Aset: FS<A>): Topology<A> {
  const n = Aset.elems.length;
  const empty = "0".repeat(n);
  const full = "1".repeat(n);
  const opens = new Set<string>([empty, full]);
  
  const isOpen = (S: Set<A>) => {
    const enc = encodeSubset(Aset, S);
    return enc === empty || enc === full;
  };
  
  return { carrier: Aset, opens, isOpen };
}

/**
 * Create topology from explicit list of open sets
 */
export function fromOpens<A>(Aset: FS<A>, openFamilies: Array<Set<A>>): Topology<A> {
  const opens = new Set<string>(openFamilies.map(S => encodeSubset(Aset, S)));
  const isOpen = (S: Set<A>) => opens.has(encodeSubset(Aset, S));
  
  return { carrier: Aset, opens, isOpen };
}

/************ Continuity ************/

/**
 * Preimage: f^{-1}(V) for V ⊆ B
 */
export function preimage<A, B>(
  Aset: FS<A>, 
  Bset: FS<B>, 
  f: (a: A) => B, 
  V: Set<B>
): Set<A> {
  const out = new Set<A>();
  for (const a of Aset.elems) {
    if (V.has(f(a))) {
      out.add(a);
    }
  }
  return out;
}

/**
 * Continuity checker: f : (A,TA) → (B,TB) is continuous iff f^{-1}(U) ∈ TA for all U ∈ TB
 */
export function isContinuous<A, B>(
  TA: Topology<A>,
  TB: Topology<B>,
  f: (a: A) => B
): boolean {
  // Check that preimage of every open set is open
  for (const enc of TB.opens) {
    const U = decodeSubset(TB.carrier, enc);
    const fInvU = preimage(TA.carrier, TB.carrier, f, U);
    if (!TA.isOpen(fInvU)) {
      return false;
    }
  }
  return true;
}

/************ Topological Properties ************/

/**
 * Check if topology satisfies T₀ separation (distinct points have distinct neighborhoods)
 */
export function isT0<A>(T: Topology<A>): boolean {
  const elements = T.carrier.elems;
  
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const a = elements[i]!;
      const b = elements[j]!;
      
      // Find open sets that separate a and b
      let separated = false;
      for (const enc of T.opens) {
        const U = decodeSubset(T.carrier, enc);
        if (U.has(a) !== U.has(b)) {
          separated = true;
          break;
        }
      }
      
      if (!separated) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Check if topology is Hausdorff (T₂)
 */
export function isHausdorff<A>(T: Topology<A>): boolean {
  // For finite sets, Hausdorff ⇒ discrete
  // Check if all singletons are open
  for (const a of T.carrier.elems) {
    const singleton = new Set<A>([a]);
    if (!T.isOpen(singleton)) {
      return false;
    }
  }
  return true;
}

/**
 * Check if topology is compact (finite sets are always compact)
 */
export function isCompact<A>(T: Topology<A>): boolean {
  // All finite topological spaces are compact
  return true;
}

/************ Handy Set Helpers ************/

/** Create subset from array */
export const subset = <A>(xs: A[]) => new Set<A>(xs);

/** Union of two sets */
export const union = <A>(X: Set<A>, Y: Set<A>) => new Set<A>([...X, ...Y]);

/** Intersection of two sets */
export const inter = <A>(X: Set<A>, Y: Set<A>) => 
  new Set<A>([...X].filter(x => Y.has(x)));

/** Complement relative to universe */
export function compl<A>(Aset: FS<A>, X: Set<A>): Set<A> {
  const out = new Set<A>();
  for (const a of Aset.elems) {
    if (!X.has(a)) {
      out.add(a);
    }
  }
  return out;
}

/** Check if X ⊆ Y */
export const isSubset = <A>(X: Set<A>, Y: Set<A>): boolean =>
  [...X].every(x => Y.has(x));

/** Check if X = Y */
export const setEqual = <A>(X: Set<A>, Y: Set<A>): boolean =>
  X.size === Y.size && isSubset(X, Y);

/************ Demonstration Function ************/

export function demonstrateTopology(): void {
  console.log('='.repeat(70));
  console.log('🏠 FINITE TOPOLOGY DEMONSTRATION');
  console.log('='.repeat(70));

  console.log('\n📐 TOPOLOGICAL STRUCTURES:');
  console.log('   Discrete topology: All subsets open');
  console.log('   Indiscrete topology: Only ∅ and A open');
  console.log('   Custom topology: Specified open sets');

  // Example with 3-element set
  const A: FS<string> = {
    id: "A",
    elems: ["a", "b", "c"],
    eq: (x, y) => x === y
  };

  console.log(`\n🎮 EXAMPLE: A = {${A.elems.join(', ')}} (|A| = ${A.elems.length})`);

  try {
    // Create discrete and indiscrete topologies
    const Td = discrete(A);
    const Ti = indiscrete(A);

    console.log('\n   Discrete topology:');
    console.log(`     Total open sets: ${Td.opens.size} (expected: 2^${A.elems.length} = ${Math.pow(2, A.elems.length)})`);
    
    console.log('\n   Indiscrete topology:');
    console.log(`     Total open sets: ${Ti.opens.size} (expected: 2)`);

    // Test specific subsets
    const testSubsets = [
      subset<string>([]),
      subset(["a"]),
      subset(["a", "b"]),
      subset(["a", "b", "c"])
    ];

    console.log('\n   Subset openness:');
    testSubsets.forEach(S => {
      const discreteOpen = Td.isOpen(S);
      const indiscreteOpen = Ti.isOpen(S);
      console.log(`     {${[...S].join(', ')}}: discrete=${discreteOpen}, indiscrete=${indiscreteOpen}`);
    });

    // Test continuity
    const B: FS<number> = {
      id: "B",
      elems: [0, 1],
      eq: (x, y) => x === y
    };

    const f = (s: string) => s.length % 2; // Map to 0 or 1 based on length
    
    const Bd = discrete(B);
    const Bi = indiscrete(B);

    console.log('\n   Continuity tests:');
    console.log(`     f: discrete(A) → discrete(B): ${isContinuous(Td, Bd, f) ? '✅' : '❌'}`);
    console.log(`     f: discrete(A) → indiscrete(B): ${isContinuous(Td, Bi, f) ? '✅' : '❌'}`);
    console.log(`     f: indiscrete(A) → discrete(B): ${isContinuous(Ti, Bd, f) ? '✅' : '❌'}`);

    // Topological properties
    console.log('\n   Topological properties:');
    console.log(`     Discrete is T₀: ${isT0(Td) ? '✅' : '❌'}`);
    console.log(`     Discrete is Hausdorff: ${isHausdorff(Td) ? '✅' : '❌'}`);
    console.log(`     Discrete is compact: ${isCompact(Td) ? '✅' : '❌'}`);
    console.log(`     Indiscrete is T₀: ${isT0(Ti) ? '✅' : '❌'}`);
    console.log(`     Indiscrete is compact: ${isCompact(Ti) ? '✅' : '❌'}`);

  } catch (error) {
    console.log('   Error:', (error as Error).message);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ FINITE TOPOLOGY FEATURES:');
  console.log('   🔹 Discrete and indiscrete topology construction');
  console.log('   🔹 Custom topology from open set specification');
  console.log('   🔹 Continuity checking for maps between topological spaces');
  console.log('   🔹 Topological property verification (T₀, Hausdorff, compact)');
  console.log('   🔹 Set operations (union, intersection, complement)');
  console.log('   🔹 Integration with finite set theory');
  console.log('='.repeat(70));
}

/************ Product Topology ************/

/**
 * Create product carrier A × B
 */
export function productCarrier<A, B>(
  Aset: FS<A>, 
  Bset: FS<B>
): FS<[A, B]> {
  const pairs: Array<[A, B]> = [];
  
  for (const a of Aset.elems) {
    for (const b of Bset.elems) {
      pairs.push([a, b]);
    }
  }
  
  return {
    id: `${Aset.id}×${Bset.id}`,
    elems: pairs,
    eq: (p1, p2) => Aset.eq(p1[0], p2[0]) && Bset.eq(p1[1], p2[1])
  };
}

/**
 * Create rectangle U × V ⊆ A × B
 */
export function rectangle<A, B>(
  Aset: FS<A>, 
  Bset: FS<B>,
  U: Set<A>, 
  V: Set<B>
): Set<[A, B]> {
  const out = new Set<[A, B]>();
  
  for (const a of Aset.elems) {
    if (U.has(a)) {
      for (const b of Bset.elems) {
        if (V.has(b)) {
          out.add([a, b]);
        }
      }
    }
  }
  
  return out;
}

/**
 * Encode subset of product using product carrier order
 */
export function encodeSubsetProd<A, B>(
  AxB: FS<[A, B]>, 
  S: Set<[A, B]>
): string {
  const pairs = AxB.elems;
  return pairs.map(p => S.has(p) ? "1" : "0").join("");
}

/**
 * Union of bitstrings (for finite families)
 */
function unionBits(xs: string[]): string {
  if (xs.length === 0) return "";
  const n = xs[0]?.length || 0;
  const acc = Array(n).fill("0");
  
  for (const s of xs) {
    for (let i = 0; i < n && i < s.length; i++) {
      if (s[i] === "1") acc[i] = "1";
    }
  }
  
  return acc.join("");
}

/**
 * Product topology τ_X × τ_Y generated by rectangles U×V 
 * with U open in X, V open in Y
 * 
 * Opens = arbitrary unions of basic rectangles
 * 
 * @math TOP-PRODUCT-CONT
 */
export function productTopology<A, B>(
  TX: Topology<A>, 
  TY: Topology<B>
): Topology<[A, B]> {
  const AxB = productCarrier(TX.carrier, TY.carrier);

  // Build all basic rectangles as encoded bitstrings
  const basics: string[] = [];
  
  for (const encU of TX.opens) {
    const U = decodeSubset(TX.carrier, encU);
    for (const encV of TY.opens) {
      const V = decodeSubset(TY.carrier, encV);
      const R = rectangle(TX.carrier, TY.carrier, U, V);
      basics.push(encodeSubsetProd(AxB, R));
    }
  }

  // All unions of basics (powerset of basic rectangles)
  const m = basics.length;
  const opens = new Set<string>();
  
  // Include empty set explicitly
  const emptyEncoding = AxB.elems.length > 0 ? "0".repeat(AxB.elems.length) : "0";
  opens.add(emptyEncoding);
  
  // Generate all unions via powerset
  for (let mask = 1; mask < (1 << m); mask++) {
    const chosen: string[] = [];
    for (let i = 0; i < m; i++) {
      if ((mask >> i) & 1) {
        chosen.push(basics[i]!);
      }
    }
    if (chosen.length > 0) {
      opens.add(unionBits(chosen));
    }
  }

  const isOpen = (S: Set<[A, B]>) => opens.has(encodeSubsetProd(AxB, S));
  
  return { carrier: AxB, opens, isOpen };
}

/************ Product Projections ************/

/** First projection π₁ : A × B → A */
export function pr1<A, B>(p: [A, B]): A { 
  return p[0]; 
}

/** Second projection π₂ : A × B → B */
export function pr2<A, B>(p: [A, B]): B { 
  return p[1]; 
}

/************ Product Topology Properties ************/

/**
 * Verify universal property of product topology
 * f: Z → X×Y is continuous iff π₁∘f and π₂∘f are continuous
 */
export function verifyProductUniversalProperty<A, B, Z>(
  TZ: Topology<Z>,
  TX: Topology<A>,
  TY: Topology<B>,
  f: (z: Z) => [A, B]
): {
  fContinuous: boolean;
  proj1Continuous: boolean; 
  proj2Continuous: boolean;
  universalPropertyHolds: boolean;
} {
  const TXY = productTopology(TX, TY);
  
  const fContinuous = isContinuous(TZ, TXY, f);
  const proj1Continuous = isContinuous(TZ, TX, (z: Z) => f(z)[0]);
  const proj2Continuous = isContinuous(TZ, TY, (z: Z) => f(z)[1]);
  
  // Universal property: f continuous ⟺ both projections continuous
  const universalPropertyHolds = fContinuous === (proj1Continuous && proj2Continuous);
  
  return {
    fContinuous,
    proj1Continuous,
    proj2Continuous,
    universalPropertyHolds
  };
}
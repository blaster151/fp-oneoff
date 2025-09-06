// Minimal, runtime-checkable group structure over a concrete carrier `A`
// We support both finite carriers (enumerated) and infinite ones (no enumeration).
export interface Group<A> {
  readonly eq: (x: A, y: A) => boolean;   // decidable equality for tests/witnesses
  readonly op: (x: A, y: A) => A;          // group operation (associative)
  readonly id: A;                          // identity element
  readonly inv: (x: A) => A;               // inverse
  // Optional: total listing of elements for finite groups (enables decision procedures)
  readonly elements?: readonly A[];
}

// Structure-respecting map between groups
export interface GroupHom<A, B> {
  readonly source: Group<A>;
  readonly target: Group<B>;
  readonly map: (a: A) => B;
}

// Isomorphism = homomorphism with a **homomorphic**, two-sided inverse.
// We store both directions plus explicit witnesses of the laws.
export interface GroupIso<A, B> {
  readonly to: GroupHom<A, B>;
  readonly from: GroupHom<B, A>;
  // Witnesses (verifiable for finite groups)
  readonly leftInverse: (b: B) => boolean;  // from.map(to.map(a)) == a  (checked via source.elements if present)
  readonly rightInverse: (a: A) => boolean; // to.map(from.map(b)) == b  (checked via target.elements if present)
}

// Narrow special case: automorphism
export type GroupAuto<A> = GroupIso<A, A>;

// --- Utilities ---

export function isHomomorphism<A, B>(h: GroupHom<A, B>): boolean {
  const { source: G, target: H, map: f } = h;
  if (!G.elements) return true; // cannot decide; assume responsibility to the caller
  // identity law: f(e_G) = e_H
  if (!H.eq(f(G.id), H.id)) return false;
  // operation preservation: f(x * y) = f(x) ⋆ f(y)
  for (const x of G.elements) {
    for (const y of G.elements) {
      const lhs = f(G.op(x, y));
      const rhs = H.op(f(x), f(y));
      if (!H.eq(lhs, rhs)) return false;
    }
  }
  return true;
}

export function isBijectionFinite<A, B>(h: GroupHom<A, B>): boolean {
  const { source: G, target: H, map: f } = h;
  if (!G.elements || !H.elements) return false;
  if (G.elements.length !== H.elements.length) return false;
  // injective + surjective via images covering without collisions
  const image: B[] = G.elements.map(f);
  // surjective: every target element appears in image
  for (const b of H.elements) {
    if (!image.some(x => H.eq(x, b))) return false;
  }
  // injective: equal images imply equal preimages
  for (let i = 0; i < G.elements.length; i++) {
    for (let j = i + 1; j < G.elements.length; j++) {
      const bi = image[i], bj = image[j];
      if (H.eq(bi, bj) && !G.eq(G.elements[i], G.elements[j])) return false;
    }
  }
  return true;
}

// --- Theorem 4: Two-sided Inverse Characterization ---

// Witness that f and g are inverses
export interface InverseWitness<A, B> {
  readonly f: GroupHom<A, B>;
  readonly g: GroupHom<B, A>;
  readonly leftIdentity: boolean;  // g ∘ f = id_A
  readonly rightIdentity: boolean; // f ∘ g = id_B
}

// Create inverse witness by checking round-trip laws
export function makeInverseWitness<A, B>(
  f: GroupHom<A, B>,
  g: GroupHom<B, A>,
  elemsA?: readonly A[],
  elemsB?: readonly B[]
): InverseWitness<A, B> {
  // For finite groups, check all elements; for infinite, assume responsibility to caller
  const leftIdentity = elemsA ? 
    elemsA.every(a => f.source.eq(g.map(f.map(a)), a)) : true;
  const rightIdentity = elemsB ? 
    elemsB.every(b => f.target.eq(f.map(g.map(b)), b)) : true;
  
  return { f, g, leftIdentity, rightIdentity };
}

// Theorem 4: f is an isomorphism iff there exists g such that round-trips equal identity
export function isIsomorphismByInverse<A, B>(witness: InverseWitness<A, B>): boolean {
  return witness.leftIdentity && witness.rightIdentity && 
         isHomomorphism(witness.f) && isHomomorphism(witness.g);
}

// Legacy function for backward compatibility
export function isIsomorphismByInverseLegacy<A, B>(iso: GroupIso<A, B>): boolean {
  const { to, from, leftInverse, rightInverse } = iso;
  if (!isHomomorphism(to)) return false;
  if (!isHomomorphism(from)) return false;
  // If we can enumerate, check witnesses everywhere; otherwise trust the provided functions
  const allA: A[] | undefined = to.source.elements?.slice();
  const allB: B[] | undefined = to.target.elements?.slice();

  if (allA) {
    for (const a of allA) {
      const b = to.map(a);
      const back = from.map(b);
      if (!to.source.eq(back, a)) return false;
      if (!rightInverse(a)) return false;
    }
  }
  if (allB) {
    for (const b of allB) {
      const a = from.map(b);
      const forth = to.map(a);
      if (!to.target.eq(forth, b)) return false;
      if (!leftInverse(b)) return false;
    }
  }
  return true;
}

// For finite groups, decide isomorphism by explicit inverse + hom laws + bijectivity.
export function isIsomorphismFinite<A, B>(iso: GroupIso<A, B>): boolean {
  const bij = isBijectionFinite(iso.to);
  return bij && isIsomorphismByInverseLegacy(iso);
}

// --- Equivalence Relation Infrastructure ---

// Witness pack for equivalence relation properties
export interface EquivalenceWitness<A> {
  readonly reflexive: (a: A) => boolean;   // a ~ a
  readonly symmetric: (a: A, b: A) => boolean; // a ~ b => b ~ a
  readonly transitive: (a: A, b: A, c: A) => boolean; // a ~ b && b ~ c => a ~ c
}

// Generic equivalence relation checker
export function isEquivalenceRelation<A>(
  eq: (a: A, b: A) => boolean,
  elements: readonly A[]
): EquivalenceWitness<A> {
  return {
    reflexive: (a: A) => eq(a, a),
    symmetric: (a: A, b: A) => !eq(a, b) || eq(b, a),
    transitive: (a: A, b: A, c: A) => !(eq(a, b) && eq(b, c)) || eq(a, c)
  };
}

// --- Categorical Characterizations ---

// --- Categorical Re-characterization: From Elements to Arrows ---

// Categorical monomorphism = left-cancellable morphism
// f is monomorphism if whenever f ∘ g = f ∘ h, then g = h
export function isMonomorphismCategorical<A, B, J>(
  f: GroupHom<A, B>,
  testDomain: Group<J>,
  testHomomorphisms: Array<{ g: GroupHom<J, A>; h: GroupHom<J, A> }>
): boolean {
  // For each test pair (g, h), check if f ∘ g = f ∘ h implies g = h
  for (const { g, h } of testHomomorphisms) {
    // Check if f ∘ g = f ∘ h (compositions agree everywhere)
    const compositionsAgree = testDomain.elements?.every(j => {
      const gResult = g.map(j);
      const hResult = h.map(j);
      const fgResult = f.map(gResult);
      const fhResult = f.map(hResult);
      return f.target.eq(fgResult, fhResult);
    }) ?? true; // assume true for infinite groups
    
    // If compositions agree but g ≠ h, then f is not a monomorphism
    if (compositionsAgree) {
      const gAndHDiffer = testDomain.elements?.some(j => {
        const gResult = g.map(j);
        const hResult = h.map(j);
        return !g.source.eq(gResult, hResult);
      }) ?? false;
      
      if (gAndHDiffer) {
        return false; // f ∘ g = f ∘ h but g ≠ h, so f is not mono
      }
    }
  }
  return true;
}

// Element-based monomorphism (legacy, for comparison)
export function isMonomorphismElementBased<A, B>(h: GroupHom<A, B>): boolean {
  const { source: G, target: H, map: f } = h;
  if (!G.elements) return true; // cannot decide for infinite groups
  
  // Check injectivity: f(x) = f(y) => x = y
  for (let i = 0; i < G.elements.length; i++) {
    for (let j = i + 1; j < G.elements.length; j++) {
      const x = G.elements[i], y = G.elements[j];
      if (H.eq(f(x), f(y)) && !G.eq(x, y)) {
        return false;
      }
    }
  }
  return true;
}

// Backward compatibility alias
export const isMonomorphism = isMonomorphismElementBased;

// Categorical epimorphism = right-cancellable morphism
// f is epimorphism if whenever g ∘ f = h ∘ f, then g = h
export function isEpimorphismCategorical<A, B, K>(
  f: GroupHom<A, B>,
  testCodomain: Group<K>,
  testHomomorphisms: Array<{ g: GroupHom<B, K>; h: GroupHom<B, K> }>
): boolean {
  // For each test pair (g, h), check if g ∘ f = h ∘ f implies g = h
  for (const { g, h } of testHomomorphisms) {
    // Check if g ∘ f = h ∘ f (compositions agree everywhere)
    const compositionsAgree = f.source.elements?.every(a => {
      const fResult = f.map(a);
      const gfResult = g.map(fResult);
      const hfResult = h.map(fResult);
      return g.target.eq(gfResult, hfResult);
    }) ?? true; // assume true for infinite groups
    
    // If compositions agree but g ≠ h, then f is not an epimorphism
    if (compositionsAgree) {
      const gAndHDiffer = f.target.elements?.some(b => {
        const gResult = g.map(b);
        const hResult = h.map(b);
        return !g.source.eq(gResult, hResult);
      }) ?? false;
      
      if (gAndHDiffer) {
        return false; // g ∘ f = h ∘ f but g ≠ h, so f is not epi
      }
    }
  }
  return true;
}

// Element-based epimorphism (legacy, for comparison)
export function isEpimorphismElementBased<A, B>(h: GroupHom<A, B>): boolean {
  const { source: G, target: H, map: f } = h;
  if (!G.elements || !H.elements) return true; // cannot decide for infinite groups
  
  // Check surjectivity: every element in H is image of some element in G
  for (const b of H.elements) {
    let found = false;
    for (const a of G.elements) {
      if (H.eq(f(a), b)) {
        found = true;
        break;
      }
    }
    if (!found) return false;
  }
  return true;
}

// Backward compatibility alias
export const isEpimorphism = isEpimorphismElementBased;

// --- Composition Utilities for Arrow-Based Properties ---

// Compose two homomorphisms: h ∘ g
export function composeHomomorphisms<A, B, C>(
  g: GroupHom<A, B>,
  h: GroupHom<B, C>
): GroupHom<A, C> {
  return {
    source: g.source,
    target: h.target,
    map: (a: A) => h.map(g.map(a))
  };
}

// Check if two homomorphisms are equal (pointwise)
export function homomorphismsEqual<A, B>(
  f: GroupHom<A, B>,
  g: GroupHom<A, B>
): boolean {
  if (!f.source.elements) return true; // cannot decide for infinite groups
  
  return f.source.elements.every(a => 
    f.target.eq(f.map(a), g.map(a))
  );
}

// --- Bridge Demonstration: Element-Based vs Arrow-Based ---

// Demonstrates the bridge from element-based to arrow-based properties
export interface CategoricalBridge<A, B> {
  readonly elementBased: {
    readonly isMono: boolean;
    readonly isEpi: boolean;
    readonly isIso: boolean;
  };
  readonly arrowBased: {
    readonly isMono: boolean;
    readonly isEpi: boolean;
    readonly isIso: boolean;
  };
  readonly bridgeValid: boolean; // element-based === arrow-based for groups
}

// Create bridge demonstration for a homomorphism
export function createCategoricalBridge<A, B>(
  f: GroupHom<A, B>,
  testDomain?: Group<any>,
  testCodomain?: Group<any>,
  testPairs?: {
    mono: Array<{ g: GroupHom<any, A>; h: GroupHom<any, A> }>;
    epi: Array<{ g: GroupHom<B, any>; h: GroupHom<B, any> }>;
  }
): CategoricalBridge<A, B> {
  // Element-based properties
  const elementBased = {
    isMono: isMonomorphismElementBased(f),
    isEpi: isEpimorphismElementBased(f),
    isIso: isMonomorphismElementBased(f) && isEpimorphismElementBased(f)
  };
  
  // Arrow-based properties (if test data provided)
  let arrowBased = {
    isMono: true,
    isEpi: true,
    isIso: true
  };
  
  if (testDomain && testCodomain && testPairs) {
    arrowBased = {
      isMono: isMonomorphismCategorical(f, testDomain, testPairs.mono),
      isEpi: isEpimorphismCategorical(f, testCodomain, testPairs.epi),
      isIso: false // would need both mono and epi tests
    };
    arrowBased.isIso = arrowBased.isMono && arrowBased.isEpi;
  }
  
  // For groups, element-based and arrow-based should agree
  const bridgeValid = 
    elementBased.isMono === arrowBased.isMono &&
    elementBased.isEpi === arrowBased.isEpi &&
    elementBased.isIso === arrowBased.isIso;
  
  return {
    elementBased,
    arrowBased,
    bridgeValid
  };
}

// --- Auto-derivation for Isomorphism Equivalence ---

// Theorem 3: Isomorphism is an equivalence relation
export function isomorphismEquivalenceWitness<A>(G: Group<A>): EquivalenceWitness<GroupIso<A, A>> {
  if (!G.elements) {
    // For infinite groups, provide trivial witnesses
    return {
      reflexive: () => true,
      symmetric: () => true, 
      transitive: () => true
    };
  }

  return {
    // Reflexive: identity isomorphism
    reflexive: (iso: GroupIso<A, A>) => {
      for (const a of G.elements!) {
        if (!G.eq(iso.to.map(a), a)) return false;
      }
      return true;
    },
    
    // Symmetric: inverse of isomorphism is isomorphism
    symmetric: (iso1: GroupIso<A, A>, iso2: GroupIso<A, A>) => {
      // Check if iso2 is the inverse of iso1
      for (const a of G.elements!) {
        const b = iso1.to.map(a);
        const back = iso2.to.map(b);
        if (!G.eq(back, a)) return false;
      }
      return true;
    },
    
    // Transitive: composition of isomorphisms is isomorphism
    transitive: (iso1: GroupIso<A, A>, iso2: GroupIso<A, A>, iso3: GroupIso<A, A>) => {
      // Check if iso3 = iso2 ∘ iso1
      for (const a of G.elements!) {
        const b = iso1.to.map(a);
        const c = iso2.to.map(b);
        const d = iso3.to.map(a);
        if (!G.eq(c, d)) return false;
      }
      return true;
    }
  };
}

// --- Witness Packs for Categorical Notions ---

// Comprehensive witness pack for homomorphism properties
export interface HomomorphismWitness<A, B> {
  readonly isHomomorphism: boolean;
  readonly isMonomorphism: boolean;
  readonly isEpimorphism: boolean;
  readonly isIsomorphism: boolean;
}

// Auto-derivation: given a homomorphism, derive all categorical properties
export function deriveHomomorphismWitness<A, B>(h: GroupHom<A, B>): HomomorphismWitness<A, B> {
  const isHom = isHomomorphism(h);
  const isMono = isHom && isMonomorphism(h);
  const isEpi = isHom && isEpimorphism(h);
  const isIso = isMono && isEpi;
  
  return {
    isHomomorphism: isHom,
    isMonomorphism: isMono,
    isEpimorphism: isEpi,
    isIsomorphism: isIso
  };
}

// Witness pack for group properties
export interface GroupWitness<A> {
  readonly isGroup: boolean;
  readonly isAbelian: boolean;
  readonly order: number | "infinite";
}

// Auto-derivation: given a group, derive its properties
export function deriveGroupWitness<A>(G: Group<A>): GroupWitness<A> {
  if (!G.elements) {
    return {
      isGroup: true, // assume responsibility to caller for infinite groups
      isAbelian: true, // cannot decide for infinite groups
      order: "infinite"
    };
  }
  
  // Check if it's actually a group (basic laws)
  let isGroup = true;
  let isAbelian = true;
  
  // Check associativity, identity, inverse laws
  for (const x of G.elements) {
    for (const y of G.elements) {
      for (const z of G.elements) {
        // Associativity: (x * y) * z = x * (y * z)
        const left = G.op(G.op(x, y), z);
        const right = G.op(x, G.op(y, z));
        if (!G.eq(left, right)) {
          isGroup = false;
        }
        
        // Commutativity: x * y = y * x
        if (!G.eq(G.op(x, y), G.op(y, x))) {
          isAbelian = false;
        }
      }
      
      // Identity: x * e = e * x = x
      if (!G.eq(G.op(x, G.id), x) || !G.eq(G.op(G.id, x), x)) {
        isGroup = false;
      }
      
      // Inverse: x * x^{-1} = x^{-1} * x = e
      const inv = G.inv(x);
      if (!G.eq(G.op(x, inv), G.id) || !G.eq(G.op(inv, x), G.id)) {
        isGroup = false;
      }
    }
  }
  
  return {
    isGroup,
    isAbelian,
    order: G.elements.length
  };
}

// --- General Categorical Interface (Generalization Hook) ---

// General categorical interface: morphism with inverse
export interface Category<A> {
  readonly id: (a: A) => A;
  readonly compose: <X, Y, Z>(
    f: (y: Y) => Z,
    g: (x: X) => Y
  ) => (x: X) => Z;
}

// Generic function to check if two morphisms are inverses
export function hasInverse<A, B>(
  f: (a: A) => B,
  g: (b: B) => A,
  elemsA?: readonly A[],
  elemsB?: readonly B[],
  eqA?: (a1: A, a2: A) => boolean,
  eqB?: (b1: B, b2: B) => boolean
): boolean {
  // Use provided equality or default to reference equality
  const eqA_fn = eqA || ((a1: A, a2: A) => a1 === a2);
  const eqB_fn = eqB || ((b1: B, b2: B) => b1 === b2);
  
  // For finite sets, check all elements; for infinite, assume responsibility to caller
  const left = elemsA ? 
    elemsA.every(a => eqA_fn(g(f(a)), a)) : true;
  const right = elemsB ? 
    elemsB.every(b => eqB_fn(f(g(b)), b)) : true;
  
  return left && right;
}

// Law-checker: requires proper inverse witnesses
export interface IsomorphismLawChecker<A, B> {
  readonly checkInverse: (f: GroupHom<A, B>, g: GroupHom<B, A>) => InverseWitness<A, B>;
  readonly validateIsomorphism: (witness: InverseWitness<A, B>) => boolean;
}

// Create law checker for a specific group pair
export function createIsomorphismLawChecker<A, B>(
  sourceElems?: readonly A[],
  targetElems?: readonly B[]
): IsomorphismLawChecker<A, B> {
  return {
    checkInverse: (f: GroupHom<A, B>, g: GroupHom<B, A>) => {
      return makeInverseWitness(f, g, sourceElems, targetElems);
    },
    
    validateIsomorphism: (witness: InverseWitness<A, B>) => {
      return isIsomorphismByInverse(witness);
    }
  };
}

// --- Proof-Driven Isomorphism Checking ---

// Round-trip inverse checking that encodes the proof steps
export function checkIsInverse<A, B>(
  f: GroupHom<A, B>,
  g: GroupHom<B, A>,
  elemsA: readonly A[],
  elemsB: readonly B[]
): boolean {
  // Step 1: confirm g preserves the operation (homomorphism law)
  const preservesOp = elemsB.every((x) =>
    elemsB.every((y) => {
      const lhs = g.map(f.target.op(x, y));
      const rhs = f.source.op(g.map(x), g.map(y));
      return f.source.eq(lhs, rhs);
    })
  );

  // Step 2: confirm left and right identity laws (round-trips)
  const left = elemsA.every(a => f.source.eq(g.map(f.map(a)), a));
  const right = elemsB.every(b => f.target.eq(f.map(g.map(b)), b));

  return preservesOp && left && right;
}

// Automatic inverse construction workflow
export function tryBuildInverse<A, B>(
  f: GroupHom<A, B>,
  elemsA: readonly A[],
  elemsB: readonly B[]
): GroupHom<B, A> | null {
  // Build the inverse map by inverting f
  const map = new Map<B, A>();
  
  for (const a of elemsA) {
    const b = f.map(a);
    if (map.has(b)) return null; // not injective - can't build inverse
    map.set(b, a);
  }
  
  // Check if we have a complete inverse (surjective)
  for (const b of elemsB) {
    if (!map.has(b)) return null; // not surjective - can't build inverse
  }
  
  // Create the inverse homomorphism
  const g: GroupHom<B, A> = {
    source: f.target,
    target: f.source,
    map: (b: B) => map.get(b)!
  };
  
  return g;
}

// Proof workflow: mechanically derive isomorphism
export interface ProofWorkflow<A, B> {
  readonly attemptInverseConstruction: () => GroupHom<B, A> | null;
  readonly validateProof: (g: GroupHom<B, A>) => boolean;
  readonly isIsomorphism: boolean;
  readonly proof: {
    readonly step1_inverseExists: boolean;
    readonly step2_inverseIsHomomorphism: boolean;
    readonly step3_roundTripsValid: boolean;
  };
}

// Create proof workflow for a homomorphism
export function createProofWorkflow<A, B>(
  f: GroupHom<A, B>,
  elemsA?: readonly A[],
  elemsB?: readonly B[]
): ProofWorkflow<A, B> {
  if (!elemsA || !elemsB) {
    // For infinite groups, provide trivial workflow
    return {
      attemptInverseConstruction: () => null,
      validateProof: () => false,
      isIsomorphism: false,
      proof: {
        step1_inverseExists: false,
        step2_inverseIsHomomorphism: false,
        step3_roundTripsValid: false
      }
    };
  }

  let constructedInverse: GroupHom<B, A> | null = null;
  let proofValid = false;

  return {
    attemptInverseConstruction: () => {
      constructedInverse = tryBuildInverse(f, elemsA, elemsB);
      return constructedInverse;
    },
    
    validateProof: (g: GroupHom<B, A>) => {
      proofValid = checkIsInverse(f, g, elemsA, elemsB);
      return proofValid;
    },
    
    get isIsomorphism() {
      if (!constructedInverse) return false;
      return checkIsInverse(f, constructedInverse, elemsA, elemsB);
    },
    
    get proof() {
      const step1 = constructedInverse !== null;
      const step2 = step1 && isHomomorphism(constructedInverse!);
      const step3 = step2 && checkIsInverse(f, constructedInverse!, elemsA, elemsB);
      
      return {
        step1_inverseExists: step1,
        step2_inverseIsHomomorphism: step2,
        step3_roundTripsValid: step3
      };
    }
  };
}
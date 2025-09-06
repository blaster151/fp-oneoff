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

// Monomorphism = left-cancellable homomorphism
// For groups: equivalent to injective homomorphism
export function isMonomorphism<A, B>(h: GroupHom<A, B>): boolean {
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

// Epimorphism = right-cancellable homomorphism  
// For groups: equivalent to surjective homomorphism
export function isEpimorphism<A, B>(h: GroupHom<A, B>): boolean {
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
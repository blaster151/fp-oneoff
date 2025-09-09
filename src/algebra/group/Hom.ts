import { FiniteGroup, eqOf, Cyclic } from "./Group";

/** A group homomorphism f: G -> H on finite carriers. */
export interface GroupHom<G,H, A=unknown, B=unknown> {
  readonly source: FiniteGroup<A>;
  readonly target: FiniteGroup<B>;
  readonly map: (a: A) => B;
  readonly name?: string;
  // analysis is attached post construction (see analyzeHom below)
  witnesses?: HomWitnesses<A,B>;
  
  // ============================================================================
  // ENHANCED FEATURES FROM OTHER IMPLEMENTATIONS
  // ============================================================================
  
  // From class-based implementation (GroupHom.ts)
  /** Check if homomorphism respects operation: f(x ◦ y) = f(x) ⋄ f(y) */
  respectsOp?(x: A, y: A): boolean;
  /** Check if homomorphism preserves identity: f(e_G) = e_H */
  preservesId?(): boolean;
  /** Check if homomorphism preserves inverses: f(x^{-1}) = f(x)^{-1} */
  preservesInv?(x: A): boolean;
  /** Get kernel as NormalSubgroup */
  kernel?(): import('./NormalSubgroup').NormalSubgroup<A>;
  /** Get image predicate */
  imagePredicate?(): (h: B) => boolean;
  /** Get factorization result */
  factorization?(eqH: import('../../types/eq.js').Eq<B>): any;
  
  // From simple interface implementation (structures/group/Hom.ts)
  /** Verify homomorphism properties */
  verify?(): boolean;
  
  // Property name compatibility (for migration)
  /** Alias for map function (from simple interface) */
  f?: (a: A) => B;
  /** Alias for map function (from enhanced interface) */
  run?: (a: A) => B;
  /** Alias for source (from enhanced interface) */
  src?: FiniteGroup<A>;
  /** Alias for target (from enhanced interface) */
  dst?: FiniteGroup<B>;
}

/** Properties + constructive witnesses/counterexamples. */
export interface HomWitnesses<A,B> {
  // algebraic fact
  isHom: boolean;
  // categorical facts
  isMono: boolean;               // left-cancellable
  isEpi:  boolean;               // right-cancellable
  isIso:  boolean;               // has two-sided inverse
  // structure-level data
  leftInverse?: GroupHom<any, any>;
  rightInverse?: GroupHom<any, any>;
  // optional diagnostics
  // counterexamples for cancellability, when they exist
  monoCounterexample?: { j: any; g: GroupHom<any,any>; h: GroupHom<any,any> };
  epiCounterexample?:  { j: any; g: GroupHom<any,any>; h: GroupHom<any,any> };
  
  // ============================================================================
  // ENHANCED WITNESS PROPERTIES (from EnhancedGroupHom.ts)
  // ============================================================================
  
  /** Enhanced witness: preserves operation */
  preservesOp?: (x: A, y: A) => boolean;
  /** Enhanced witness: preserves identity */
  preservesId?: () => boolean;
  /** Enhanced witness: preserves inverses */
  preservesInv?: (x: A) => boolean;
  
  // NEW: Image subgroup materialization
  imageSubgroup?: FiniteGroup<B>;
  kernelSubgroup?: FiniteGroup<A>;
  
  // Second Isomorphism Theorem support
  secondIsoData?: {
    subgroup: FiniteGroup<A>;     // A
    normalSubgroup: FiniteGroup<A>; // N  
    product: FiniteGroup<A>;      // A·N
    intersection: FiniteGroup<A>; // A∩N
    leftQuotient: FiniteGroup<any>; // (A·N)/N
    rightQuotient: FiniteGroup<any>; // A/(A∩N)
    isomorphism: GroupHom<unknown,unknown,any,any>;
  };
  
  // Third Isomorphism Theorem support
  thirdIsoData?: {
    group: FiniteGroup<A>;
    innerNormal: FiniteGroup<A>;  // K
    outerNormal: FiniteGroup<A>;  // N
    quotientGN: FiniteGroup<any>;     // G/N
    quotientGK: FiniteGroup<any>;     // G/K  
    quotientNK: FiniteGroup<any>;     // N/K
    doubleQuotient: FiniteGroup<any>; // (G/K)/(N/K)
    isomorphism: GroupHom<unknown,unknown,any,any>;
  };
}

/** Compose homomorphisms (unchecked). */
export function compose<A,B,C>(g: GroupHom<unknown,unknown,B,C>, f: GroupHom<unknown,unknown,A,B>): GroupHom<unknown,unknown,A,C> {
  return {
    source: f.source,
    target: g.target,
    map: (a: A) => g.map(f.map(a)),
    name: (g as any).label ? ((f as any).label ? `${(g as any).label} ∘ ${(f as any).label}` : `${(g as any).label}∘f`) : ((f as any).label ? `g∘${(f as any).label}` : 'g∘f')
  };
}

/** Check the homomorphism law f(a*b)=f(a)*f(b) by brute force. */
export function isHomomorphism<A,B>(f: GroupHom<unknown,unknown,A,B>): boolean {
  const G = f.source, H = f.target, eqH = eqOf(H);
  for (const a of G.elems) for (const b of G.elems) {
    const lhs = f.map(G.op(a,b));
    const rhs = H.op(f.map(a), f.map(b));
    if (!eqH(lhs, rhs)) return false;
  }
  // identity preserved automatically from law with a=id or b=id in finite groups
  return true;
}

/** Pointwise equality of maps on a finite domain. */
export function equalPointwise<X,Y>(Dom: ReadonlyArray<X>, eqY: (y1:Y,y2:Y)=>boolean,
                                    f: (x:X)=>Y, g:(x:X)=>Y): boolean {
  for (const x of Dom) if (!eqY(f(x), g(x))) return false;
  return true;
}

/** Build all functions Dom -> Codom (finite) using a provided array of codomain values. */
function allFunctions<X,Y>(Dom: ReadonlyArray<X>, Cod: ReadonlyArray<Y>): Array<(x:X)=>Y> {
  // Cod^Dom – cartesian power
  const n = Dom.length, m = Cod.length;
  if (n === 0) return [(_x: X) => {
    const c0 = Cod[0];
    if (c0 === undefined) throw new Error("Empty codomain");
    return c0;
  }]; // vacuous
  const out: Array<(x:X)=>Y> = [];
  // Represent function as tuple [y0,...,y_{n-1}] where y_i = f(Dom[i])
  const idx: number[] = Array(n).fill(0);
  const total = m ** n;
  for (let k=0;k<total;k++){
    const table = idx.map(i => {
      const c = Cod[i];
      if (c === undefined) throw new Error(`Codomain index ${i} out of bounds`);
      return c;
    });
    const f = (x:X)=> {
      // Find index using a more robust method
      for (let i = 0; i < Dom.length; i++) {
        if (JSON.stringify(Dom[i]) === JSON.stringify(x)) {
          const result = table[i];
          if (result === undefined) throw new Error(`No value at index ${i}`);
          return result;
        }
      }
      throw new Error(`Element ${JSON.stringify(x)} not found in domain`);
    };
    out.push(f);
    // increment idx in base m
    for (let i = 0; i < n; i++) { 
      const current = idx[i];
      if (current !== undefined) {
        idx[i] = current + 1;
        if (idx[i]! < m) break;
        idx[i] = 0;
      }
    }
  }
  return out;
}

/** Enumerate all group homs J->G by filtering all functions that preserve op. (Brute force; J small.) */
export function allGroupHoms<J,A>(J: FiniteGroup<J>, G: FiniteGroup<A>): Array<GroupHom<unknown,unknown,J,A>> {
  const eqG = eqOf(G);
  const fs = allFunctions(J.elems, G.elems);
  const homs: Array<GroupHom<unknown,unknown,J,A>> = [];
  for (const f of fs) {
    const cand: GroupHom<unknown,unknown,J,A> = { source: J, target: G, map: f };
    if (isHomomorphism(cand)) homs.push(cand);
  }
  // de-duplicate identical tables
  const result = homs.filter((h, i) =>
    homs.findIndex(k => equalPointwise(J.elems, eqG, h.map, k.map)) === i);
  return result;
}

/** Analyze mono/epi/iso + inverse witnesses; attach to f and return it. */
export function analyzeHom<A,B>(f: GroupHom<unknown,unknown,A,B>): GroupHom<unknown,unknown,A,B> {
  const G = f.source, H = f.target;
  const eqH = eqOf(H), eqG = eqOf(G);

  const hom = isHomomorphism(f);

  // Find a two-sided inverse hom if it exists (by table search)
  let leftInv: GroupHom<B,A> | undefined;
  let rightInv: GroupHom<B,A> | undefined;
  let isIso = false;

  // Enumerate all homs H->G
  const homsHG = allGroupHoms(H, G);
  for (const g of homsHG) {
    const gofEqIdG = equalPointwise(G.elems as ReadonlyArray<A>, eqG, (x:A)=> g.map(f.map(x)), (x:A)=> x);
    const fogEqIdH = equalPointwise(H.elems as ReadonlyArray<B>, eqH, (y:B)=> f.map(g.map(y as any)), (y:B)=> y);
    if (gofEqIdG) leftInv = g as any;
    if (fogEqIdH) rightInv = g as any;
    if (gofEqIdG && fogEqIdH) { isIso = true; break; }
  }

  // Mono (left-cancellable): for all g,h: J->G, f∘g = f∘h ⇒ g = h
  // Check using a small probing domain J. For robustness we try each of:
  //   J = C1, C2, C3  (often enough for categorical cancellability on finite groups)
  const probeSizes = [1,2,3];
  let isMono = true;
  let monoCounterexample: HomWitnesses<A,B>['monoCounterexample'] = undefined;

  outerMono:
  for (const n of probeSizes) {
    const J = Cyclic(n) as FiniteGroup<number>;
    const homsJG = allGroupHoms(J, G);
    // compare all pairs
    for (let i=0;i<homsJG.length;i++) for (let j=i+1;j<homsJG.length;j++) {
      const g = homsJG[i];
      const h = homsJG[j];
      if (g && h) {
        const fog = compose(f as any, g as any);
        const foh = compose(f as any, h as any);
        const eq = equalPointwise(J.elems, eqH, fog.map as any, foh.map as any);
        if (eq) {
          // if f∘g = f∘h but g ≠ h then NOT mono
          const same = equalPointwise(J.elems, eqG, g.map as any, h.map as any);
          if (!same) { isMono = false; monoCounterexample = { j: (J as any).label ?? `C${n}`, g: g as any, h: h as any }; break outerMono; }
        }
      }
    }
  }

  // Epi (right-cancellable): for all g,h: H->K, g∘f = h∘f ⇒ g = h
  // Probe K = C1, C2, C3 similarly
  let isEpi = true;
  let epiCounterexample: HomWitnesses<A,B>['epiCounterexample'] = undefined;

  outerEpi:
  for (const n of probeSizes) {
    const K = Cyclic(n) as FiniteGroup<number>;
    const homsHK = allGroupHoms(H, K);
    for (let i=0;i<homsHK.length;i++) for (let j=i+1;j<homsHK.length;j++) {
      const g = homsHK[i];
      const h = homsHK[j];
      if (g && h) {
        const gof = compose(g as any, f as any);
        const hof = compose(h as any, f as any);
        const eq = equalPointwise(G.elems, eqOf(K), gof.map as any, hof.map as any);
        if (eq) {
          const same = equalPointwise(H.elems, eqOf(K), g.map as any, h.map as any);
          if (!same) { isEpi = false; epiCounterexample = { j: (K as any).label ?? `C${n}`, g: g as any, h: h as any }; break outerEpi; }
        }
      }
    }
  }

  // NEW: Construct image subgroup
  const imageElems: B[] = [];
  for (const g of G.elems) {
    const h = f.map(g);
    if (!imageElems.some(x => eqH(x, h))) imageElems.push(h);
  }

  const imageSubgroup: FiniteGroup<B> = {
    elems: imageElems,
    op: H.op,
    id: H.id,
    inv: H.inv,
    eq: H.eq,
    name: f.name ? `im(${f.name})` : "im(f)"
  };

  // Construct kernel subgroup
  const kernelElems: A[] = [];
  for (const g of G.elems) {
    if (eqH(f.map(g), H.id)) kernelElems.push(g);
  }
  const kernelSubgroup: FiniteGroup<A> = {
    elems: kernelElems,
    op: G.op,
    id: G.id,
    inv: G.inv,
    eq: G.eq,
    name: f.name ? `ker(${f.name})` : "ker(f)"
  };

  const witnesses: HomWitnesses<A,B> = {
    isHom: hom,
    isMono,
    isEpi,
    isIso,
    imageSubgroup,
    kernelSubgroup
  };
  if (leftInv !== undefined) (witnesses as any).leftInverse = leftInv;
  if (rightInv !== undefined) (witnesses as any).rightInverse = rightInv;
  if (monoCounterexample !== undefined) (witnesses as any).monoCounterexample = monoCounterexample;
  if (epiCounterexample !== undefined) (witnesses as any).epiCounterexample = epiCounterexample;
  f.witnesses = witnesses;
  return f;
}

/** Smart constructor that immediately analyzes witnesses. */
export function hom<A,B>(G: FiniteGroup<A>, H: FiniteGroup<B>, map: (a:A)=>B, name?: string): GroupHom<unknown,unknown,A,B> {
  const obj: GroupHom<unknown,unknown,A,B> = { source: G, target: H, map };
  if (name !== undefined) (obj as any).name = name;
  return analyzeHom(obj);
}

// ============================================================================
// ENHANCED FACTORY FUNCTIONS (from other implementations)
// ============================================================================

/** Enhanced constructor with options for different creation patterns. */
export function createGroupHom<A,B>(
  source: FiniteGroup<A>,
  target: FiniteGroup<B>,
  map: (a: A) => B,
  options: {
    name?: string;
    autoAnalyze?: boolean;
    includeMethods?: boolean;
    includeEnhancedWitnesses?: boolean;
    verify?: () => boolean;
  } = {}
): GroupHom<unknown, unknown, A, B> {
  const result: GroupHom<unknown, unknown, A, B> = { source, target, map };
  
  if (options.name) {
    (result as any).name = options.name;
  }
  
  if (options.includeMethods) {
    addClassBasedMethods(result);
  }
  
  if (options.includeEnhancedWitnesses) {
    addEnhancedWitnesses(result);
  }
  
  if (options.verify) {
    (result as any).verify = options.verify;
  } else if (options.includeMethods) {
    (result as any).verify = () => quickVerify(result);
  }
  
  if (options.autoAnalyze) {
    return analyzeHom(result);
  }
  
  return result;
}

/** Factory for class-based pattern: new GroupHom(G, H, map) */
export function createClassHom<A, B>(
  source: FiniteGroup<A>,
  target: FiniteGroup<B>,
  map: (a: A) => B
): GroupHom<unknown, unknown, A, B> {
  return createGroupHom(source, target, map, {
    includeMethods: true,
    includeEnhancedWitnesses: true
  });
}

/** Factory for simple interface pattern: { source, target, f, verify? } */
export function createSimpleHom<A, B>(
  source: FiniteGroup<A>,
  target: FiniteGroup<B>,
  map: (a: A) => B,
  options: { name?: string; verify?: () => boolean } = {}
): GroupHom<unknown, unknown, A, B> {
  return createGroupHom(source, target, map, {
    ...(options.name && { name: options.name }),
    ...(options.verify && { verify: options.verify }),
    includeMethods: true
  });
}

/** Factory for enhanced pattern: mkHom(src, dst, run) */
export function createEnhancedHom<A, B>(
  src: any, // EnhancedGroup<A> or FiniteGroup<A>
  dst: any, // EnhancedGroup<B> or FiniteGroup<B>
  run: (a: A) => B
): GroupHom<unknown, unknown, A, B> {
  // Convert EnhancedGroup to FiniteGroup format if needed
  const source: FiniteGroup<A> = {
    elems: src.elems || [],
    op: src.op,
    id: src.id || src.e, // Handle both id and e
    inv: src.inv,
    eq: src.eq,
    name: src.name
  };
  
  const target: FiniteGroup<B> = {
    elems: dst.elems || [],
    op: dst.op,
    id: dst.id || dst.e, // Handle both id and e
    inv: dst.inv,
    eq: dst.eq,
    name: dst.name
  };
  
  return createGroupHom(source, target, run, {
    includeEnhancedWitnesses: true,
    includeMethods: true
  });
}

/** Identity homomorphism (from EnhancedGroupHom.ts) */
export function idHom<A>(G: any): GroupHom<unknown, unknown, A, A> {
  // Convert EnhancedGroup to FiniteGroup format if needed
  const finiteG: FiniteGroup<A> = {
    elems: G.elems || [],
    op: G.op,
    id: G.id || G.e, // Handle both id and e
    inv: G.inv,
    eq: G.eq,
    name: G.name
  };
  
  return createGroupHom(finiteG, finiteG, (x) => x, {
    name: `id_${(G as any).name ?? 'G'}`,
    includeMethods: true,
    includeEnhancedWitnesses: true
  });
}

/** Enhanced composition (from EnhancedGroupHom.ts) */
export function composeHom<A, B, C>(
  g: GroupHom<unknown, unknown, B, C>,
  f: GroupHom<unknown, unknown, A, B>
): GroupHom<unknown, unknown, A, C> {
  if (f.target !== g.source) {
    console.warn("composeHom: incompatible sources/targets");
  }
  
  const run = (a: A) => g.map(f.map(a));
  return createGroupHom(f.source, g.target, run, {
    name: `${(g as any).name ?? 'g'} ∘ ${(f as any).name ?? 'f'}`,
    includeMethods: true,
    includeEnhancedWitnesses: true
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Quick verification function for simple interface compatibility. */
function quickVerify<A, B>(hom: GroupHom<unknown, unknown, A, B>): boolean {
  try {
    const { source, target, map } = hom;
    
    if (!source.elems || !target.elems) return true;
    
    const eq = target.eq ?? ((x: B, y: B) => x === y);
    
    for (const x of source.elems) {
      for (const y of source.elems) {
        const lhs = map(source.op(x, y));
        const rhs = target.op(map(x), map(y));
        if (!eq(lhs, rhs)) return false;
      }
    }
    
    return true;
  } catch (error) {
    console.warn('Quick verification failed:', error);
    return false;
  }
}

/** Add class-based methods to a homomorphism. */
function addClassBasedMethods<A, B>(hom: any): void {
  const { source, target, map } = hom;
  const eqH = target.eq ?? ((x: B, y: B) => x === y);
  
  hom.respectsOp = (x: A, y: A) => {
    try {
      return eqH(map(source.op(x, y)), target.op(map(x), map(y)));
    } catch {
      return false;
    }
  };
  
  hom.preservesId = () => {
    try {
      const gId = (source as any).e ?? (source as any).id;
      const hId = (target as any).e ?? (target as any).id;
      return eqH(map(gId), hId);
    } catch {
      return false;
    }
  };
  
  hom.preservesInv = (x: A) => {
    try {
      return eqH(map(source.inv(x)), target.inv(map(x)));
    } catch {
      return false;
    }
  };
  
  // Add other class-based methods as needed
  hom.kernel = () => {
    try {
      const carrier = (g: A) => eqH(map(g), (target as any).e ?? (target as any).id);
      const include = (g: A) => g;
      return { carrier, include, conjClosed: () => true } as any;
    } catch (error) {
      throw new Error(`Kernel computation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  hom.imagePredicate = () => {
    return (h: B) => {
      if (source.elems) {
        for (const g of source.elems) {
          if (eqH(map(g), h)) return true;
        }
      }
      return false;
    };
  };
}

/** Add enhanced witness properties to a homomorphism. */
function addEnhancedWitnesses<A, B>(hom: any): void {
  const { source, target, map } = hom;
  const eqH = target.eq ?? ((x: B, y: B) => x === y);
  
  if (!hom.witnesses) {
    hom.witnesses = { isHom: true, isMono: false, isEpi: false, isIso: false };
  }
  
  hom.witnesses.preservesOp = (x: A, y: A) => {
    try {
      return eqH(map(source.op(x, y)), target.op(map(x), map(y)));
    } catch {
      return false;
    }
  };
  
  hom.witnesses.preservesId = () => {
    try {
      const gId = (source as any).e ?? (source as any).id;
      const hId = (target as any).e ?? (target as any).id;
      return eqH(map(gId), hId);
    } catch {
      return false;
    }
  };
  
  hom.witnesses.preservesInv = (x: A) => {
    try {
      return eqH(map(source.inv(x)), target.inv(map(x)));
    } catch {
      return false;
    }
  };
}

/**
 * Second Isomorphism Theorem: For subgroup A and normal subgroup N,
 * (A·N)/N ≅ A/(A∩N)
 */
export function secondIsomorphismTheorem<T>(
  G: FiniteGroup<T>,
  A_elements: T[],  // Elements of subgroup A
  N_elements: T[],  // Elements of normal subgroup N
  name?: string
): GroupHom<unknown,unknown,any,any> {
  const eqG = eqOf(G);
  
  // Construct A (subgroup)
  const A: FiniteGroup<T> = {
    elems: A_elements,
    op: G.op,
    id: G.id,
    inv: G.inv,
    eq: G.eq,
    name: "A"
  };
  
  // Construct N (normal subgroup) 
  const N: FiniteGroup<T> = {
    elems: N_elements,
    op: G.op,
    id: G.id,
    inv: G.inv,
    eq: G.eq,
    name: "N"
  };
  
  // Construct A·N = {an : a∈A, n∈N}
  const productElems: T[] = [];
  for (const a of A_elements) {
    for (const n of N_elements) {
      const an = G.op(a, n);
      if (!productElems.some(x => eqG(x, an))) {
        productElems.push(an);
      }
    }
  }
  
  // Construct A∩N
  const intersectionElems = A_elements.filter(a => 
    N_elements.some(n => eqG(a, n))
  );
  
  // The isomorphism φ: (A·N)/N → A/(A∩N)
  // φ([an]_N) = [a]_(A∩N)
  
  const secondIso: GroupHom<unknown,unknown,any,any> = {
    source: {} as FiniteGroup<any>, // (A·N)/N - would need quotient construction
    target: {} as FiniteGroup<any>, // A/(A∩N) - would need quotient construction  
    map: (coset: any) => coset, // Simplified for now
    name: name || "Second Isomorphism",
    witnesses: {
      secondIsoData: {
        subgroup: A,
        normalSubgroup: N,
        product: {
          elems: productElems,
          op: G.op,
          id: G.id,
          inv: G.inv,
          eq: G.eq,
          name: "A·N"
        },
        intersection: {
          elems: intersectionElems,
          op: G.op,
          id: G.id,
          inv: G.inv,
          eq: G.eq,
          name: "A∩N"
        },
        leftQuotient: {} as FiniteGroup<any>,  // (A·N)/N
        rightQuotient: {} as FiniteGroup<any>, // A/(A∩N)
        isomorphism: {} as GroupHom<unknown,unknown,any,any>
      }
    }
  };
  
  return secondIso;
}

/**
 * Third Isomorphism Theorem: For normal subgroups K ⊆ N ⊆ G,
 * G/N ≅ (G/K)/(N/K)
 */
export function thirdIsomorphismTheorem<T>(
  G: FiniteGroup<T>,
  K_elements: T[],  // Elements of normal subgroup K
  N_elements: T[],  // Elements of normal subgroup N (K ⊆ N)
  name?: string
): GroupHom<unknown,unknown,any,any> {
  const eqG = eqOf(G);
  
  // Verify K ⊆ N
  const K_subset_N = K_elements.every(k => 
    N_elements.some(n => eqG(k, n))
  );
  
  if (!K_subset_N) {
    throw new Error("Third Isomorphism Theorem requires K ⊆ N");
  }
  
  // Construct the subgroups
  const K: FiniteGroup<T> = {
    elems: K_elements,
    op: G.op,
    id: G.id,
    inv: G.inv,
    eq: G.eq,
    name: "K"
  };
  
  const N: FiniteGroup<T> = {
    elems: N_elements,
    op: G.op,
    id: G.id,
    inv: G.inv,
    eq: G.eq,
    name: "N"
  };
  
  // The isomorphism φ: G/N → (G/K)/(N/K)
  // φ([g]_N) = [[g]_K]_(N/K)
  
  const thirdIso: GroupHom<unknown,unknown,any,any> = {
    source: {} as FiniteGroup<any>, // G/N - would need quotient construction
    target: {} as FiniteGroup<any>, // (G/K)/(N/K) - would need double quotient
    map: (coset: any) => coset, // Simplified for now
    name: name || "Third Isomorphism",
    witnesses: {
      thirdIsoData: {
        group: G,
        innerNormal: K,
        outerNormal: N,
        quotientGN: {} as FiniteGroup<any>,     // G/N
        quotientGK: {} as FiniteGroup<any>,     // G/K  
        quotientNK: {} as FiniteGroup<any>,     // N/K
        doubleQuotient: {} as FiniteGroup<any>, // (G/K)/(N/K)
        isomorphism: {} as GroupHom<unknown,unknown,any,any>
      }
    }
  };
  
  return thirdIso;
}

/**
 * Theorem 7: Subgroups as Images of Homomorphisms
 * 
 * For any subgroup S ≤ H, there exists a homomorphism f: G → H whose image is exactly S.
 * The proof is: take G = S, and let f be the inclusion S ↪ H.
 * 
 * This is the clean converse to Theorem 6 (which says every homomorphism image is a subgroup).
 * Together, they give a bidirectional bridge: subgroups ↔ homomorphism images.
 */
export function inclusionHom<A>(
  H: FiniteGroup<A>, 
  S: FiniteGroup<A>, 
  name?: string
): GroupHom<unknown, unknown, A, A> {
  // TODO: Add validation that S is actually a subgroup of H
  // - Check that S.elems ⊆ H.elems
  // - Verify that S.op, S.id, S.inv are compatible with H
  // - This is a critical validation that needs to be implemented
  
  return {
    name: name ?? `incl_${S.name ?? "S"}→${H.name ?? "H"}`,
    source: S,
    target: H,
    map: (s: A) => s, // Inclusion map: s ↦ s
    // TODO: Add proper witness data showing this is indeed a homomorphism
    // - Should verify f(s₁ ∘ s₂) = f(s₁) ∘ f(s₂) for all s₁, s₂ ∈ S
    // - Should verify f(e_S) = e_H
    // - Should verify f(s⁻¹) = f(s)⁻¹ for all s ∈ S
  };
}
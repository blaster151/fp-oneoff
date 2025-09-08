import { FiniteGroup, eqOf, Cyclic } from "./Group";

/** A group homomorphism f: G -> H on finite carriers. */
export interface GroupHom<G,H, A=unknown, B=unknown> {
  readonly source: FiniteGroup<A>;
  readonly target: FiniteGroup<B>;
  readonly map: (a: A) => B;
  readonly name?: string;
  // analysis is attached post construction (see analyzeHom below)
  witnesses?: HomWitnesses<A,B>;
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

  const witnesses: HomWitnesses<A,B> = {
    isHom: hom,
    isMono,
    isEpi,
    isIso
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
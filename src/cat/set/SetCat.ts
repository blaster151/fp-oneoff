// Finite Set category: objects are finite carriers, morphisms are total functions.

export interface FiniteSet<A> {
  readonly elems: ReadonlyArray<A>;
  readonly eq: (x: A, y: A) => boolean;
  readonly name: string;
}

export const eqOf = <A>(S: FiniteSet<A>) => S.eq ?? ((x, y) => Object.is(x, y));

export function SetObj<A>(
  elems: ReadonlyArray<A>,
  opts?: { eq?: (x: A, y: A) => boolean; name?: string }
): FiniteSet<A> {
  // ensure uniqueness to keep reasoning simple
  const uniq: A[] = [];
  const eq = opts?.eq ?? ((x: A, y: A) => Object.is(x, y));
  for (const a of elems) if (!uniq.some(b => eq(a, b))) uniq.push(a);
  return { elems: uniq, eq, name: opts?.name ?? "Set" };
}

// ---------- morphisms + witnesses ----------

export interface SetHom<A,B> {
  readonly source: FiniteSet<A>;
  readonly target: FiniteSet<B>;
  readonly map: (a: A) => B;
  readonly name: string;
  witnesses?: SetWitnesses<A,B>;
}

export interface SetWitnesses<A,B> {
  isTotal: true;                         // by construction
  injective: boolean;                    // underlying function injective
  surjective: boolean;                   // underlying function surjective
  bijective: boolean;                    // injective && surjective
  isMono: boolean;                       // left-cancellable (== injective in Set)
  isEpi: boolean;                        // right-cancellable (== surjective in Set)
  inverse?: SetHom<B,A>;                 // present iff bijective
}

export function setHom<A,B>(A: FiniteSet<A>, B: FiniteSet<B>, map: (a:A)=>B, name?: string): SetHom<A,B> {
  const f: SetHom<A,B> = { source: A, target: B, map, name: name ?? "f" };
  return analyzeSetHom(f);
}

export function analyzeSetHom<A,B>(f: SetHom<A,B>): SetHom<A,B> {
  const A = f.source, B = f.target;
  const eqB = eqOf(B), eqA = eqOf(A);

  // injective
  let injective = true;
  outer: for (let i=0;i<A.elems.length;i++) for (let j=i+1;j<A.elems.length;j++) {
    const xi = A.elems[i], xj = A.elems[j];
    if (eqB(f.map(xi), f.map(xj))) { injective = false; break outer; }
  }

  // surjective
  const image: B[] = [];
  for (const a of A.elems) {
    const y = f.map(a as A);
    if (!image.some(z => eqB(z, y))) image.push(y);
  }
  const surjective = B.elems.every(b => image.some(y => eqB(y, b)));

  const bijective = injective && surjective;

  // inverse if bijection: construct by table
  let inverse: SetHom<B,A> | undefined;
  if (bijective) {
    const table = A.elems.map(a => ({ a, b: f.map(a) }));
    const invMap = (b:B) => {
      const hit = table.find(t => eqB(t.b, b));
      if (!hit) throw new Error("logic: missing inverse entry");
      return hit.a;
    };
    inverse = { source: B, target: A, map: invMap, name: f.name ? `${f.name}⁻¹` : 'inv' };
  }

  f.witnesses = {
    isTotal: true,
    injective,
    surjective,
    bijective,
    isMono: injective,
    isEpi: surjective,
    inverse
  };
  return f;
}
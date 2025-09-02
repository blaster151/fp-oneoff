// catkit-comma-categories.ts
// Comma categories (F ↓ G) and slice/coslice constructions
// Provides the fundamental comma category construction that appears throughout category theory:
// - Slice categories C ↓ c (objects over c)
// - Coslice categories c ↓ C (objects under c) 
// - General comma (F ↓ G) for arbitrary functors F: A → C, G: B → C
//
// These are essential for:
// - Limits and colimits (as terminal/initial objects in slice categories)
// - Kan extensions (characterized via (co)ends over comma categories)
// - Adjunctions (natural isomorphisms between comma categories)

// ------------------------------------------------------------
// Generic category and functor interfaces (compatible with existing code)
// ------------------------------------------------------------

export interface Category<Obj, Mor> {
  id(o: Obj): Mor;
  dom(m: Mor): Obj;
  cod(m: Mor): Obj;
  compose(g: Mor, f: Mor): Mor; // g ∘ f, require cod(f) = dom(g)
}

export interface Functor<AObj, AMor, BObj, BMor> {
  dom: Category<AObj, AMor>;
  cod: Category<BObj, BMor>;
  onObj(a: AObj): BObj;
  onMor(f: AMor): BMor; // preserves id and compose
}

// ------------------------------------------------------------
// Comma category objects and morphisms
// ------------------------------------------------------------

/** Object in comma category (F ↓ G): triple (a, b, α) where α: F(a) → G(b) */
export type CommaObj<AObj, BObj, CMor> = {
  readonly a: AObj;
  readonly b: BObj;
  readonly alpha: CMor; // α: F(a) → G(b) in C
};

/** Morphism in comma category (F ↓ G): pair (f, g) making the square commute */
export type CommaMor<AMor, BMor> = {
  readonly f: AMor; // a → a' in A
  readonly g: BMor; // b → b' in B
};

// ------------------------------------------------------------
// Comma category construction
// ------------------------------------------------------------

/**
 * Build the comma category (F ↓ G) from functors F: A → C and G: B → C
 * 
 * Objects: (a, b, α) where α: F(a) → G(b)
 * Morphisms: (f: a → a', g: b → b') such that G(g) ∘ α = α' ∘ F(f)
 */
export function comma<AObj, AMor, BObj, BMor, CObj, CMor>(
  F: Functor<AObj, AMor, CObj, CMor>,
  G: Functor<BObj, BMor, CObj, CMor>
): Category<CommaObj<AObj, BObj, CMor>, CommaMor<AMor, BMor>> & {
  mkObj: (a: AObj, b: BObj, alpha: CMor) => CommaObj<AObj, BObj, CMor>;
  mkMor: (
    x: CommaObj<AObj, BObj, CMor>,
    y: CommaObj<AObj, BObj, CMor>,
    f: AMor,
    g: BMor
  ) => CommaMor<AMor, BMor>;
  checkCommute: (
    x: CommaObj<AObj, BObj, CMor>,
    y: CommaObj<AObj, BObj, CMor>,
    f: AMor,
    g: BMor
  ) => boolean;
} {
  const A = F.dom;
  const B = G.dom;
  const C = F.cod; // same as G.cod

  function wellTyped(o: CommaObj<AObj, BObj, CMor>): boolean {
    return C.dom(o.alpha) === F.onObj(o.a) && C.cod(o.alpha) === G.onObj(o.b);
  }

  function checkCommute(
    x: CommaObj<AObj, BObj, CMor>,
    y: CommaObj<AObj, BObj, CMor>,
    f: AMor,
    g: BMor
  ): boolean {
    // Check typing
    if (A.dom(f) !== x.a || A.cod(f) !== y.a) return false;
    if (B.dom(g) !== x.b || B.cod(g) !== y.b) return false;
    
    // Check commuting square: G(g) ∘ α = α' ∘ F(f)
    const left = C.compose(G.onMor(g), x.alpha);
    const right = C.compose(y.alpha, F.onMor(f));
    
    // For now, use simple equality (in practice you'd need proper morphism equality)
    return left === right;
  }

  function mkObj(a: AObj, b: BObj, alpha: CMor): CommaObj<AObj, BObj, CMor> {
    const obj = { a, b, alpha };
    if (!wellTyped(obj)) throw new Error("mkObj: α: F(a) → G(b) type mismatch");
    return obj;
  }

  function mkMor(
    x: CommaObj<AObj, BObj, CMor>,
    y: CommaObj<AObj, BObj, CMor>,
    f: AMor,
    g: BMor
  ): CommaMor<AMor, BMor> {
    if (!checkCommute(x, y, f, g)) {
      throw new Error("mkMor: commuting square G(g) ∘ α ≠ α' ∘ F(f)");
    }
    return { f, g };
  }

  function id(o: CommaObj<AObj, BObj, CMor>): CommaMor<AMor, BMor> {
    if (!wellTyped(o)) throw new Error("comma.id: ill-typed object");
    return { f: A.id(o.a), g: B.id(o.b) };
  }

  function dom(m: CommaMor<AMor, BMor>): CommaObj<AObj, BObj, CMor> {
    // Note: This is incomplete - we need the actual alpha from context
    // In practice, morphisms would carry more type information
    throw new Error("comma.dom: requires morphism context (not implementable generically)");
  }

  function cod(m: CommaMor<AMor, BMor>): CommaObj<AObj, BObj, CMor> {
    // Note: This is incomplete - we need the actual alpha from context
    throw new Error("comma.cod: requires morphism context (not implementable generically)");
  }

  function compose(m2: CommaMor<AMor, BMor>, m1: CommaMor<AMor, BMor>): CommaMor<AMor, BMor> {
    return { 
      f: A.compose(m2.f, m1.f), 
      g: B.compose(m2.g, m1.g) 
    };
  }

  return { id, dom, cod, compose, mkObj, mkMor, checkCommute };
}

// ------------------------------------------------------------
// Slice and coslice categories as special cases
// ------------------------------------------------------------

/** One-object terminal category 1 = {•} */
export const ONE_CATEGORY = {
  id: () => "id" as const,
  dom: () => "•" as const,
  cod: () => "•" as const,
  compose: () => "id" as const
} as Category<"•", "id">;

/**
 * Slice category C ↓ c: objects are morphisms x → c in C
 * This is isomorphic to (Id_C ↓ Δ_c) where Δ_c: 1 → C picks c
 */
export function slice<CObj, CMor>(
  C: Category<CObj, CMor>, 
  c: CObj
): Category<CommaObj<CObj, "•", CMor>, CommaMor<CMor, "id">> & {
  mkSliceObj: (x: CObj, f: CMor) => CommaObj<CObj, "•", CMor>;
  mkSliceMor: (
    obj1: CommaObj<CObj, "•", CMor>,
    obj2: CommaObj<CObj, "•", CMor>,
    h: CMor
  ) => CommaMor<CMor, "id">;
} {
  const Id: Functor<CObj, CMor, CObj, CMor> = { 
    dom: C, cod: C, 
    onObj: x => x, 
    onMor: f => f 
  };
  
  const Const_c: Functor<"•", "id", CObj, CMor> = {
    dom: ONE_CATEGORY, 
    cod: C,
    onObj: () => c,
    onMor: () => C.id(c)
  };

  const base = comma(Id, Const_c);

  function mkSliceObj(x: CObj, f: CMor): CommaObj<CObj, "•", CMor> {
    if (C.cod(f) !== c) throw new Error("mkSliceObj: f must have codomain c");
    if (C.dom(f) !== x) throw new Error("mkSliceObj: f must have domain x");
    return { a: x, b: "•", alpha: f };
  }

  function mkSliceMor(
    obj1: CommaObj<CObj, "•", CMor>,
    obj2: CommaObj<CObj, "•", CMor>,
    h: CMor
  ): CommaMor<CMor, "id"> {
    // Check that h: obj1.a → obj2.a and obj2.alpha ∘ h = obj1.alpha
    if (C.dom(h) !== obj1.a || C.cod(h) !== obj2.a) {
      throw new Error("mkSliceMor: h has wrong domain/codomain");
    }
    const composed = C.compose(obj2.alpha, h);
    if (composed !== obj1.alpha) {
      throw new Error("mkSliceMor: triangle doesn't commute");
    }
    return { f: h, g: "id" };
  }

  return {
    ...base,
    mkSliceObj,
    mkSliceMor
  };
}

/**
 * Coslice category c ↓ C: objects are morphisms c → x in C
 * This is isomorphic to (Δ_c ↓ Id_C) where Δ_c: 1 → C picks c
 */
export function coslice<CObj, CMor>(
  C: Category<CObj, CMor>, 
  c: CObj
): Category<CommaObj<"•", CObj, CMor>, CommaMor<"id", CMor>> & {
  mkCosliceObj: (x: CObj, f: CMor) => CommaObj<"•", CObj, CMor>;
  mkCosliceMor: (
    obj1: CommaObj<"•", CObj, CMor>,
    obj2: CommaObj<"•", CObj, CMor>,
    h: CMor
  ) => CommaMor<"id", CMor>;
} {
  const Id: Functor<CObj, CMor, CObj, CMor> = { 
    dom: C, cod: C, 
    onObj: x => x, 
    onMor: f => f 
  };
  
  const Const_c: Functor<"•", "id", CObj, CMor> = {
    dom: ONE_CATEGORY, 
    cod: C,
    onObj: () => c,
    onMor: () => C.id(c)
  };

  const base = comma(Const_c, Id);

  function mkCosliceObj(x: CObj, f: CMor): CommaObj<"•", CObj, CMor> {
    if (C.dom(f) !== c) throw new Error("mkCosliceObj: f must have domain c");
    if (C.cod(f) !== x) throw new Error("mkCosliceObj: f must have codomain x");
    return { a: "•", b: x, alpha: f };
  }

  function mkCosliceMor(
    obj1: CommaObj<"•", CObj, CMor>,
    obj2: CommaObj<"•", CObj, CMor>,
    h: CMor
  ): CommaMor<"id", CMor> {
    // Check that h: obj1.b → obj2.b and h ∘ obj1.alpha = obj2.alpha
    if (C.dom(h) !== obj1.b || C.cod(h) !== obj2.b) {
      throw new Error("mkCosliceMor: h has wrong domain/codomain");
    }
    const composed = C.compose(h, obj1.alpha);
    if (composed !== obj2.alpha) {
      throw new Error("mkCosliceMor: triangle doesn't commute");
    }
    return { f: "id", g: h };
  }

  return {
    ...base,
    mkCosliceObj,
    mkCosliceMor
  };
}
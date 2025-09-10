// Plural vs singular categories, with law witnesses.

// A morphism is any value; we carry source/target at the category level.
export type Obj = unknown;
export type Mor = unknown;

// --- Law witnesses ----------------------------------------------------------

/** Proof (witness) that composition is associative. */
export interface AssocWitness<C extends BaseCategory> {
  // Given composable h∘g∘f, witness (h∘g)∘f = h∘(g∘f).
  assoc: (f: Mor, g: Mor, h: Mor) => boolean;
}

/** Proof (witness) that identities behave as left/right units. */
export interface IdWitness<C extends BaseCategory> {
  leftId: (id: Mor, f: Mor) => boolean;
  rightId: (f: Mor, id: Mor) => boolean;
}

// --- Base & refinements -----------------------------------------------------

export interface BaseCategory {
  /** Type/brand string only for human/debug purposes. */
  readonly tag: string;

  /** Equality on objects and morphisms (extensible). */
  equalObj: (a: Obj, b: Obj) => boolean;
  equalMor: (f: Mor, g: Mor) => boolean;

  /** Domain/codomain */
  dom: (f: Mor) => Obj;
  cod: (f: Mor) => Obj;

  /** Identity and composition */
  id: (a: Obj) => Mor;
  comp: (g: Mor, f: Mor) => Mor; // g ∘ f (cod f = dom g)

  /** Law witnesses (can be partial during construction, but prefer present) */
  laws?: {
    assoc?: AssocWitness<any>;
    id?: IdWitness<any>;
  };
}

/**
 * Small categories: explicit enumeration of objects and hom-sets.
 * This is our "singular/set talk".
 */
export interface SmallCategory extends BaseCategory {
  /** Explicit list (finite or countable-enum via generator). */
  objects(): Iterable<Obj>;

  /** All morphisms between two given objects, explicitly enumerable. */
  hom(a: Obj, b: Obj): Iterable<Mor>;
}

/**
 * Large categories: we *don't* enumerate all objects (plural/virtual talk).
 * But each hom(a,b) must still be "locally small" (enumerable/constructible when needed).
 */
export interface LargeCategory extends BaseCategory {
  /** Not enumerable; marker communicates "plural" modeling. */
  readonly objects: "large";

  /** Hom-sets still enumerable/constructible on demand. */
  hom(a: Obj, b: Obj): Iterable<Mor>;
}

// Type guards
export const isSmall = (C: BaseCategory): C is SmallCategory =>
  typeof (C as any).objects === "function";

export const isLarge = (C: BaseCategory): C is LargeCategory =>
  (C as any).objects === "large";

// Adapter: small -> large view
export function asLarge(C: SmallCategory): LargeCategory {
  return {
    ...C,
    objects: "large" as const,
    // hom stays the same
  };
}
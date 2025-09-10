// GOAL: Phantom-branded universes + "Small<U,T>" wrapper + minimal ops
// Don't import anything from app code here; keep this tiny and dependency-free.

export type Brand<S extends string> = { readonly __brand: S };

export type UniverseId = Brand<"UniverseId">;

// A specific universe token (phantom). Example U0, U1 will be values of this.
export type UToken<U extends UniverseId> = { readonly U: U };

// Small<U,T>: a carrier T that is declared to live inside universe U.
export type Small<U extends UniverseId, T> = { readonly value: T } & Brand<`Small@${string & U}`>;

// Minimal closure operations we will actually use.
// Keep these total, deterministic, and explicit; no global mutable state.
export interface UniverseOps<U extends UniverseId> {
  // Brand/unbrand (private to ops)—only ops can create Small<U,T>.
  readonly toSmall: <T>(x: T) => Small<U, T>;
  readonly fromSmall: <T>(s: Small<U, T>) => T;

  // Finite constructors (guaranteed small in any universe).
  pair<A, B>(a: Small<U, A>, b: Small<U, B>): Small<U, readonly [A, B]>;
  inl<A, B>(a: Small<U, A>): Small<U, { tag: "inl"; value: A }>;
  inr<A, B>(b: Small<U, B>): Small<U, { tag: "inr"; value: B }>;

  // Small finite lists (we'll use arrays only for genuinely finite demos/tests).
  list<T>(...xs: Small<U, T>[]): Small<U, readonly T[]>;

  // "Function space" constructor: represent U-small function sets as total maps on small finite carriers.
  // For infinite carriers, you must not use this; we expose it anyway to support finite testbeds.
  func<A, B>(dom: Small<U, readonly A[]>, f: (a: A) => B): Small<U, (a: A) => B>;

  // Optional helpers used by algebraic structures:
  eqvClass<A>(rep: Small<U, A>): Small<U, { readonly rep: A }>;
}

// A registry to declare universes and inclusions (U ⊂ U'):
export type UniverseInclusion<SmallU extends UniverseId, BigU extends UniverseId> = {
  readonly small: UToken<SmallU>;
  readonly big: UToken<BigU>;
};

// Example concrete universes (more can be added):
export const U0: UToken<Brand<"U0">> = { U: { __brand: "U0" } as Brand<"U0"> };
export const U1: UToken<Brand<"U1">> = { U: { __brand: "U1" } as Brand<"U1"> };

export const U0_in_U1: UniverseInclusion<Brand<"U0">, Brand<"U1">> = { small: U0, big: U1 };

// A naive in-memory ops instance that allows finite constructions.
// NOTE: This is *not* set theory—just a disciplined API we control.
export const finiteOpsU0: UniverseOps<Brand<"U0">> = {
  toSmall: <T>(x: T) => ({ value: x, __brand: "Small@U0" } as any),
  fromSmall: <T>(s: any) => s.value as T,
  pair(a, b) { return this.toSmall([this.fromSmall(a), this.fromSmall(b)] as const); },
  inl(a) { return this.toSmall({ tag: "inl", value: this.fromSmall(a) }); },
  inr(b) { return this.toSmall({ tag: "inr", value: this.fromSmall(b) }); },
  list<T>(...xs: Small<Brand<"U0">, T>[]) { return this.toSmall(xs.map(this.fromSmall)); },
  func(dom, f) { this.fromSmall(dom).forEach(_=>{}); return this.toSmall(f as any); },
  eqvClass(rep) { return this.toSmall({ rep: this.fromSmall(rep) }); },
};

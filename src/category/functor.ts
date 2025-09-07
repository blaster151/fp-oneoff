import { BaseCategory, SmallCategory, LargeCategory, Mor, Obj } from "./core";

export interface Functor<S extends BaseCategory, T extends BaseCategory> {
  readonly source: S;
  readonly target: T;

  onObj: (a: Obj) => Obj;
  onMor: (f: Mor) => Mor;

  // Laws as runtime checks (optional but handy in tests)
  respectsId?: (a: Obj) => boolean;
  respectsComp?: (g: Mor, f: Mor) => boolean;
}

// Mapping utilities for both Small and Large categories
export function mapHom<S extends BaseCategory, T extends BaseCategory>(
  F: Functor<S, T>,
  a: Obj,
  b: Obj,
  homS: Iterable<Mor>
): Mor[] {
  const out: Mor[] = [];
  for (const f of homS) out.push(F.onMor(f));
  return out;
}

// Compose functors (T∘S)
export function composeF<A extends BaseCategory, B extends BaseCategory, C extends BaseCategory>(
  G: Functor<B, C>,
  F: Functor<A, B>
): Functor<A, C> {
  return {
    source: F.source,
    target: G.target,
    onObj: (a) => G.onObj(F.onObj(a)),
    onMor: (f) => G.onMor(F.onMor(f)),
  };
}
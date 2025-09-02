// catkit-optics.ts
// Minimal profunctor optics core (typed). No 'any' in core types.

// ---------- Opaque profunctor payload ----------
type Brand<T, B extends string> = T & { readonly __brand?: B };

export type PVal<P, A, B> = Brand<unknown, 'PVal'> & {
  readonly __P?: P;
  readonly __A?: (a: A) => A; // phantom
  readonly __B?: (b: B) => B; // phantom
};

// ---------- Dictionaries ----------
export interface ProfDict<P> {
  dimap: <A, B, C, D>(
    p: PVal<P, A, B>,
    l: (c: C) => A,
    r: (b: B) => D
  ) => PVal<P, C, D>;
}

export interface StrongDict<P> extends ProfDict<P> {
  first: <A, B, C>(
    p: PVal<P, A, B>
  ) => PVal<P, [A, C], [B, C]>;
}

// ---------- Concrete interpreters ----------
export type Fn<A, B> = (a: A) => B;

// Helper: local, contained coercions for interpreters
const asFn = <A, B>(p: PVal<'Fn', A, B>): Fn<A, B> =>
  p as unknown as Fn<A, B>;
const toPValFn = <A, B>(f: Fn<A, B>): PVal<'Fn', A, B> =>
  f as unknown as PVal<'Fn', A, B>;

export const StrongFn: StrongDict<'Fn'> = {
  dimap: (p, l, r) => toPValFn((c) => r(asFn(p)(l(c)))),
  first: <A, B, C>(p: PVal<'Fn', A, B>) =>
    toPValFn(([a, c]: [A, C]) => [asFn(p)(a), c] as [B, C]) as PVal<'Fn', [A, C], [B, C]>,
};

export type Forget<R, A, _B = unknown> = (a: A) => R;

const asForget = <R, A, B>(p: PVal<'Forget', A, B>): Forget<R, A, B> =>
  p as unknown as Forget<R, A, B>;
const toPValForget = <R, A, B>(f: Forget<R, A, B>): PVal<'Forget', A, B> =>
  f as unknown as PVal<'Forget', A, B>;

export function StrongForget<R>(): StrongDict<'Forget'> {
  return {
    dimap: <A, B, C, D>(p: PVal<'Forget', A, B>, l: (c: C) => A, _r: (b: B) => D) => 
      toPValForget<R, C, D>((c: C) => asForget<R, A, B>(p)(l(c))),
    first: <A, B, C>(p: PVal<'Forget', A, B>) => 
      toPValForget<R, [A, C], [B, C]>(([a, _c]: [A, C]) => asForget<R, A, B>(p)(a)),
  };
}

// ---------- Lens ----------
export type Lens<S, T, A, B> =
  <P>(dict: StrongDict<P>) =>
    (pab: PVal<P, A, B>) => PVal<P, S, T>;

export function lens<S, T, A, B>(
  get: (s: S) => A,
  set: (s: S, b: B) => T
): Lens<S, T, A, B> {
  return <P>(dict: StrongDict<P>) =>
    (pab: PVal<P, A, B>): PVal<P, S, T> => {
      const pre  = (s: S): [A, S] => [get(s), s];
      const post = ([b, s]: [B, S]): T => set(s, b);
      const fst  = dict.first<A, B, S>(pab);
      return dict.dimap<[A, S], [B, S], S, T>(fst, pre, post);
    };
}

// ---------- Interpreters over lenses ----------
export function view<S, A>(ln: Lens<S, S, A, A>, s: S): A {
  const F = StrongForget<A>();
  const forgetAB = toPValForget<A, A, A>((a) => a);
  const got = ln(F)(forgetAB) as unknown as Forget<A, S, S>;
  return got(s);
}

export function over<S, T, A, B>(ln: Lens<S, T, A, B>, f: (a: A) => B): (s: S) => T {
  const pab = toPValFn<A, B>(f);
  const t = ln(StrongFn)(pab) as unknown as Fn<S, T>;
  return t;
}

export function setL<S, T, A, B>(ln: Lens<S, T, A, B>, b: B): (s: S) => T {
  return over(ln, () => b);
}

// ---------- Laws (still using deep structural eq for now) ----------
import { eqJSON } from './eq';
const deepEq = eqJSON<unknown>();

export type LensLawReport = { getSet: boolean; setGet: boolean; setSet: boolean };

export function checkLensLaws<S, A>(
  ln: Lens<S, S, A, A>,
  sampleS: S,
  a1: A,
  a2: A
): LensLawReport {
  const get = view(ln, sampleS);
  const gs  = deepEq(setL(ln, get)(sampleS), sampleS);

  const sg  = deepEq(
    view(ln, setL(ln, a1)(sampleS)),
    a1
  );

  const ss1 = setL(ln, a2)(setL(ln, a1)(sampleS));
  const ss2 = setL(ln, a2)(sampleS);
  const ss  = deepEq(ss1, ss2);

  return { getSet: gs, setGet: sg, setSet: ss };
}

// ---------- Stock lenses without 'any' ----------
export const fstLens = <A, C, B = A>(): Lens<[A, C], [B, C], A, B> =>
  lens(
    ([a]) => a,
    ([_, c], b) => [b, c]
  );

export function propLens<S, K extends keyof S, B>(key: K): Lens<S, Omit<S, K> & { [P in K]: B }, S[K], B> {
  return lens(
    (s) => s[key],
    (s, b) => ({ ...s, [key]: b } as Omit<S, K> & { [P in K]: B })
  );
}
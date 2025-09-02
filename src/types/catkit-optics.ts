// catkit-optics.ts
// Minimal profunctor optics core for lenses + a tiny laws test kit.
// Focus: Strong profunctor lenses with concrete interpreters (Function, Forget).

// ----------------- Profunctor dictionaries -----------------

export type PVal<_P, _A, _B> = any;

export interface ProfDict<P> {
  dimap: <A, B, C, D>(p: PVal<P, A, B>, l: (c: C) => A, r: (b: B) => D) => PVal<P, C, D>;
}

export interface StrongDict<P> extends ProfDict<P> {
  first: <A, B, C>(p: PVal<P, A, B>) => PVal<P, [A, C], [B, C]>;
}

// Optic representation: Lens s t a b := forall p. Strong p => p a b -> p s t
export type Lens<S, T, A, B> = <P>(dict: StrongDict<P>) => (pab: PVal<P, A, B>) => PVal<P, S, T>;

// ----------------- Concrete profunctors -----------------

// Function profunctor P<A,B> = (a:A) => B
export type Fn<A, B> = (a: A) => B;

export const StrongFn: StrongDict<"Fn"> = {
  dimap: <A, B, C, D>(p: Fn<A, B>, l: (c: C) => A, r: (b: B) => D): Fn<C, D> =>
    (c: C) => r(p(l(c))),
  first: <A, B, C>(p: Fn<A, B>): Fn<[A, C], [B, C]> =>
    ([a, c]: [A, C]) => [p(a), c]
};

// Forget profunctor: P<A,B> = (a:A) => R, ignoring B. Used to "view" through a lens.
export type Forget<R, A, _B = unknown> = (a: A) => R;

export function StrongForget<R>(): StrongDict<"Forget"> {
  return {
    dimap: <A, B, C, D>(p: Forget<R, A, B>, l: (c: C) => A, _r: (b: B) => D): Forget<R, C, D> =>
      (c: C) => p(l(c)),
    first: <A, B, C>(p: Forget<R, A, B>): Forget<R, [A, C], [B, C]> =>
      ([a, _c]: [A, C]) => p(a)
  };
}

// ----------------- Lens constructor & interpreters -----------------

// lens get set:  s -> a, (s, b) -> t
export function lens<S, T, A, B>(
  get: (s: S) => A,
  set: (s: S, b: B) => T
): Lens<S, T, A, B> {
  return <P>(dict: StrongDict<P>) =>
    (pab: PVal<P, A, B>): PVal<P, S, T> => {
      const pre  = (s: S): [A, S] => [get(s), s];
      const post = ([b, s]: [B, S]): T => set(s, b);
      // dimap pre post (first pab)
      const fst  = dict.first<A, B, S>(pab);
      return dict.dimap<[A, S], [B, S], S, T>(fst, pre, post);
    };
}

// Interpretations
export function view<S, A>(ln: Lens<S, S, A, A>, s: S): A {
  const F = StrongForget<A>();
  const forget: Forget<A, A, A> = (a: A) => a;
  const got = ln(F)(forget) as Forget<A, S, S>;
  return got(s);
}
export function over<S, T, A, B>(ln: Lens<S, T, A, B>, f: (a: A) => B): (s: S) => T {
  const t = ln(StrongFn)((a: A) => f(a)) as Fn<S, T>;
  return t;
}
export function setL<S, T, A, B>(ln: Lens<S, T, A, B>, b: B): (s: S) => T {
  return over(ln, () => b);
}

// ----------------- Laws (Get-Set, Set-Get, Set-Set) -----------------

function deepEq(x: any, y: any): boolean {
  return JSON.stringify(x) === JSON.stringify(y);
}

export type LensLawReport = { getSet: boolean; setGet: boolean; setSet: boolean };

export function checkLensLaws<S, T, A, B>(
  ln: Lens<S, T, A, B>,
  sampleS: S,
  b1: B,
  b2: B
): LensLawReport {
  // get-set: set (view s) s = s
  const get = view(ln as unknown as Lens<S, S, A, A>, sampleS as any) as any;
  const gs  = deepEq(setL(ln, get)(sampleS), sampleS);

  // set-get: view (set b s) = b
  const sg  = deepEq(view(ln as unknown as Lens<T, T, B, B>, setL(ln, b1)(sampleS) as any), b1 as any);

  // set-set: set b2 (set b1 s) = set b2 s
  const s1 = setL(ln, b1)(sampleS);
  const ss  = deepEq(setL(ln, b2)(s1 as unknown as S), setL(ln, b2)(sampleS));

  return { getSet: gs, setGet: sg, setSet: ss };
}

// ----------------- Example lenses -----------------

// 1) fst lens on pairs [A, C] focusing on A
export const fstLens: Lens<[any, any], [any, any], any, any> =
  lens<[any, any], [any, any], any, any>(
    ([a, _c]) => a,
    ([_, c], b) => [b, c]
  );

// 2) property lens: focus on field "x" of a record and allow changing its type
export function propLens<K extends string, S extends Record<K, any>, B>(key: K): Lens<S, Omit<S, K> & Record<K, B>, S[K], B> {
  return lens(
    (s: S) => s[key],
    (s: S, b: B) => ({ ...(s as any), [key]: b })
  );
}

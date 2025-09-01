// optics-free.ts
// -------------------------------------------------------------------------------------
// 0) Minimal HKTs & Kind/Kind2/Kind3 (fp-ts-style URI maps)
// -------------------------------------------------------------------------------------
export interface URItoKindFree<A> {
  readonly __phantom?: A;
}
export interface URItoKind2Free<E, A> {
  readonly __phantom?: [E, A];
}
export interface URItoKind3Free<R, E, A> {
  readonly __phantom?: [R, E, A];
}

export type URISFree  = keyof URItoKindFree<any>;
export type URIS2Free = keyof URItoKind2Free<any, any>;
export type URIS3Free = keyof URItoKind3Free<any, any, any>;

export type KindFree  <U extends URISFree,  A>           = URItoKindFree<A>[U];
export type Kind2Free <U extends URIS2Free, E, A>        = URItoKind2Free<E, A>[U];
export type Kind3Free <U extends URIS3Free, R, E, A>     = URItoKind3Free<R, E, A>[U];

// -------------------------------------------------------------------------------------
// 1) Tiny Either + helpers (used by Prism/Choice)
// -------------------------------------------------------------------------------------
export type EitherFree<E, A> =
  | { _tag: 'Left';  left:  E }
  | { _tag: 'Right'; right: A };

export const leftFree  = <E, A>(e: E): EitherFree<E, A> => ({ _tag:'Left',  left: e });
export const rightFree = <E, A>(a: A): EitherFree<E, A> => ({ _tag:'Right', right: a });

// -------------------------------------------------------------------------------------
// 2) Profunctor core: Profunctor / Strong / Choice (arity-2 "HKT" via branding)
// -------------------------------------------------------------------------------------
type Brand<T, B extends string> = T & { readonly __brand: B };

export type P2Free<A, B> = Brand<(a: A) => B, 'P2'>;   // concrete rep for our "HKT2"

export interface ProfunctorFree<P> {
  readonly __phantom?: P;
  dimap: (pab: any, l: any, r: any) => any;
}

export interface StrongFree<P> extends ProfunctorFree<P> {
  first: (pab: any) => any; // (A×C) -> (B×C)
}

export interface ChoiceFree<P> extends ProfunctorFree<P> {
  left: (pab: any) => any;  // (A + C) -> (B + C)
}

// Function profunctor instance (for modify/set)
export const FunctionStrongFree: StrongFree<'Function'> = {
  dimap: (pab: any, l: any, r: any) => (c: any) => r(pab(l(c))),
  first: (pab: any) => ([a, c]: any): any => [pab(a), c]
};

// Forget profunctor (for view/preview); needs only dimap, but we also give Strong/Choice flavors.
export type ForgetFree<R, A, B> = ((a: A) => R) & { _phantom?: B };

export const ForgetProfunctorFree = (): ProfunctorFree<'Forget'> => ({
  dimap: (pab: any, l: any, _r: any) => (c: any) => pab(l(c))
});

export const ForgetStrongFree = (): StrongFree<'Forget'> => ({
  ...ForgetProfunctorFree(),
  first: (pab: any) => ([a, _c]: any) => pab(a)
});

export interface MonoidFree<A> { empty: A; concat: (x: A, y: A) => A }

// Choice needs a Monoid to fold away the "other side"
export const ForgetChoiceFree = <R>(M: MonoidFree<R>): ChoiceFree<'Forget'> => ({
  ...ForgetProfunctorFree(),
  left: (pab: any) => (e: any): R => e._tag === 'Left' ? pab(e.left) : M.empty
});

// -------------------------------------------------------------------------------------
// 3) Profunctor-encoded optics: Iso / Lens / Prism
// -------------------------------------------------------------------------------------
export type PIsoFree<S, T, A, B>   = (P: ProfunctorFree<any>) => (pab: (a: A) => B) => (s: S) => T;
export type PLensFree<S, T, A, B>  = (P: StrongFree<any>) => (pab: (a: A) => B) => (s: S) => T;
export type PPrismFree<S, T, A, B> = (P: ChoiceFree<any>) => (pab: (a: A) => B) => (s: S) => T;

// Smart constructors
export const isoFree = <S, T, A, B>(
  get: (s: S) => A,
  rev: (b: B) => T
): PIsoFree<S, T, A, B> =>
  (P: ProfunctorFree<any>) => (pab: (a: A) => B) =>
    P.dimap(pab, get, rev);

export const lensFree = <S, T, A, B>(
  get: (s: S) => A,
  set: (s: S, b: B) => T
): PLensFree<S, T, A, B> =>
  (P: StrongFree<any>) => (pab: (a: A) => B) =>
    P.dimap(
      P.first(pab),
      (s: S): [A, S] => [get(s), s],
      ([b, s]: [B, S]): T => set(s, b)
    );

export const prismFree = <S, T, A, B>(
  match: (s: S) => EitherFree<A, T>,   // Left: focus A, Right: already T
  build: (b: B) => T
): PPrismFree<S, T, A, B> =>
  (P: ChoiceFree<any>) => (pab: (a: A) => B) =>
    P.dimap(
      P.left(pab),
      match,
      (e: EitherFree<B, T>) => e._tag === 'Left' ? build(e.left) : e.right
    );

// Running optics
export const overFree = <S, T, A, B>(o: PLensFree<S, T, A, B> | PPrismFree<S, T, A, B>, f: (a: A) => B) =>
  (s: S): T => (o as any)(FunctionStrongFree)(f)(s);

export const setFree = <S, T, A>(o: PLensFree<S, T, A, A>, b: A) =>
  overFree(o, () => b);

// "view" via Forget<R=A>
export const viewFree = <S, A>(o: PLensFree<S, S, A, A>) =>
  (s: S): A => (o(ForgetStrongFree())((a: A) => a) as any)(s);

// "preview" via Forget<Option<A>>
export type OptionFree<A> = { _tag: 'None' } | { _tag: 'Some'; value: A };
export const noneFree: OptionFree<never> = { _tag: 'None' };
export const someFree = <A>(value: A): OptionFree<A> => ({ _tag: 'Some', value });

export const MonoidFirstFree = <A>(): MonoidFree<OptionFree<A>> => ({
  empty: noneFree,
  concat: (x, y) => x._tag === 'Some' ? x : y
});

export const previewFree = <S, A>(o: PPrismFree<S, S, A, A>) =>
  (s: S): OptionFree<A> =>
    (o(ForgetChoiceFree<OptionFree<A>>(MonoidFirstFree<A>()))(someFree as any) as any)(s);

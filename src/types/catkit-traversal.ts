// catkit-traversal.ts
// Traversals via profunctor *Wander* using Star<F> for Applicative F.
// Unified helpers: overO / setO / toListOf / previewO / viewO / composeO
// Traversal laws checkers (identity, fusion, naturality via App morphism, linearity)
// Extra traversals: eitherTraversal (Right), optionTraversal (Some)

import { Left, Right, Either, Option, Some, None } from "./catkit-prisms.js"; // reuse Either/Option

// ----------------- Applicative machinery -----------------
export interface Applicative<F, Box> {
  of: <A>(a:A)=> any; // Box<A>
  map: <A,B>(fa: any, f:(a:A)=>B)=> any; // Box<A> -> Box<B>
  ap:  <A,B>(ff: any, fa: any)=> any; // Box<(a:A)=>B> -> Box<A> -> Box<B>
  liftA2?: <A,B,C>(f:(a:A,b:B)=>C, fa:any, fb:any)=> any; // Box<A> -> Box<B> -> Box<C>
}

// Identity applicative
export type Id<A> = { tag:"Id", value:A };
export const IdApp: Applicative<"Id", any> = {
  of: (a)=> ({tag:"Id", value:a}),
  map: (fa, f)=> ({tag:"Id", value: f(fa.value)}),
  ap: (ff, fa)=> ({tag:"Id", value: ff.value(fa.value)}),
  liftA2: (f, fa, fb)=> ({tag:"Id", value: f(fa.value, fb.value)})
};

// Const applicative with a Monoid (for toListOf, counting, etc.)
export interface Monoid<M> { empty: M; concat:(x:M,y:M)=>M; }
export type Const<M,A> = { tag:"Const", value:M };
export function ConstApp<M>(M: Monoid<M>): Applicative<"Const", any> {
  return {
    of: (_: any)=> ({tag:"Const", value: M.empty}),
    map: (fa: any, _f: any)=> fa,
    ap: (ff: any, fa: any)=> ({tag:"Const", value: M.concat(ff.value, fa.value)})
  } as any;
}
export const MonoidArray: Monoid<any[]> = { empty: [], concat:(x,y)=> x.concat(y) };
export const MonoidSum: Monoid<number>   = { empty: 0, concat:(x,y)=> x+y };

// Compose applicatives
export type Compose<A> = { tag:"Compose", value: any }; // value: F (G A)
export function ComposeApp<F, G>(
  F: Applicative<F, any>,
  G: Applicative<G, any>
): Applicative<"Compose", any> {
  return {
    of: <A>(a:A)=> ({tag:"Compose", value: F.of( G.of(a) )}),
    map: <A,B>(c: any, f:(a:A)=>B)=> ({tag:"Compose", value: F.map(c.value, (ga:any)=> G.map(ga, f))}),
    ap:  <A,B>(cf: any, ca: any)=> ({
      tag:"Compose",
      value: F.ap( F.map(cf.value, (gf:any)=> (ga:any)=> G.ap(gf, ga)), ca.value )
    })
  } as any;
}

// Applicative morphism (for naturality checks)
export interface AppMorphism<F1, F2> {
  phi: <A>(fa: any) => any; // Box1<A> -> Box2<A>
  // should satisfy: phi(of a) = of a ; phi(ap(ff,fa)) = ap(phi ff, phi fa)
}

// ----------------- Star profunctor over an Applicative -----------------

export type Star<A, B> = (a:A) => any; // returns Box<B>

export interface WanderDict<P> {
  dimap:  <A,B,C,D>(p: any, l:(c:C)=>A, r:(b:B)=>D)=> any;
  first:  <A,B,C>(p: any)=> any;
  left:   <A,B,C>(p: any)=> any;
  right:  <A,B,C>(p: any)=> any;
  // Core traversal op:
  wander: <A,B,S,T>(
    walk: <F>(F: Applicative<F, any>) => (ab: (a:A)=>any) => (s:S)=> any,
    pab: any
  )=> any;
}

// Build a Wander dict for Star<F> from an Applicative
export function StarDict<F>(F: Applicative<F, any>): WanderDict<"Star"> {
  const dimap = <A,B,C,D>(p: Star<A, B>, l:(c:C)=>A, r:(b:B)=>D): Star<C, D> =>
    (c:C)=> F.map(p(l(c)), r as any);
  const first = <A,B,C>(p: Star<A, B>): Star<[A,C], [B,C]> =>
    ([a,c]:[A,C])=> F.map(p(a), (b:B)=> [b, c] as [B,C]);
  const left  = <A,B,C>(p: Star<A, B>): Star<Either<A,C>, Either<B,C>> =>
    (e: Either<A,C>) => e.tag==="left"
      ? F.map(p(e.left), (b:B)=> Left<B,C>(b))
      : F.of(Right<B,C>(e.right));
  const right = <A,B,C>(p: Star<A, B>): Star<Either<C,A>, Either<C,B>> =>
    (e: Either<C,A>) => e.tag==="right"
      ? F.map(p(e.right), (b:B)=> Right<C,B>(b))
      : F.of(Left<C,B>(e.left));
  const wander = <A,B,S,T>(
    walk: <FF>(FF: Applicative<FF, any>) => (ab: (a:A)=>any) => (s:S)=> any,
    pab: Star<A, B>
  ): Star<S, T> => (s:S)=> walk(F as any)((a:A)=> pab(a))(s);
  return { dimap, first, left, right, wander };
}

// ----------------- Traversal encoding -----------------
// Traversal s t a b  :=  forall p. Wander p => p a b -> p s t
export type Traversal<S,T,A,B> = <P>(dict: WanderDict<P>) => (pab:any)=> any;

// Construct a traversal from a *walker* (Applicative-based)
export function traversal<S,T,A,B>(
  walk: <F>(F: Applicative<F, any>) => (ab: (a:A)=> any) => (s:S)=> any
): Traversal<S,T,A,B> {
  return <P>(dict: WanderDict<P>) => (pab:any) => dict.wander<A,B,S,T>(walk, pab);
}

// Some basic traversals
export const eachArray: Traversal<any[], any[], any, any> =
  traversal<any[], any[], any, any>(<F>(F: Applicative<F, any>) =>
    (ab: (a:any)=> any) => (xs:any[]) => {
      let acc = F.of([] as any[]);
      for (const x of xs) {
        const fx = ab(x); // F b
        // acc: F [b]; fx: F b ; combine to F [b]
        const snoc = (ys:any[]) => (b:any)=> ys.concat([b]);
        const step = F.map(fx, (b:any)=> (ys:any[])=> ys.concat([b]));
        acc = F.ap( F.map(acc, (ys:any[])=> (k:(ys:any[])=>any[])=> k(ys)), step as any);
      }
      return acc;
    }
  );

export function bothPair<A,B,C,D>(): Traversal<[A,B],[C,D],A|B,C|D> {
  return traversal<[A,B],[C,D],any,any>(<F>(F: Applicative<F, any>) =>
    (ab: (a:any)=> any) => ([a,b]:[A,B]) => {
      const fa = ab(a); const fb = ab(b);
      const pair = (x:any)=> (y:any)=> [x,y] as [C,D];
      return F.ap(F.map(fa, pair), fb);
    }
  );
}

// Either traversal (Right branch)
export function eitherTraversal<L,A,B>(): Traversal<Either<L,A>, Either<L,B>, A, B> {
  return traversal(<F>(F: Applicative<F, any>) =>
    (ab:(a:A)=>any)=> (e: Either<L,A>) =>
      e.tag==="right" ? F.map(ab(e.right), (b:B)=> Right<L,B>(b))
                      : F.of(Left<L,B>(e.left))
  );
}

// Option traversal (Some branch)
export function optionTraversal<A,B>(): Traversal<Option<A>, Option<B>, A, B> {
  return traversal(<F>(F: Applicative<F, any>) =>
    (ab:(a:A)=>any)=> (o: Option<A>) =>
      o.tag==="some" ? F.map(ab(o.value), (b:B)=> ({tag:"some", value:b} as Option<B>))
                     : F.of(None as Option<B>)
  );
}

// ----------------- Unified helpers for any optic -----------------

export type AnyOptic<S,T,A,B> = <P>(dict: WanderDict<P>) => (pab:any)=> any;

// compose any two optics (o1 ∘ o2)
export function composeO<S,T,A,B,C,D>(
  o1: AnyOptic<S,T,A,B>,
  o2: AnyOptic<A,B,C,D>
): AnyOptic<S,T,C,D> {
  return <P>(dict: WanderDict<P>) => (pcd:any) => {
    const pab = o2(dict)(pcd);
    return o1(dict)(pab);
  };
}

// overO works for Lens, Prism, Traversal
export function overO<S,T,A,B>(optic: AnyOptic<S,T,A,B>, f:(a:A)=>B): (s:S)=>T {
  const dict = StarDict(IdApp);
  const star = (a:A)=> IdApp.of(f(a));
  const res  = optic(dict)(star) as (s:S)=> Id<A>;
  return (s:S)=> (res(s) as any).value as T;
}

// setO: constant replace
export function setO<S,T,A,B>(optic: AnyOptic<S,T,A,B>, b:B): (s:S)=>T {
  return overO(optic, () => b);
}

// toListOf: collect all foci (lens→1, prism→0/1, traversal→many)
export function toListOf<S,T,A,B>(optic: AnyOptic<S,T,A,B>, s:S): A[] {
  const C = ConstApp<{xs:A[]}>({
    empty: {xs: [] as A[]},
    concat: (x,y)=> ({xs: (x.xs as A[]).concat(y.xs as A[])})
  });
  const dict = StarDict(C as any);
  const star = (a:A)=> ({tag:"Const", value:{xs:[a] as A[]}});
  const res  = optic(dict)(star) as (s:S)=> {tag:"Const", value:{xs:A[]}};
  return (res(s).value.xs);
}

// previewO: Option first focus (if any)
export function previewO<S,T,A,B>(optic: AnyOptic<S,T,A,B>, s:S): Option<A> {
  const xs = toListOf<S,T,A,B>(optic, s);
  return xs.length>0 ? Some(xs[0]!) : None;
}

// viewO: expect exactly one focus (lens-like); throws otherwise
export function viewO<S,A>(optic: AnyOptic<S,S,A,A>, s:S): A {
  const xs = toListOf<S,S,A,A>(optic, s);
  if (xs.length!==1) throw new Error(`viewO: expected exactly 1 focus, got ${xs.length}`);
  return xs[0]!;
}

// Expose low-level "traverse" runner for tests
export function traverseWith<S,T,A,B,F>(
  optic: AnyOptic<S,T,A,B>, F: Applicative<F,any>, ab:(a:A)=> any
): (s:S)=> any {
  const dict = StarDict(F);
  return optic(dict)(ab) as any;
}

// ----------------- Laws checkers -----------------

export function checkTraversalIdentity<S,T,A,B>(optic: AnyOptic<S,T,A,B>, s:S): boolean {
  const id = (x:any)=> x;
  return JSON.stringify(overO(optic as any, id)(s)) === JSON.stringify(s);
}

export function checkTraversalFusion<S,T,A,B>(optic: AnyOptic<S,T,A,B>, s:S, f:(a:A)=>B, g:(b:B)=>any): boolean {
  const lhs = overO(optic as any, g)(overO(optic as any, f)(s));
  const rhs = overO(optic as any, (x:any)=> g(f(x)))(s);
  return JSON.stringify(lhs) === JSON.stringify(rhs);
}

// Naturality via an applicative morphism φ : Const<List> → Const<Sum>
// Instantiate traversal with Const<List<A>> using ab = singleton list, then map through φ to get counts;
// compare to traversing with Const<Sum> and ab' = 1.
export function checkTraversalNaturality_Length<S,T,A,B>(optic: AnyOptic<S,T,A,B>, s:S): boolean {
  // left side: Const<List>
  type LBox = Const<{xs:any[]}, any>;
  const CList = ConstApp<{xs:any[]}>({
    empty: {xs:[]}, concat: (x,y)=> ({xs: x.xs.concat(y.xs)})
  });
  const abList = (_a:any)=> ({tag:"Const", value:{xs:[null]}} as LBox);
  const left  = traverseWith<S,T,A,B, "Const">(optic as any, CList as any, abList)(s) as any;
  const phi   = (cl: LBox) => ({tag:"Const", value: cl.value.xs.length}) as Const<number, any>;
  const leftCount = phi(left).value;

  // right side: Const<Sum>
  const CSum = ConstApp<number>(MonoidSum);
  const abOne = (_a:any)=> ({tag:"Const", value: 1}) as Const<number, any>;
  const rightCount = traverseWith(optic as any, CSum as any, abOne)(s).value as number;

  return leftCount === rightCount;
}

// Linearity (no duplication/deletion): counting applicative
export function checkTraversalLinearity_Count<S,T,A,B>(optic: AnyOptic<S,T,A,B>, s:S): boolean {
  const n = toListOf(optic as any, s).length;
  const CSum = ConstApp<number>(MonoidSum);
  const abOne = (_a:any)=> ({tag:"Const", value: 1}) as Const<number, any>;
  const count = traverseWith(optic as any, CSum as any, abOne)(s).value as number;
  return count === n;
}
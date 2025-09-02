// catkit-prisms.ts
// Profunctor **prisms** with Choice, plus a tiny laws test kit.
// Works side-by-side with catkit-optics.ts (lenses).

// ----------------- Sum/Option helpers -----------------
export type Either<L, R> = { tag: "left";  left: L } | { tag: "right"; right: R };
export const Left  = <L,R>(l:L): Either<L,R> => ({ tag:"left",  left:l });
export const Right = <L,R>(r:R): Either<L,R> => ({ tag:"right", right:r });

export type Option<A> = { tag:"none" } | { tag:"some"; value:A };
export const None  : Option<never> = { tag:"none" };
export const Some  = <A>(a:A): Option<A> => ({ tag:"some", value:a });

const deepEq = (x:any,y:any)=> JSON.stringify(x)===JSON.stringify(y);

// ----------------- Profunctor core -----------------
export type PVal<P, A, B> = any;
export interface ProfDict<P> {
  dimap: <A,B,C,D>(p: PVal<P,A,B>, l:(c:C)=>A, r:(b:B)=>D) => PVal<P,C,D>;
}

export interface ChoiceDict<P> extends ProfDict<P> {
  left : <A,B,C>(p: PVal<P,A,B>) => PVal<P, Either<A,C>, Either<B,C>>;
  right: <A,B,C>(p: PVal<P,A,B>) => PVal<P, Either<C,A>, Either<C,B>>;
}

// Prism encoding: Prism s t a b := forall p. Choice p => p a b -> p s t
export type Prism<S,T,A,B> = <P>(dict: ChoiceDict<P>) => (pab: PVal<P,A,B>) => PVal<P,S,T>;

// ----------------- Concrete profunctors -----------------

// Function profunctor (maps along Either using standard functor maps)
export type Fn<A,B> = (a:A)=>B;
export const ChoiceFn: ChoiceDict<"Fn"> = {
  dimap: <A,B,C,D>(p: Fn<A,B>, l: (c:C)=>A, r: (b:B)=>D): Fn<C,D> =>
    (c:C)=> r(p(l(c))),
  left:  <A,B,C>(p: Fn<A,B>): Fn<Either<A,C>, Either<B,C>> =>
    (e) => e.tag==="left" ? Left(p(e.left)) : e,
  right: <A,B,C>(p: Fn<A,B>): Fn<Either<C,A>, Either<C,B>> =>
    (e) => e.tag==="right" ? Right(p(e.right)) : e
};

// Forget profunctor for preview: Forget<Option<R>, A, _> = A -> Option<R>
export type Forget<R,A,_B=unknown> = (a:A)=>R;
export function ChoiceForget<R>(): ChoiceDict<"Forget"> {
  return {
    dimap: <A,B,C,D>(p: Forget<R,A,B>, l: (c:C)=>A, _r: (b:B)=>D): Forget<R,C,D> =>
      (c:C)=> p(l(c)),
    left:  <A,B,C>(p: Forget<R,A,B>): Forget<R, Either<A,C>, Either<B,C>> =>
      (e)=> e.tag==="left" ? p(e.left) : (undefined as any as R),
    right: <A,B,C>(p: Forget<R,A,B>): Forget<R, Either<C,A>, Either<C,B>> =>
      (e)=> e.tag==="right"? p(e.right) : (undefined as any as R)
  };
}
// Specialize to Option by supplying a default for the non-focused branch
export function ChoiceForgetOption<R>(none: R): ChoiceDict<"Forget"> {
  return {
    dimap: <A,B,C,D>(p: Forget<R,A,B>, l: (c:C)=>A, _r: (b:B)=>D): Forget<R,C,D> =>
      (c:C)=> p(l(c)),
    left:  <A,B,C>(p: Forget<R,A,B>): Forget<R, Either<A,C>, Either<B,C>> =>
      (e)=> e.tag==="left" ? p(e.left) : none,
    right: <A,B,C>(p: Forget<R,A,B>): Forget<R, Either<C,A>, Either<C,B>> =>
      (e)=> e.tag==="right"? p(e.right) : none
  };
}

// Tagged profunctor for review: ignores input, carries output B
export type Tagged<B, A = unknown> = { value: B };
export const ChoiceTagged: ChoiceDict<"Tagged"> = {
  dimap: <A,B,C,D>(p: Tagged<B,A>, _l: (c:C)=>A, r: (b:B)=>D): Tagged<D,C> =>
    ({ value: r(p.value) }),
  left:  <A,B,C>(p: Tagged<B,A>): Tagged<Either<B,C>, Either<A,C>> =>
    ({ value: Left(p.value) }),
  right: <A,B,C>(p: Tagged<B,A>): Tagged<Either<C,B>, Either<C,A>> =>
    ({ value: Right(p.value) })
};

// ----------------- Prism constructor & interpreters -----------------

export function prism<S,T,A,B>(
  build: (b:B)=>T,
  match: (s:S)=> Either<T, A>
): Prism<S,T,A,B> {
  return <P>(dict: ChoiceDict<P>) =>
    (pab: PVal<P,A,B>): PVal<P,S,T> => {
      // right pab : p (Either<T,A>) (Either<T,B>)
      const righted = dict.right<A,B,T>(pab as any);
      // dimap match (either id build)
      const post = (e: Either<T,B>): T => e.tag==="left" ? e.left : build(e.right);
      return dict.dimap(righted, match, post);
    };
}

// preview: S -> Option<A>
export function preview<S,A>(pr: Prism<S,S,A,A>, s:S): Option<A> {
  const P = ChoiceForgetOption<Option<A>>(None);
  const pab: Forget<Option<A>, A, A> = (a:A)=> Some(a);
  const ps: Forget<Option<A>, S, S>  = pr(P)(pab) as any;
  return ps(s);
}

// review: B -> T
export function review<T,B>(pr: Prism<any,T,any,B>, b:B): T {
  const tagged: Tagged<B, any> = { value: b };
  const out: Tagged<T, any> = pr(ChoiceTagged)(tagged) as any;
  return out.value;
}

// over: S -> T by acting on A with (a->b)
export function over<S,T,A,B>(pr: Prism<S,T,A,B>, f:(a:A)=>B): (s:S)=>T {
  const pab: Fn<A,B> = f;
  const ps: Fn<S,T>  = pr(ChoiceFn)(pab) as any;
  return ps;
}

// ----------------- Prism laws test kit -----------------

export type PrismLawReport = {
  buildMatch: boolean;         // match (review b) = Right b
  previewReview: boolean;      // preview (review b) = Some b
  missNoOp: boolean;           // over f leaves non-matching s unchanged
  compFusion: boolean;         // over g ∘ over f = over (g∘f) on a hit
};

export function checkPrismLaws<S,T,A,B>(
  pr: Prism<S,T,A,B>,
  build: (b:B)=>T,
  match: (s:S)=> Either<T,A>,
  sampleHit: S,    // an s that matches (Right _)
  sampleMiss: S,   // an s that fails (Left _)
  a1: B, a2: B
): PrismLawReport {
  // build-match
  const bm = deepEq(match(review(pr, a1)), Right(a1));

  // preview-review
  const prr = deepEq(preview(pr as any, review(pr, a1)), Some(a1 as any));

  // miss-no-op
  const f = (x:any)=> a1;
  const miss = over(pr, f)(sampleMiss);
  const mNoOp = deepEq(miss, sampleMiss);

  // compFusion on a hit
  const g = (x:any)=> a2;
  const lhs = over(pr, g)(over(pr, f)(sampleHit));
  const rhs = over(pr, (x:any)=> g(f(x)))(sampleHit);
  const cf  = deepEq(lhs, rhs);

  return { buildMatch: bm, previewReview: prr, missNoOp: mNoOp, compFusion: cf };
}

// ----------------- Example prisms -----------------

// Focus Right of Either<L, A> → Either<L, B>
export function rightPrism<L,A,B>(): Prism<Either<L,A>, Either<L,B>, A, B> {
  return prism(
    (b:B): Either<L,B> => Right(b),
    (s:Either<L,A>): Either<Either<L,B>, A> =>
      s.tag==="right" ? Right(s.right) : Left(Left(s.left))
  );
}

// Focus Left of Either<L, A> → Either<L', A>
export function leftPrism<L,Lp,A>(): Prism<Either<L,A>, Either<Lp,A>, L, Lp> {
  return prism(
    (l:Lp): Either<Lp,A> => Left(l),
    (s:Either<L,A>): Either<Either<Lp,A>, L> =>
      s.tag==="left" ? Right(s.left) : Left(Right(s.right))
  );
}

// Number-as-string prism: string ↔ number (partial)
export const numberStringPrism: Prism<string,string,number,number> =
  prism(
    (n:number)=> String(n),
    (s:string)=> {
      const n = Number(s);
      return Number.isFinite(n) && String(n)===s ? Right(n) : Left(s);
    }
  );
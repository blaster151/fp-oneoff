/** @math DEF-SUM-PRODUCT @math DEF-OPTION-EITHER */

export type Inl<A> = { _t: "inl"; value: A };
export type Inr<B> = { _t: "inr"; value: B };
export type Sum<A, B> = Inl<A> | Inr<B>;

export const inl = <A>(a: A): Inl<A> => ({ _t: "inl", value: a });
export const inr = <B>(b: B): Inr<B> => ({ _t: "inr", value: b });

export type Pair<A, B> = { fst: A; snd: B };
export const pair = <A, B>(fst: A, snd: B): Pair<A, B> => ({ fst, snd });

export type Unit = { _t: "unit" };
export const unit: Unit = { _t: "unit" };
export type Void = never;

export type Option<A> = Inl<Unit> | Inr<A>; // None | Some
export const None: Option<never> = inl(unit);
export const Some = <A>(a: A): Option<A> => inr(a);

export type Either<E, A> = Inl<E> | Inr<A>;
export const Left = <E>(e: E): Either<E, never> => inl(e);
export const Right = <A>(a: A): Either<never, A> => inr(a);

/**
 * Sum type utilities
 */
export function isInl<A, B>(sum: Sum<A, B>): sum is Inl<A> {
  return sum._t === "inl";
}

export function isInr<A, B>(sum: Sum<A, B>): sum is Inr<B> {
  return sum._t === "inr";
}

/**
 * Option utilities
 */
export function isNone<A>(opt: Option<A>): opt is Inl<Unit> {
  return opt._t === "inl";
}

export function isSome<A>(opt: Option<A>): opt is Inr<A> {
  return opt._t === "inr";
}

export function fromOption<A>(defaultValue: A): (opt: Option<A>) => A {
  return (opt: Option<A>) => isNone(opt) ? defaultValue : opt.value;
}

export function mapOption<A, B>(f: (a: A) => B): (opt: Option<A>) => Option<B> {
  return (opt: Option<A>) => isNone(opt) ? None : Some(f(opt.value));
}

/**
 * Either utilities
 */
export function isLeft<E, A>(either: Either<E, A>): either is Inl<E> {
  return either._t === "inl";
}

export function isRight<E, A>(either: Either<E, A>): either is Inr<A> {
  return either._t === "inr";
}

export function mapEither<E, A, B>(f: (a: A) => B): (either: Either<E, A>) => Either<E, B> {
  return (either: Either<E, A>) => isLeft(either) ? Left(either.value) : Right(f(either.value));
}

/**
 * Demonstrate sum and product types
 */
export function demonstrateSumProductTypes() {
  console.log("🔧 SUM AND PRODUCT TYPES FOR ADTs");
  console.log("=" .repeat(50));
  
  console.log("\\nSum Types:");
  console.log("  • Sum<A,B> = Inl<A> | Inr<B> (tagged union)");
  console.log("  • Option<A> = None | Some<A> (nullable values)");
  console.log("  • Either<E,A> = Left<E> | Right<A> (error handling)");
  
  console.log("\\nProduct Types:");
  console.log("  • Pair<A,B> = {fst: A, snd: B} (cartesian product)");
  console.log("  • Unit = {_t: \"unit\"} (terminal object)");
  console.log("  • Void = never (initial object)");
  
  console.log("\\nType Constructors:");
  console.log("  • inl/inr: Injection into sum types");
  console.log("  • Some/None: Option type constructors");
  console.log("  • Left/Right: Either type constructors");
  console.log("  • pair: Product type constructor");
  
  console.log("\\nUtilities:");
  console.log("  • Type guards: isInl, isInr, isNone, isSome, isLeft, isRight");
  console.log("  • Mapping: mapOption, mapEither for functor structure");
  console.log("  • Extraction: fromOption with default values");
  
  console.log("\\nApplications:");
  console.log("  • Polynomial functors: 1 + A×X for lists");
  console.log("  • Error handling: Either<Error, Result>");
  console.log("  • Nullable values: Option<T> instead of T | null");
  
  console.log("\\n🎯 Foundation for algebraic data type construction!");
}
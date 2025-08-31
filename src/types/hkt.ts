/**
 * Higher-Kinded Types (HKT) plumbing for TypeScript
 * This provides the foundational infrastructure for type classes
 */

// Core HKT interface - represents a type constructor F applied to type A
export interface HKT<URI, A> { 
  readonly _URI: URI; 
  readonly _A: A 
}

// HKT encodings for arities > 1
export interface HKT2<URI, E, A> extends HKT<URI, A> { 
  readonly _E: E 
}

export interface HKT3<URI, R, E, A> extends HKT2<URI, E, A> { 
  readonly _R: R 
}

// URI type for concrete libraries to narrow to string unions
export type URIS = any;

// Function type alias for cleaner signatures
export type Fn<A, B> = (a: A) => B;

// Natural transformation between two functors
export type Nat<F, G> = <A>(fa: HKT<F, A>) => HKT<G, A>;

// Kleisli arrows in the Kleisli category of M
export type Kleisli<M, A, B> = (a: A) => HKT<M, B>;

// CoKleisli arrows
export type CoKleisli<W, A, B> = (wa: HKT<W, A>) => B;

// Minimal HKT plumbing: no 'any'.
export interface URItoKind<A = unknown> {} // extend in modules that define URIs

export type URIS = keyof URItoKind<unknown>;

export type Kind<U extends URIS, A> = URItoKind<A>[U];

// Helpers for future arities:
export interface URItoKind2<E = unknown, A = unknown> {}
export type URIS2 = keyof URItoKind2<unknown, unknown>;
export type Kind2<U extends URIS2, E, A> = URItoKind2<E, A>[U];

export interface URItoKind3<R = unknown, E = unknown, A = unknown> {}
export type URIS3 = keyof URItoKind3<unknown, unknown, unknown>;
export type Kind3<U extends URIS3, R, E, A> = URItoKind3<R, E, A>[U];

// Backward compatibility aliases - fallback to unknown for unregistered URIs
export type HKT<URI, A> = URI extends URIS ? Kind<URI, A> : unknown;
export type HKT2<URI, E, A> = URI extends URIS2 ? Kind2<URI, E, A> : unknown;
export type HKT3<URI, R, E, A> = URI extends URIS3 ? Kind3<URI, R, E, A> : unknown;

// Profunctor-specific HKT2 interface (arity-2 for profunctors)
export interface URItoKindProf<A = unknown, B = unknown> {}
export type URISProf = keyof URItoKindProf<unknown, unknown>;
export type KindProf<U extends URISProf, A, B> = URItoKindProf<A, B>[U];
export type HKT2Prof<URI, A, B> = URI extends URISProf ? KindProf<URI, A, B> : unknown;

// Either type for Choice profunctors and optics
export type Either<L, R> = { _tag: 'Left'; left: L } | { _tag: 'Right'; right: R };

// Function type alias for cleaner signatures
export type Fn<A, B> = (a: A) => B;
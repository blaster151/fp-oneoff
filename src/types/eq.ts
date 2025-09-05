export type Eq<A, B = A> = (x: A, y: B) => boolean;

// Default: structural JSON compare (explicit & overridable)
export const eqJSON = <T>(): Eq<T> =>
  (x, y) => JSON.stringify(x) === JSON.stringify(y);

// Utility: derive eq by projection
export const eqBy = <T, U>(f: (t: T) => U, eqU: Eq<U> = eqJSON<U>()): Eq<T> =>
  (x, y) => eqU(f(x), f(y));
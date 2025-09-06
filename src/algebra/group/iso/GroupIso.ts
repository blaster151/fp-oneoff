// GroupIso.ts
// A *witnessed* isomorphism between two (finite or infinite) groups.
// We keep it minimal: forward, backward, and law-preservation checks the caller promises.

export interface GroupIso<A,B> {
  to:   (a: A) => B;
  from: (b: B) => A;
  // Optional fast checkers (for dev/testing)
  checkLeftInverse?:  (a: A) => boolean;   // from(to(a)) === a
  checkRightInverse?: (b: B) => boolean;   // to(from(b)) === b
}
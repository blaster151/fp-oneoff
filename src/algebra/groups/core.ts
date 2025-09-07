// Minimal finite group interface + helpers (value-level equality via eq)
export interface FiniteGroup<T> {
  elements: T[];
  id: T;
  op: (a: T, b: T) => T;
  inv: (a: T) => T;
  eq: (a: T, b: T) => boolean;
  show?: (a: T) => string;
}

// Set ops with custom equality
export function uniqByEq<T>(xs: T[], eq: (a: T, b: T) => boolean): T[] {
  const out: T[] = [];
  for (const x of xs) if (!out.some(y => eq(x, y))) out.push(x);
  return out;
}
export function containsByEq<T>(xs: T[], x: T, eq: (a: T, b: T) => boolean): boolean {
  return xs.some(y => eq(x, y));
}
export function unionByEq<T>(xs: T[], ys: T[], eq: (a: T, b: T) => boolean): T[] {
  return uniqByEq(xs.concat(ys), eq);
}

// Quick law checks (used in tests)
export function checkGroupLaws<T>(G: FiniteGroup<T>): { ok: boolean; msg?: string } {
  const { elements: E, id, op, inv, eq } = G;
  // closure + associativity
  for (const a of E) for (const b of E) {
    const ab = op(a, b);
    if (!containsByEq(E, ab, eq)) return { ok: false, msg: "not closed" };
    for (const c of E) {
      const left = op(op(a, b), c);
      const right = op(a, op(b, c));
      if (!eq(left, right)) return { ok: false, msg: "not associative" };
    }
  }
  // identities + inverses
  for (const a of E) {
    if (!eq(op(id, a), a) || !eq(op(a, id), a)) return { ok: false, msg: "bad identity" };
    const ai = inv(a);
    if (!eq(op(a, ai), id) || !eq(op(ai, a), id)) return { ok: false, msg: "bad inverse" };
  }
  return { ok: true };
}
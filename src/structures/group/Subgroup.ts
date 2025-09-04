import { FiniteGroup } from "./Group";

/** Predicate-driven subgroup builder (finite). Throws if not a subgroup. */
export function subgroupFromPredicate<A>(
  G: FiniteGroup<A>,
  pred: (a: A) => boolean
): FiniteGroup<A> {
  // collect carrier
  const elems = G.elems.filter(pred);

  // id must be inside
  if (!pred(G.id)) throw new Error("subgroup: identity not in predicate set");

  // closure checks
  for (const x of elems) {
    // inverse closed
    if (!pred(G.inv(x))) throw new Error("subgroup: not closed under inverse");
    for (const y of elems) {
      if (!pred(G.op(x, y))) throw new Error("subgroup: not closed under op");
    }
  }

  // restrict operations; eq inherited
  const S: FiniteGroup<A> = {
    elems,
    eq: G.eq,
    op: (a, b) => G.op(a, b),
    id: G.id,
    inv: (a) => G.inv(a)
  };
  return S;
}

/** Quick check: S is literally a subgroup of G (same operations, subset carrier). */
export function isSubgroup<A>(G: FiniteGroup<A>, S: FiniteGroup<A>): boolean {
  // carrier subset
  for (const s of S.elems) {
    if (!G.elems.some(g => G.eq(g, s))) return false;
  }
  // ops/identity/inverse agree pointwise on S
  if (!G.eq(S.id, G.id)) return false;
  for (const x of S.elems) {
    if (!G.eq(S.inv(x), G.inv(x))) return false;
    for (const y of S.elems) {
      if (!G.eq(S.op(x, y), G.op(x, y))) return false;
    }
  }
  return true;
}
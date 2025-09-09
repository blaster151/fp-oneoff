import { Group, Subgroup } from "./structures";

function eqDefault<T>(a:T,b:T){ return Object.is(a,b); }

export function makeSubgroup<A>(G: Group<A>, elems: A[], name?: string): Subgroup<A> {
  // No heavy proof: assume caller gives a subgroup (we only use it for well-known examples).
  // Deduplicate using equality.
  const eq = G.eq ?? eqDefault;
  const uniq: A[] = [];
  for (const x of elems) if (!uniq.some(y => eq(x,y))) uniq.push(x);
  const result: Subgroup<A> = { elems: uniq, op: G.op, id: (G as any).e ?? (G as any).id, inv: G.inv, eq: G.eq ?? eqDefault };
  if (name) (result as any).label = name;
  return result;
}

export function intersectionSubgroup<A>(G: Group<A>, H: Subgroup<A>, K: Subgroup<A>, name?: string): Subgroup<A> {
  const eq = G.eq ?? eqDefault;
  const elems = H.elems.filter(h => K.elems.some(k => eq(h,k)));
  return makeSubgroup(G, elems, name ?? `${(H as any).label ?? "H"}∩${(K as any).label ?? "K"}`);
}

/** Product set A⋅N = { a * n | a∈A, n∈N }. (If N ⫳ G, A⋅N is a subgroup.) */
export function productSet<A>(G: Group<A>, A1: Subgroup<A>, N: Subgroup<A>): A[] {
  const xs: A[] = [];
  for (const a of A1.elems) for (const n of N.elems) xs.push(G.op(a,n));
  // dedupe
  const eq = G.eq ?? eqDefault;
  const out: A[] = [];
  for (const x of xs) if (!out.some(y => eq(x,y))) out.push(x);
  return out;
}
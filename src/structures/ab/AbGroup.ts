import { FiniteGroup } from "../group/Group";
import { GroupHom, hom } from "../group/GrpCat";

export type FiniteAbGroup<A> = FiniteGroup<A>; // same carrier; we additionally *check* commutativity

export function checkAbelian<A>(G: FiniteGroup<A>): { ok: boolean; msg?: string } {
  for (const a of G.elems) for (const b of G.elems) {
    if (!G.eq(G.op(a,b), G.op(b,a))) return { ok:false, msg:"not commutative" };
  }
  return { ok:true };
}

/** Assert/brand a FiniteGroup as abelian (throws if not). */
export function asAbelian<A>(G: FiniteGroup<A>): FiniteAbGroup<A> {
  const c = checkAbelian(G);
  if (!c.ok) throw new Error(c.msg);
  return G as FiniteAbGroup<A>;
}

/** The trivial abelian group on a given witness value. */
export function Trivial<A>(witness: A): FiniteAbGroup<A> {
  const eq = (_:A,__:A)=>true;
  const op = (_:A,__:A)=>witness;
  const id = witness;
  const inv = (_:A)=>witness;
  const G: FiniteGroup<A> = { elems:[witness], eq, op, id, inv };
  return G;
}

/** Pointwise addition of homs when codomain is abelian: (f+g)(x)=f(x)⊕g(x) */
export function homAdd<A,B>(f: GroupHom<A,B>, g: GroupHom<A,B>, H: FiniteAbGroup<B>): GroupHom<A,B> {
  if (f.source !== g.source || f.target !== g.target) throw new Error("homAdd: mismatch");
  return hom(f.source, H, (a:A) => H.op(f.f(a), g.f(a)), undefined, () => true);
}

/** Zero hom: x ↦ 0_H */
export function zeroHom<A,B>(G: FiniteGroup<A>, H: FiniteAbGroup<B>): GroupHom<A,B> {
  return hom(G, H, (_:A)=> H.id, undefined, () => true);
}

/** Additive inverse: (−f)(x) = −(f(x)) */
export function homNeg<A,B>(f: GroupHom<A,B>, H: FiniteAbGroup<B>): GroupHom<A,B> {
  return hom(f.source, H, (a:A)=> H.inv(f.f(a)), undefined, () => true);
}
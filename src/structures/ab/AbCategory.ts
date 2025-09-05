import { FiniteAbGroup, Trivial } from "./AbGroup";
import { GroupHom } from "../group/GrpCat";
import { FiniteGroup } from "../group/Group";
import { PairingScheme, tupleScheme } from "../group/pairing/PairingScheme";
import { productGroup } from "../group/builders/Product";
import { kernel, image } from "../group/builders/Quotient";

/** Category data for Ab (objects: FiniteAbGroup<A>, morphisms: GroupHom<A,B>) */

export function id<A>(G: FiniteAbGroup<A>): GroupHom<A,A> {
  return { source: G, target: G, f: (a:A)=>a };
}

export function compose<A,B,C>(f: GroupHom<A,B>, g: GroupHom<B,C>): GroupHom<A,C> {
  if (f.target !== g.source) throw new Error("compose: type mismatch");
  return { source: f.source, target: g.target, f: (a:A)=> g.f(f.f(a)) };
}

/** Zero object and zero morphisms */
export function zeroObject(): FiniteAbGroup<0> { return Trivial(0 as 0); }
export function zero<A,B>(G: FiniteAbGroup<A>, H: FiniteAbGroup<B>): GroupHom<A,B> {
  return { source:G, target:H, f: (_:A)=> H.id };
}

/** biproduct: reuse productGroup as the underlying carrier (direct sum for finite Ab) */
export function biproduct<A,B>(
  G: FiniteAbGroup<A>,
  H: FiniteAbGroup<B>
): {
  GH: FiniteAbGroup<{a:A,b:B}>,
  i1: GroupHom<A,{a:A,b:B}>, i2: GroupHom<B,{a:A,b:B}>,
  p1: GroupHom<{a:A,b:B},A>, p2: GroupHom<{a:A,b:B},B>
} {
  const S = tupleScheme<A,B>();
  const GH = productGroup(G as unknown as FiniteGroup<A>, H as unknown as FiniteGroup<B>, S) as FiniteAbGroup<{a:A,b:B}>;
  const i1: GroupHom<A,{a:A,b:B}> = { source:G, target:GH, f:(a:A)=> S.pair(a, H.id) };
  const i2: GroupHom<B,{a:A,b:B}> = { source:H, target:GH, f:(b:B)=> S.pair(G.id, b) };
  const p1: GroupHom<{a:A,b:B},A> = { source:GH, target:G, f:(o:{a:A,b:B})=> S.left(o) };
  const p2: GroupHom<{a:A,b:B},B> = { source:GH, target:H, f:(o:{a:A,b:B})=> S.right(o) };
  return { GH, i1, i2, p1, p2 };
}

/** Universal property builders */

// Product U.P.: for p:X→G and q:X→H, ⟨p,q⟩: X→G⊕H with p1∘⟨p,q⟩=p, p2∘⟨p,q⟩=q
export function productLift<X,A,B>(
  X: FiniteAbGroup<X>,
  G: FiniteAbGroup<A>,
  H: FiniteAbGroup<B>,
  p: GroupHom<X,A>,
  q: GroupHom<X,B>
): { GH: FiniteAbGroup<{a:A,b:B}>, pair: GroupHom<X,{a:A,b:B}> } {
  const { GH, p1, p2 } = biproduct(G,H);
  const S = tupleScheme<A,B>();
  const pair: GroupHom<X,{a:A,b:B}> = { source:X, target:GH, f: (x:X)=> S.pair(p.f(x), q.f(x)) };
  return { GH, pair };
}

// Coproduct U.P.: for f:G→Y and g:H→Y, [f,g]: G⊕H→Y with [f,g]∘i1=f, [f,g]∘i2=g
export function coproductLift<A,B,Y>(
  G: FiniteAbGroup<A>,
  H: FiniteAbGroup<B>,
  Y: FiniteAbGroup<Y>,
  f: GroupHom<A,Y>,
  g: GroupHom<B,Y>
): { GH: FiniteAbGroup<{a:A,b:B}>, copair: GroupHom<{a:A,b:B},Y> } {
  const { GH, i1, i2 } = biproduct(G,H);
  const S = tupleScheme<A,B>();
  const copair: GroupHom<{a:A,b:B},Y> = {
    source: GH, target: Y,
    f: (o:{a:A,b:B})=> Y.op(f.f(S.left(o)), g.f(S.right(o)))
  };
  return { GH, copair };
}

/** Exactness checker for short sequences X --f--> Y --g--> Z:
 * exact at Y iff im(f) = ker(g).
 */
export function exactAtMiddle<X,Y,Z>(f: GroupHom<X,Y>, g: GroupHom<Y,Z>): boolean {
  const Im = image(f);
  const Ker = kernel(g);
  // Compare as sets by target.eq
  const eqY = f.target.eq;
  const isin = (a:Y, S: Y[]) => S.some(b=>eqY(a,b));
  for (const y of Im.elems) if (!isin(y, Ker.elems)) return false;
  for (const y of Ker.elems) if (!isin(y, Im.elems)) return false;
  return true;
}
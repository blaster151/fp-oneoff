import { Group, GroupHom, Subgroup } from "./structures";

function eqDefault<T>(a:T,b:T){ return Object.is(a,b); }

export interface GroupHomWitnesses<A,B> {
  preservesOp: boolean;
  preservesId: boolean;
  preservesInv: boolean;
  imageSubgroup?: Subgroup<B>;
  kernelSubgroup?: Subgroup<A>;
}

export function analyzeGroupHom<A,B>(f: GroupHom<A,B>): GroupHom<A,B> {
  const G = f.source, H = f.target;
  const eqH = H.eq ?? eqDefault;
  const eqG = G.eq ?? eqDefault;

  const preservesId = eqH(f.f((G as any).e ?? (G as any).id), (H as any).e ?? (H as any).id);
  const preservesInv = G.elems.every(g => eqH(f.f(G.inv(g)), H.inv(f.f(g))));
  const preservesOp = G.elems.every(g1 => G.elems.every(g2 =>
    eqH(f.f(G.op(g1,g2)), H.op(f.f(g1), f.f(g2)))
  ));

  const imageElems: B[] = [];
  for (const g of G.elems) {
    const h = f.f(g);
    if (!imageElems.some(x => eqH(x,h))) imageElems.push(h);
  }
  const imageSubgroup: Subgroup<B> = {
    name: f.name ? `im(${f.name})` : "im(f)",
    elems: imageElems,
    op: H.op, id: (H as any).e ?? (H as any).id, inv: H.inv, eq: H.eq,
  };

  const kernelElems: A[] = [];
  for (const g of G.elems) {
    if (eqH(f.f(g), (H as any).e ?? (H as any).id)) kernelElems.push(g);
  }
  const kernelSubgroup: Subgroup<A> = {
    name: f.name ? `ker(${f.name})` : "ker(f)",
    elems: kernelElems,
    op: G.op, id: (G as any).e ?? (G as any).id, inv: G.inv, eq: G.eq,
  };

  (f as any).witnesses = { preservesId, preservesInv, preservesOp, imageSubgroup, kernelSubgroup } as GroupHomWitnesses<A,B>;
  return f;
}
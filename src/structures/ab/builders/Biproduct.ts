import { FiniteAbGroup } from "../AbGroup";
import { PairingScheme } from "../../group/pairing/PairingScheme";
import { productGroup } from "../../group/builders/Product";
import { GroupHom, hom } from "../../group/GrpCat";

/** Biproduct data (G ⊕ H, i1,i2,p1,p2) with standard identities. */
export function biproduct<A,B,O>(
  G: FiniteAbGroup<A>, H: FiniteAbGroup<B>, S: PairingScheme<A,B,O>
): {
  GH: FiniteAbGroup<O>,
  i1: GroupHom<A,O>, i2: GroupHom<B,O>,
  p1: GroupHom<O,A>, p2: GroupHom<O,B>
} {
  const GH = productGroup(G, H, S) as FiniteAbGroup<O>;
  const i1: GroupHom<A,O> = hom(G, GH, (a:A)=> S.pair(a, H.id), () => true);
  const i2: GroupHom<B,O> = hom(H, GH, (b:B)=> S.pair(G.id, b), () => true);
  const p1: GroupHom<O,A> = hom(GH, G, (o:O)=> S.left(o), () => true);
  const p2: GroupHom<O,B> = hom(GH, H, (o:O)=> S.right(o), () => true);
  return { GH, i1, i2, p1, p2 };
}
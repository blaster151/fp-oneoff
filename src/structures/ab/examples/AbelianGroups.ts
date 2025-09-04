import { Zn } from "../../group/util/FiniteGroups";
import { asAbelian, FiniteAbGroup } from "../AbGroup";
import { FiniteGroup } from "../../group/Group";
import { PairingScheme, tupleScheme } from "../../group/pairing/PairingScheme";
import { productGroup } from "../../group/builders/Product";

/** Z_n under addition is abelian. */
export const Z2 = asAbelian(Zn(2));
export const Z3 = asAbelian(Zn(3));
export const Z4 = asAbelian(Zn(4));
export const Z5 = asAbelian(Zn(5));

/** Direct sum ⊕ = product for finite abelian groups (componentwise). */
export function directSum<A,B,O>(
  G: FiniteAbGroup<A>,
  H: FiniteAbGroup<B>,
  S: PairingScheme<A,B,O> = tupleScheme<A,B>()
): FiniteAbGroup<O> {
  const P = productGroup(G as unknown as FiniteGroup<A>, H as unknown as FiniteGroup<B>, S);
  // product of abelian groups is abelian
  return P as FiniteAbGroup<O>;
}
import { FinGroup, FinGroupMor } from "./FinGrp";

export function isInjective<A,B>(G: FinGroup<A>, f: FinGroupMor<A,B>): boolean {
  for (let i=0; i<G.carrier.length; i++) {
    for (let j=i+1; j<G.carrier.length; j++) {
      if (f.run(G.carrier[i]!) === f.run(G.carrier[j]!)) return false;
    }
  }
  return true;
}

export function isSurjective<A,B>(G: FinGroup<A>, H: FinGroup<B>, f: FinGroupMor<A,B>): boolean {
  return H.carrier.every(b => G.carrier.some(a => f.run(a) === b));
}

export function isIso<A,B>(G: FinGroup<A>, H: FinGroup<B>, f: FinGroupMor<A,B>): boolean {
  return isInjective(G,f) && isSurjective(G,H,f);
}

export const isMono = isInjective;
export const isEpi  = isSurjective;
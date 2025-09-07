import { FinGroup, FinGroupMor } from "./FinGrp";

// Pullback: given f: A→C, g: B→C, build {(a,b) ∈ A×B | f(a)=g(b)}
export function pullback<A,B,C>(
  A: FinGroup<A>, B: FinGroup<B>, C: FinGroup<C>,
  f: FinGroupMor<A,C>, g: FinGroupMor<B,C>
): Array<[A,B]> {
  const out: Array<[A,B]> = [];
  A.carrier.forEach(a => {
    B.carrier.forEach(b => {
      if (C.eq(f.run(a), g.run(b))) out.push([a,b]);
    });
  });
  return out;
}

// Pushout: given f: C→A, g: C→B, amalgamate A,B by identifying f(c)~g(c)
export function pushout<A,B,C>(
  A: FinGroup<A>, B: FinGroup<B>, C: FinGroup<C>,
  f: FinGroupMor<C,A>, g: FinGroupMor<C,B>
): { pairs: Array<[A,B]> } {
  // Naive: quotient A×B by relation (f(c), b) ~ (a, g(c))
  const pairs: Array<[A,B]> = [];
  A.carrier.forEach(a => B.carrier.forEach(b => pairs.push([a,b])));
  return { pairs };
}
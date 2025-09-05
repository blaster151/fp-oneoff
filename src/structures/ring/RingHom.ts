import type { FiniteRing } from "./Ring";

export type RingHom<A,B> = {
  source: FiniteRing<A>;
  target: FiniteRing<B>;
  f: (a:A)=>B;
};

/** Check unit-preserving ring homomorphism: preserves +, *, 0, 1 on finite carriers. */
export function isRingHom<A,B>(h: RingHom<A,B>): boolean {
  const { source: R, target: S, f } = h;
  // preserve 0,1
  if (!S.eq(f(R.zero), S.zero)) return false;
  if (!S.eq(f(R.one),  S.one))  return false;
  // preserve + and *
  for (const a of R.elems) for (const b of R.elems) {
    if (!S.eq(f(R.add(a,b)), S.add(f(a), f(b)))) return false;
    if (!S.eq(f(R.mul(a,b)), S.mul(f(a), f(b)))) return false;
  }
  return true;
}

export function compose<A,B,C>(f: RingHom<A,B>, g: RingHom<B,C>): RingHom<A,C> {
  if (f.target !== g.source) throw new Error("RingHom.compose: type mismatch");
  return { source: f.source, target: g.target, f: (a:A)=> g.f(f.f(a)) };
}

export function id<A>(R: FiniteRing<A>): RingHom<A,A> {
  return { source:R, target:R, f: (a:A)=>a };
}
import { FiniteSemigroup, checkSemigroup } from "./Semigroup";

export type FiniteMonoid<A> = FiniteSemigroup<A> & {
  e: A; // identity
};

export function checkMonoid<A>(M: FiniteMonoid<A>): { ok: boolean; msg?: string } {
  const sg = checkSemigroup(M);
  if (!sg.ok) return sg;
  for (const a of M.elems) {
    if (!M.eq(M.op(M.e, a), a) || !M.eq(M.op(a, M.e), a)) {
      return { ok:false, msg:"identity fails" };
    }
  }
  return { ok:true };
}

export type MonoidHom<A,B> = {
  source: FiniteMonoid<A>;
  target: FiniteMonoid<B>;
  f: (a:A)=>B;
};

export function isMonoidHom<A,B>(h: MonoidHom<A,B>): boolean {
  const { source:S, target:T, f } = h;
  if (!T.eq(f(S.e), T.e)) return false;
  for (const a of S.elems) for (const b of S.elems) {
    if (!T.eq(f(S.op(a,b)), T.op(f(a), f(b)))) return false;
  }
  return true;
}
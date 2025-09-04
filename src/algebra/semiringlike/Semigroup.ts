export type FiniteSemigroup<A> = {
  elems: A[];
  eq: (a:A,b:A)=>boolean;
  op: (a:A,b:A)=>A; // associative
};

export function checkSemigroup<A>(S: FiniteSemigroup<A>): { ok: boolean; msg?: string } {
  for (const a of S.elems) for (const b of S.elems) for (const c of S.elems) {
    const ab_c = S.op(S.op(a,b), c);
    const a_bc = S.op(a, S.op(b,c));
    if (!S.eq(ab_c, a_bc)) return { ok:false, msg:"associativity fails" };
  }
  return { ok:true };
}
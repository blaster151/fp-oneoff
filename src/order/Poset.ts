export type Eq<A> = (x:A,y:A)=>boolean;

export type Poset<A> = {
  elems: A[];             // finite carrier (we stay finite for executability)
  leq: (x:A,y:A)=>boolean;// ≤
  eq: Eq<A>;              // equality (usually derived from ≤ both ways)
  show?: (a:A)=>string;
};

export function posetEqFromLeq<A>(P: Poset<A>): Eq<A> {
  return (x,y) => P.leq(x,y) && P.leq(y,x);
}

export function isPoset<A>(P: Poset<A>): {ok:boolean; msg?:string} {
  const E = P.elems, leq = P.leq;
  // reflexive
  for (const a of E) if (!leq(a,a)) return {ok:false,msg:"not reflexive"};
  // antisymmetric
  for (const a of E) for (const b of E)
    if (leq(a,b) && leq(b,a) && a!==b && !P.eq(a,b)) return {ok:false,msg:"not antisymmetric"};
  // transitive
  for (const a of E) for (const b of E) for (const c of E)
    if (leq(a,b) && leq(b,c) && !leq(a,c)) return {ok:false,msg:"not transitive"};
  return {ok:true};
}

export type Monotone<A,B> = {
  source: Poset<A>;
  target: Poset<B>;
  f: (a:A)=>B;
};

export function isMonotone<A,B>(m: Monotone<A,B>): boolean {
  const { source: X, target: Y, f } = m;
  for (const a of X.elems) for (const b of X.elems)
    if (X.leq(a,b) && !Y.leq(f(a), f(b))) return false;
  return true;
}

export function compose<A,B,C>(g: Monotone<B,C>, f: Monotone<A,B>): Monotone<A,C> {
  if (f.target !== g.source) throw new Error("compose: mismatched posets");
  return { source: f.source, target: g.target, f: (a:A)=> g.f(f.f(a)) };
}

/** Product poset X×Y with (a,b) ≤ (a',b') iff a≤a' and b≤b'. */
export function productPoset<A,B>(X: Poset<A>, Y: Poset<B>): Poset<{a:A,b:B}> {
  const elems = X.elems.flatMap(a => Y.elems.map(b => ({a,b})));
  const leq = (p:{a:A,b:B}, q:{a:A,b:B}) => X.leq(p.a,q.a) && Y.leq(p.b,q.b);
  const eq  = (p:{a:A,b:B}, q:{a:A,b:B}) => X.eq(p.a,q.a) && Y.eq(p.b,q.b);
  return { elems, leq, eq };
}
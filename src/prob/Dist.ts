/** Finite (normalized) probability distributions over a finite support.
 * Numbers are JS floats; we use a small epsilon for normalization checks.
 */
export type Prob = number;
const EPS = 1e-9;

export type Dist<A> = Array<{ x: A; p: Prob }>;

export function normalize<A>(xs: Dist<A>): Dist<A> {
  const m = new Map<any, Prob>();
  for (const {x,p} of xs) m.set(x, (m.get(x) ?? 0) + p);
  const s = Array.from(m.entries()).reduce((acc,[,p])=>acc+p,0);
  if (Math.abs(s) < EPS) return [];
  return Array.from(m.entries()).map(([x,p])=>({x, p: p/s}));
}

export function support<A>(d: Dist<A>): A[] { return d.map(e=>e.x); }

export function eqDist<A>(eqA:(a:A,b:A)=>boolean, d1:Dist<A>, d2:Dist<A>): boolean {
  const n1 = normalize(d1), n2 = normalize(d2);
  if (n1.length !== n2.length) return false;
  return n1.every(({x,p})=>{
    const q = n2.find(e=>eqA(e.x, x))?.p ?? NaN;
    return Math.abs(p - q) < 1e-7;
  });
}

/** Monad: return and bind (a.k.a. eta, mu). */
export const DistMonad = {
  of<A>(x:A): Dist<A> { return [{x, p:1}]; },
  /** bind: Dist<A> -> (A -> Dist<B>) -> Dist<B> */
  chain<A,B>(ma: Dist<A>, f: (a:A)=> Dist<B>): Dist<B> {
    const out: Dist<B> = [];
    for (const {x:a, p} of ma) for (const {x:b, p:pb} of f(a))
      out.push({x:b, p: p*pb});
    return normalize(out);
  },
  /** map via chain+of */
  map<A,B>(ma: Dist<A>, f:(a:A)=>B): Dist<B> {
    return DistMonad.chain(ma, a => DistMonad.of(f(a)));
  },
  /** ap for completeness */
  ap<A,B>(mf: Dist<(a:A)=>B>, ma: Dist<A>): Dist<B> {
    return DistMonad.chain(mf, f => DistMonad.map(ma, f));
  }
};
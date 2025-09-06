import { Poset, posetEqFromLeq } from "./Poset";
import { CompleteLattice, powersetLattice } from "./Lattice";

/** Complete partial order (finite setting).
 * We require: bottom, and every ω-chain has a lub (in finite posets, chains stabilize).
 */
export type CPO<A> = Poset<A> & {
  bot: A;
  lub: (chain: A[]) => A; // chain must be nonempty & ascending; returns least upper bound
};

export function isChain<A>(P: Poset<A>, xs: A[]): boolean {
  for (let i=0;i+1<xs.length;i++) if (!P.leq(xs[i]!, xs[i+1]!)) return false;
  return xs.length > 0;
}

/** Build a finite CPO by supplying a Poset + explicit bottom + lub (computed generically). */
export function cpoFromPoset<A>(P: Poset<A>, bot: A): CPO<A> {
  const leq = P.leq, eq = P.eq ?? posetEqFromLeq(P);
  function lub(chain: A[]): A {
    if (!isChain(P, chain)) throw new Error("lub: not an ascending chain");
    // In finite posets, an ascending chain stabilizes; the last element is the lub of the chain.
    const last = chain[chain.length - 1];
    // sanity: last is an upper bound; minimal among upper bounds (finite scan)
    const uppers = P.elems.filter(u => chain.every(x => leq(x, u)));
    const minimal = uppers.find(u => uppers.every(v => !(!eq(u, v) && leq(v, u))));
    if (minimal === undefined) {
      throw new Error("lub: could not find minimal upper bound");
    }
    return minimal;
  }
  return { ...P, bot, lub };
}

/** Monotone map on a CPO (same shape as Poset.Monotone, repeated for clarity). */
export type Mono<A> = {
  source: CPO<A>;
  target: CPO<A>;
  f: (a:A)=>A;
};

/** Scott-continuity (finite toy): monotone + preserves lub of nonempty directed sets.
 * We approximate by checking all nonempty **chains** (directed) up to a bound.
 */
export function isScottContinuous<A>(M: Mono<A>): boolean {
  const { source: X, target: Y, f } = M;
  // monotone
  for (const a of X.elems) for (const b of X.elems)
    if (X.leq(a,b) && !Y.leq(f(a), f(b))) return false;

  // preserve lubs on nonempty chains (finite sample: all chains up to length 3 for safety)
  const E = X.elems;
  const chains: A[][] = [];
  
  function collectChains(prefix: A[], lastIx: number, maxLen: number): void {
    if (prefix.length) chains.push(prefix.slice());
    if (prefix.length >= maxLen) return;
    for (let i=lastIx;i<E.length;i++) {
      const a = E[i]!;
      if (prefix.length === 0 || X.leq(prefix[prefix.length-1]!, a)) {
        prefix.push(a);
        collectChains(prefix, i, maxLen);
        prefix.pop();
      }
    }
  }
  
  collectChains([], 0, 3); // limit to chains of length <= 3
  
  for (const ch of chains) {
    if (ch.length === 0) continue;
    const lubX = X.lub(ch);
    const image = ch.map(f);
    const lubY = Y.lub(image);
    if (!Y.eq(f(lubX), lubY)) return false;
  }
  return true;
}

/** Kleene iteration: lfpω(f) = lub_{n<ω} f^n(⊥).
 * On finite CPOs with Scott-continuous f, this stabilizes.
 */
export function lfpOmega<A>(X: CPO<A>, f: (a:A)=>A, maxSteps = 10000): A {
  let cur = X.bot;
  for (let i=0;i<maxSteps;i++) {
    const next = f(cur);
    if (X.eq(next, cur)) return cur;
    cur = next;
  }
  throw new Error("lfpOmega: did not converge (check Scott-continuity/monotonicity)");
}

/** Handy CPO: the powerset lattice as a CPO (⊆) with ⊥=∅ and lub=∪ for chains. */
export function powersetCPO<U>(univ: U[], eqU: (x:U,y:U)=>boolean): CPO<U[]> {
  const L = powersetLattice(univ, eqU); // CompleteLattice is a CPO
  const lub = (chain: U[][]) => L.sup(chain);
  return { ...L, lub };
}
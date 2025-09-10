import { FiniteGroup } from "../../structures/group/Group";
import { Eq } from "../core/Eq";

// Minimal shared structures for subgroup/iso/cosets

export interface Group<A> {
  name?: string;
  elems: A[];
  op: (a: A, b: A) => A;
  id: A;
  inv: (a: A) => A;
  eq?: (a: A, b: A) => boolean;
}

export interface GroupHom<A,B> {
  name?: string;
  source: FiniteGroup<A>;
  target: FiniteGroup<B>;
  map: (a: A) => B;
  witnesses?: any; // filled by analyzers
  
  // New: canonical factorization through the kernel-pair quotient
  factorization(eqH?: Eq<B>): {
    quotient: FiniteGroup<{rep:A}>;   // G/≈ where ≈ := (x~y iff f(x)=f(y))
    pi: (g:A)=>{rep:A};               // surjection G→G/≈
    iota: (q:{rep:A})=>B;             // injection G/≈→H landing in im(f)
    // witness laws for tests
    law_compose_equals_f: (g:A)=>boolean;
  };
}

export interface Subgroup<A> extends Group<A> {
  // subset of some ambient group; we keep ambient implicit for now
}

export interface GroupIso<A,B> {
  source: Group<A>;
  target: Group<B>;
  to: GroupHom<A,B>;
  from: GroupHom<B,A>;
  // Optional sanity checks a test can run:
  leftInverse?: boolean;   // from ∘ to = id
  rightInverse?: boolean;  // to ∘ from = id
}
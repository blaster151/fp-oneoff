export interface EnhancedFiniteGroup<G> {
  readonly elems: readonly G[];
  readonly op: (a:G,b:G)=>G;
  readonly e: G;
  readonly inv: (a:G)=>G;
  show?: (a:G)=>string;
}

export interface EnhancedGroupHom<G,H> {
  readonly G: EnhancedFiniteGroup<G>;
  readonly H: EnhancedFiniteGroup<H>;
  readonly map: (g:G)=>H;

  // New: canonical factorization through the kernel-pair quotient
  factorization(): {
    quotient: EnhancedFiniteGroup<{rep:G}>;   // G/≈ where ≈ := (x~y iff f(x)=f(y))
    pi: (g:G)=>{rep:G};               // surjection G→G/≈
    iota: (q:{rep:G})=>H;             // injection G/≈→H landing in im(f)
    // witness laws for tests
    law_compose_equals_f: (g:G)=>boolean;
  };
}
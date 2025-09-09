// Minimal shared structures for subgroup/iso/cosets

export interface Group<A> {
  name?: string;
  elems: A[];
  op: (a: A, b: A) => A;
  e: A;
  inv: (a: A) => A;
  eq?: (a: A, b: A) => boolean;
}

export interface GroupHom<A,B> {
  name?: string;
  source: Group<A>;
  target: Group<B>;
  map: (a: A) => B;
  witnesses?: any; // filled by analyzers
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
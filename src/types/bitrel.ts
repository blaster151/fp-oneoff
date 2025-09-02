// bitrel.ts
// BitSet / BitMatrix and BitRel — a bit-packed version of Rel from rel-equipment.ts.
// Drop-in style API: compose, converse, meet, join, image, etc.
//
// Run demos: ts-node benchmark-rel.ts

import { Finite, Rel } from "./rel-equipment.js";

/************ BitSet ************/
export class BitSet {
  readonly n: number;
  readonly words: Uint32Array;
  
  constructor(n: number, words?: Uint32Array) {
    this.n = n;
    this.words = words ? words : new Uint32Array((n + 31) >>> 5);
  }
  
  static of(n: number): BitSet { return new BitSet(n); }
  clone(): BitSet { return new BitSet(this.n, this.words.slice()); }
  
  private static mask(i: number) { return 1 << (i & 31); }
  
  set(i: number): void { 
    this.words[i >>> 5]! |= BitSet.mask(i); 
  }
  
  clear(i: number): void { 
    this.words[i >>> 5]! &= ~BitSet.mask(i); 
  }
  
  get(i: number): boolean { 
    return (this.words[i >>> 5]! & BitSet.mask(i)) !== 0; 
  }
  
  reset(): void { this.words.fill(0); }
  
  orInPlace(rhs: BitSet): void {
    const w = this.words, v = rhs.words; 
    for (let i = 0; i < w.length; i++) w[i]! |= v[i]!;
  }
  
  andInPlace(rhs: BitSet): void {
    const w = this.words, v = rhs.words; 
    for (let i = 0; i < w.length; i++) w[i]! &= v[i]!;
  }
  
  intersects(rhs: BitSet): boolean {
    const w = this.words, v = rhs.words; 
    for (let i = 0; i < w.length; i++) if ((w[i]! & v[i]!) !== 0) return true;
    return false;
  }
  
  any(): boolean { 
    const w = this.words; 
    for (let i=0;i<w.length;i++) if (w[i]!==0) return true; 
    return false; 
  }
  
  toIndices(): number[] {
    const out: number[] = [];
    for (let i = 0; i < this.n; i++) if (this.get(i)) out.push(i);
    return out;
  }
  
  static fromIndices(n: number, idxs: Iterable<number>): BitSet {
    const bs = new BitSet(n);
    for (const i of idxs) bs.set(i);
    return bs;
  }
}

/************ BitMatrix ************/
export class BitMatrix {
  readonly rows: number;
  readonly cols: number;
  readonly data: Uint32Array[]; // rows x ceil(cols/32)
  
  constructor(rows: number, cols: number, data?: Uint32Array[]) {
    this.rows = rows; 
    this.cols = cols;
    const W = (cols + 31) >>> 5;
    this.data = data ?? Array.from({ length: rows }, () => new Uint32Array(W));
  }
  
  clone(): BitMatrix {
    return new BitMatrix(this.rows, this.cols, this.data.map(r => r.slice()));
  }
  
  set(i: number, j: number): void { 
    this.data[i]![j >>> 5]! |= (1 << (j & 31)); 
  }
  
  get(i: number, j: number): boolean { 
    return (this.data[i]![j >>> 5]! & (1 << (j & 31))) !== 0; 
  }
  
  row(i: number): BitSet { 
    return new BitSet(this.cols, this.data[i]!.slice()); 
  }
  
  setRow(i: number, bs: BitSet): void { 
    this.data[i]!.set(bs.words); 
  }
  
  transpose(): BitMatrix {
    // Simple O(n*m) transpose via setting bits
    const T = new BitMatrix(this.cols, this.rows);
    for (let i=0;i<this.rows;i++) {
      for (let w=0; w<this.data[i]!.length; w++) {
        let word = this.data[i]![w]!;
        if (word===0) continue;
        for (let b=0;b<32;b++){
          if (word & (1<<b)){
            const j = (w<<5) + b;
            if (j < this.cols) T.set(j, i);
          }
        }
      }
    }
    return T;
  }
  
  meet(rhs: BitMatrix): BitMatrix {
    if (this.rows!==rhs.rows || this.cols!==rhs.cols) throw new Error("meet: shape mismatch");
    const out = new BitMatrix(this.rows, this.cols);
    for (let i=0;i<this.rows;i++){
      const a = this.data[i]!, b = rhs.data[i]!, o = out.data[i]!;
      for (let w=0; w<a.length; w++) o[w] = a[w]! & b[w]!;
    }
    return out;
  }
  
  join(rhs: BitMatrix): BitMatrix {
    if (this.rows!==rhs.rows || this.cols!==rhs.cols) throw new Error("join: shape mismatch");
    const out = new BitMatrix(this.rows, this.cols);
    for (let i=0;i<this.rows;i++){
      const a = this.data[i]!, b = rhs.data[i]!, o = out.data[i]!;
      for (let w=0; w<a.length; w++) o[w] = a[w]! | b[w]!;
    }
    return out;
  }
  
  leq(rhs: BitMatrix): boolean {
    if (this.rows!==rhs.rows || this.cols!==rhs.cols) throw new Error("leq: shape mismatch");
    for (let i=0;i<this.rows;i++){
      const a = this.data[i]!, b = rhs.data[i]!;
      for (let w=0; w<a.length; w++) if ((a[w]! & ~b[w]!)!==0) return false;
    }
    return true;
  }
  
  // Boolean matrix multiply using precomputed column bitsets of B (i.e., B^T rows)
  compose(rhs: BitMatrix): BitMatrix {
    if (this.cols !== rhs.rows) throw new Error("compose: inner dim mismatch");
    const BT = rhs.transpose(); // has rows = rhs.cols, cols = rhs.rows
    const out = new BitMatrix(this.rows, rhs.cols);
    const W = Math.min(this.data[0]?.length || 0, BT.data[0]?.length || 0);
    
    for (let i=0;i<this.rows;i++){
      const rowI = this.data[i]!;
      for (let k=0;k<rhs.cols;k++){
        // rowI (words) AND BT.row(k) (words)
        const rowK = BT.data[k]!;
        let hit = 0;
        for (let w=0; w<W; w++){ 
          hit |= (rowI[w]! & rowK[w]!); 
          if (hit) break; 
        }
        if (hit) out.set(i, k);
      }
    }
    return out;
  }
  
  toPairs(A: Finite<any>, B: Finite<any>): Array<[any,any]> {
    const out: Array<[any,any]> = [];
    for (let i=0;i<this.rows;i++){
      for (let w=0; w<this.data[i]!.length; w++){
        let word = this.data[i]![w]!;
        if (word===0) continue;
        for (let b=0;b<32;b++){
          if (word & (1<<b)){
            const j = (w<<5) + b;
            if (j < this.cols) out.push([A.elems[i], B.elems[j]]);
          }
        }
      }
    }
    return out;
  }
}

/************ BitRel ************/
export class BitRel<A,B> {
  readonly A: Finite<A>;
  readonly B: Finite<B>;
  private M: BitMatrix; // |A| x |B|

  private constructor(A:Finite<A>, B:Finite<B>, M:BitMatrix){
    this.A=A; this.B=B; this.M=M;
  }

  static empty<A,B>(A:Finite<A>, B:Finite<B>): BitRel<A,B> {
    return new BitRel(A,B, new BitMatrix(A.elems.length, B.elems.length));
  }
  
  static fromPairs<A,B>(A:Finite<A>, B:Finite<B>, pairs: Iterable<readonly [A,B]>): BitRel<A,B> {
    const M = new BitMatrix(A.elems.length, B.elems.length);
    for (const [a,b] of pairs){
      const i = A.indexOf(a), j = B.indexOf(b);
      if (i<0 || j<0) throw new Error("pair out of carrier");
      M.set(i,j);
    }
    return new BitRel(A,B,M);
  }
  
  static id<T>(X:Finite<T>): BitRel<T,T> {
    const M = new BitMatrix(X.elems.length, X.elems.length);
    for (let i=0;i<X.elems.length;i++) M.set(i,i);
    return new BitRel(X,X,M);
  }

  has(a:A, b:B): boolean {
    const i=this.A.indexOf(a), j=this.B.indexOf(b);
    return i>=0 && j>=0 ? this.M.get(i,j) : false;
  }
  
  converse(): BitRel<B,A> {
    return new BitRel(this.B, this.A, this.M.transpose());
  }
  
  dagger(): BitRel<B,A> { return this.converse(); }

  leq(that: BitRel<A,B>): boolean {
    if (this.A!==that.A || this.B!==that.B) throw new Error("carrier mismatch");
    return this.M.leq(that.M);
  }
  
  meet(that: BitRel<A,B>): BitRel<A,B> {
    if (this.A!==that.A || this.B!==that.B) throw new Error("carrier mismatch");
    return new BitRel(this.A, this.B, this.M.meet(that.M));
  }
  
  join(that: BitRel<A,B>): BitRel<A,B> {
    if (this.A!==that.A || this.B!==that.B) throw new Error("carrier mismatch");
    return new BitRel(this.A, this.B, this.M.join(that.M));
  }
  
  compose<C>(S: BitRel<B,C>): BitRel<A,C> {
    if (this.B!==S.A) throw new Error("middle carrier mismatch");
    return new BitRel(this.A, S.B, this.M.compose(S.M));
  }

  image(X: Iterable<A>): B[] {
    const bs = BitSet.of(this.A.elems.length);
    for (const a of X){ 
      const i=this.A.indexOf(a); 
      if (i>=0) bs.set(i); 
    }
    const out = BitSet.of(this.B.elems.length);
    for (let i=0;i<this.A.elems.length;i++){
      if (!bs.get(i)) continue;
      const row = new BitSet(this.B.elems.length, this.M.data[i]!);
      out.orInPlace(row);
    }
    return this.B.elems.filter((_,j)=> out.get(j));
  }

  toPairs(): Array<[A,B]> { 
    return this.M.toPairs(this.A, this.B) as any; 
  }

  isFunctional(): boolean {
    for (let i=0;i<this.A.elems.length;i++){
      // check if more than 1 bit set in row
      const row = this.M.data[i]!;
      let seen = 0;
      for (let w=0; w<row.length; w++){
        const count = popcnt32(row[w]!);
        seen += count;
        if (seen > 1) return false;
      }
    }
    return true;
  }
  
  isTotal(): boolean {
    for (let i=0;i<this.A.elems.length;i++){
      const row = this.M.data[i]!;
      let any = false;
      for (let w=0; w<row.length; w++){ 
        if (row[w]!==0){ any=true; break; } 
      }
      if (!any) return false;
    }
    return true;
  }

  // Convert between Rel and BitRel
  static fromRel<A,B>(R: Rel<A,B>): BitRel<A,B> {
    return BitRel.fromPairs(R.A, R.B, R.toPairs());
  }
  
  toRel(): Rel<A,B> {
    return Rel.fromPairs(this.A, this.B, this.toPairs());
  }
}

function popcnt32(x:number): number {
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return (((x + (x >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24;
}

/************ Performance utilities ************/

/** Generate random relation with specified density */
export function randomBitRel<A,B>(A: Finite<A>, B: Finite<B>, density: number = 0.15): BitRel<A,B> {
  const pairs: [A,B][] = [];
  for (const a of A.elems) {
    for (const b of B.elems) {
      if (Math.random() < density) {
        pairs.push([a,b]);
      }
    }
  }
  return BitRel.fromPairs(A, B, pairs);
}

/** Time a function execution */
export function timeExecution<T>(label: string, fn: () => T): { label: string; ms: number; result: T } {
  const t0 = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
  const result = fn();
  const t1 = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
  return { label, ms: t1 - t0, result };
}

/************ Conversion utilities ************/

/** Convert BitRel operations to work with existing Rel-based code */
export function adaptBitRelToRel<A,B>(br: BitRel<A,B>): Rel<A,B> {
  return br.toRel();
}

/** Convert Rel operations to use BitRel for performance */
export function adaptRelToBitRel<A,B>(r: Rel<A,B>): BitRel<A,B> {
  return BitRel.fromRel(r);
}
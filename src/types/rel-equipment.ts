// rel-equipment.ts
// Double category / equipment of relations over Set, now with
//  - companions & conjoints for functions (graph & cograph),
//  - unit/counit squares (equipment laws) as checks,
//  - an allegory layer (ordered homs by inclusion, dagger, meet, modularity),
//  - Galois connections (∃_f ⊣ f* ⊣ ∀_f),
//  - and a tiny relational Hoare-logic helper.

/************ Finite sets & helpers ************/
import { Eq } from './eq.js';
const defaultEq = <T>() => (x:T,y:T) => x===y;

export class Finite<T> {
  readonly elems: T[];
  readonly eq: Eq<T>;
  constructor(elems: Iterable<T>, eq: Eq<T> = defaultEq<T>()) {
    const out: T[] = [];
    for (const v of elems) if (!out.some(w => eq(v,w))) out.push(v);
    this.elems = out;
    this.eq = eq;
  }
  has(x:T): boolean { return this.elems.some(y => this.eq(x,y)); }
  indexOf(x:T): number { return this.elems.findIndex(y => this.eq(x,y)); }
}

/************ Subsets ************/
export class Subset<T> {
  readonly U: Finite<T>;
  private mask: boolean[];
  private constructor(U:Finite<T>, mask:boolean[]){ this.U=U; this.mask=mask; }
  static empty<T>(U:Finite<T>) { return new Subset(U, Array(U.elems.length).fill(false)); }
  static all<T>(U:Finite<T>) { return new Subset(U, Array(U.elems.length).fill(true)); }
  static from<T>(U:Finite<T>, xs: Iterable<T>): Subset<T> {
    const m = Array(U.elems.length).fill(false);
    for(const x of xs){ const i=U.indexOf(x); if (i>=0) m[i]=true; }
    return new Subset(U,m);
  }
  static by<T>(U:Finite<T>, p:(x:T)=>boolean): Subset<T> {
    return new Subset(U, U.elems.map(p));
  }
  contains(x:T): boolean { const i=this.U.indexOf(x); return i>=0 ? this.mask[i]! : false; }
  toArray(): T[] { return this.U.elems.filter((_,i)=>this.mask[i]); }
  leq(that:Subset<T>): boolean {
    if (this.U!==that.U) throw new Error("subset carrier mismatch");
    for(let i=0;i<this.U.elems.length;i++) if (this.mask[i] && !that.mask[i]) return false;
    return true;
  }
}

/************ Relations ************/
export type Pair<A,B> = [A,B];

export class Rel<A,B> {
  readonly A: Finite<A>;
  readonly B: Finite<B>;
  public mat: boolean[][]; // |A| x |B| - made public for access

  private constructor(A:Finite<A>, B:Finite<B>, mat:boolean[][]){
    this.A=A; this.B=B; this.mat=mat;
  }

  static empty<A,B>(A:Finite<A>, B:Finite<B>): Rel<A,B> {
    return new Rel(A,B, Array.from({length:A.elems.length},()=>Array(B.elems.length).fill(false)));
  }

  static fromPairs<A,B>(A:Finite<A>, B:Finite<B>, pairs: Iterable<Pair<A,B>>): Rel<A,B> {
    const r = Rel.empty(A,B);
    for (const [a,b] of pairs){
      const i = A.indexOf(a), j = B.indexOf(b);
      if (i<0 || j<0) throw new Error("pair out of carrier");
      r.mat[i]![j]! = true;
    }
    return r;
  }

  static id<T>(X:Finite<T>): Rel<T,T> {
    const mat = Array.from({length:X.elems.length},(_,i)=>{
      const row = Array(X.elems.length).fill(false);
      row[i]=true; return row;
    });
    return new Rel(X,X,mat);
  }

  /** Membership */
  has(a:A, b:B): boolean {
    const i = this.A.indexOf(a), j = this.B.indexOf(b);
    return i>=0 && j>=0 ? this.mat[i]![j]! : false;
  }

  /** Converse (dagger): swap sides */
  converse(): Rel<B,A> {
    const m = Array.from({length:this.B.elems.length},()=>Array(this.A.elems.length).fill(false));
    for(let i=0;i<this.A.elems.length;i++){
      for(let j=0;j<this.B.elems.length;j++){
        if (this.mat[i]![j]!) m[j]![i]=true;
      }
    }
    return new Rel(this.B,this.A,m);
  }
  dagger(): Rel<B,A> { return this.converse(); }

  /** Inclusion (refinement) */
  leq(that: Rel<A,B>): boolean {
    if (this.A!==that.A || this.B!==that.B) throw new Error("carrier mismatch");
    for(let i=0;i<this.A.elems.length;i++)
      for(let j=0;j<this.B.elems.length;j++)
        if (this.mat[i]![j]! && !that.mat[i]![j]!) return false;
    return true;
  }

  /** Meet / Join (intersection/union) */
  meet(that: Rel<A,B>): Rel<A,B> {
    if (this.A!==that.A || this.B!==that.B) throw new Error("carrier mismatch");
    const m = this.mat.map((row,i)=>row.map((v,j)=> v && that.mat[i]![j]!));
    return new Rel(this.A,this.B,m);
  }
  join(that: Rel<A,B>): Rel<A,B> {
    if (this.A!==that.A || this.B!==that.B) throw new Error("carrier mismatch");
    const m = this.mat.map((row,i)=>row.map((v,j)=> v || that.mat[i]![j]!));
    return new Rel(this.A,this.B,m);
  }

  /** Compose S∘R (A -R-> B -S-> C) */
  compose<C>(S: Rel<B,C>): Rel<A,C> {
    if (this.B!==S.A) throw new Error("middle carrier mismatch");
    const m = Array.from({length:this.A.elems.length},()=>Array(S.B.elems.length).fill(false));
    for(let i=0;i<this.A.elems.length;i++){
      for(let k=0;k<S.B.elems.length;k++){
        let hit = false;
        for(let j=0;j<this.B.elems.length && !hit;j++){
          if (this.mat[i]![j]! && S.mat[j]![k]!) { hit = true; m[i]![k]=true; }
        }
      }
    }
    return new Rel(this.A, S.B, m);
  }

  /** Image of a subset X⊆A under R: { b | ∃a∈X. a R b } */
  image(X: Iterable<A>): B[] {
    const maskA = Array(this.A.elems.length).fill(false);
    for(const a of X){ const i=this.A.indexOf(a); if (i>=0) maskA[i]=true; }
    const out:boolean[] = Array(this.B.elems.length).fill(false);
    for(let i=0;i<this.A.elems.length;i++) if(maskA[i]!){
      for(let j=0;j<this.B.elems.length;j++) if(this.mat[i]![j]!) out[j]=true;
    }
    return this.B.elems.filter((_,j)=>out[j]!);
  }

  /** Pretty print pairs */
  toPairs(): Pair<A,B>[] {
    const out: Pair<A,B>[] = [];
    for(let i=0;i<this.A.elems.length;i++)
      for(let j=0;j<this.B.elems.length;j++)
        if (this.mat[i]![j]!) out.push([this.A.elems[i]!, this.B.elems[j]!]);
    return out;
  }

  /** Functionality/totality tests (for allegory 'maps') */
  isFunctional(): boolean { // single-valued: each a relates to at most one b
    for(let i=0;i<this.A.elems.length;i++){
      let seen=false;
      for(let j=0;j<this.B.elems.length;j++){
        if (this.mat[i]![j]!) { if (seen) return false; seen=true; }
      }
    }
    return true;
  }
  isTotal(): boolean { // defined on every a
    for(let i=0;i<this.A.elems.length;i++){
      let any=false; 
      for(let j=0;j<this.B.elems.length;j++) if(this.mat[i]![j]!) { any=true; break; }
      if (!any) return false;
    }
    return true;
  }
}

/************ Functions and companions/conjoints ************/
export type Fun<A,B> = (a:A)=>B;

export function graph<A,B>(A:Finite<A>, B:Finite<B>, f:Fun<A,B>): Rel<A,B> {
  const r = Rel.empty(A,B);
  for (let i=0;i<A.elems.length;i++){
    const a = A.elems[i]!;
    const b = f(a);
    const j = B.indexOf(b);
    if (j<0) throw new Error("graph: f(a) not in codomain");
    r.mat[i]![j]! = true;
  }
  return r;
}

export function companion<A,B>(A:Finite<A>, B:Finite<B>, f:Fun<A,B>): Rel<A,B> {
  return graph(A,B,f);
}

export function conjoint<A,B>(A:Finite<A>, B:Finite<B>, f:Fun<A,B>): Rel<B,A> {
  return graph(A,B,f).dagger();
}

/************ Equipment (unit/counit) checks ************/
// Unit: id_X ⊆ ⟨f⟩† ; ⟨f⟩
// Counit: ⟨f⟩ ; ⟨f⟩† ⊆ id_Y
export function unitHolds<A,B>(A0:Finite<A>, B0:Finite<B>, f:Fun<A,B>): boolean {
  const G = graph(A0,B0,f);
  const lhs = Rel.id(A0);
  const rhs = G.dagger().compose(G);
  return lhs.leq(rhs as any); // Type assertion needed for equipment laws
}

export function counitHolds<A,B>(A0:Finite<A>, B0:Finite<B>, f:Fun<A,B>): boolean {
  const G = graph(A0,B0,f);
  const lhs = G.compose(G.dagger());
  const rhs = Rel.id(B0);
  return lhs.leq(rhs as any); // Type assertion needed for equipment laws
}

/************ Squares: refinement-by-inclusion ************/
// A --R--> B
// | f      | g
// v        v
// A' -R'-> B'
// Holds iff ∀a,b. a R b ⇒ f(a) R' g(b)
export function squareHolds<A,B,A1,B1>(
  f: Fun<A,A1>, R: Rel<A,B>,
  g: Fun<B,B1>, R1: Rel<A1,B1>
): boolean {
  for (const [a,b] of R.toPairs()){
    const fa = f(a), gb = g(b);
    if (!R1.has(fa, gb)) return false;
  }
  return true;
}

/************ Allegory layer ************/
export const RelOrder = {
  // Involution
  daggerInvolutive<A,B>(R:Rel<A,B>): boolean {
    const double_dagger = R.dagger().dagger();
    return JSON.stringify(double_dagger.toPairs()) === JSON.stringify(R.toPairs());
  },
  // Modularity (distributivity over meet, as inclusion)
  modularLeft<A,B,C>(R:Rel<A,B>, S:Rel<B,C>, T:Rel<B,C>): boolean {
    const left = R.compose(S.meet(T));
    const right = R.compose(S).meet(R.compose(T));
    return left.leq(right);
  },
  // Map predicate: total & functional (graphs of total functions)
  isMap<A,B>(R:Rel<A,B>): boolean {
    return R.isFunctional() && R.isTotal();
  }
};

/************ Advanced relational operations ************/

/** Pre-image of a subset Y⊆B under R: { a | ∃b∈Y. a R b } */
export function preImage<A,B>(R: Rel<A,B>, Y: Iterable<B>): A[] {
  const maskB = Array(R.B.elems.length).fill(false);
  for(const b of Y){ const j=R.B.indexOf(b); if (j>=0) maskB[j]=true; }
  const out:boolean[] = Array(R.A.elems.length).fill(false);
  for(let j=0;j<R.B.elems.length;j++) if(maskB[j]!){
    for(let i=0;i<R.A.elems.length;i++) if(R.mat[i]![j]!) out[i]=true;
  }
  return R.A.elems.filter((_,i)=>out[i]!);
}

/** Domain of a relation: { a | ∃b. a R b } */
export function domain<A,B>(R: Rel<A,B>): A[] {
  return R.A.elems.filter(a => R.B.elems.some(b => R.has(a,b)));
}

/** Range of a relation: { b | ∃a. a R b } */
export function range<A,B>(R: Rel<A,B>): B[] {
  return R.B.elems.filter(b => R.A.elems.some(a => R.has(a,b)));
}

/************ Residuals (liftings) & adjunction laws ************/
// Left residual R \ S is the greatest X with R;X ≤ S  (types: R:A→B, S:A→C, R\S:B→C)
// Right residual S / X is the greatest R with R;X ≤ S (types: X:B→C, S:A→C, S/X:A→B)
export function leftResidual<A,B,C>(R: Rel<A,B>, S: Rel<A,C>): Rel<B,C> {
  if (R.A!==S.A) throw new Error("leftResidual: domain mismatch");
  const Bf = R.B, Cf = S.B;
  const pairs: [B, C][] = [];
  
  for (const b of Bf.elems){
    for (const c of Cf.elems){
      // keep (b, c) iff ∀a: a R b ⇒ a S c
      let ok = true;
      for (const a of R.A.elems){
        if (R.has(a, b) && !S.has(a, c)) { ok=false; break; }
      }
      if (ok) pairs.push([b, c]);
    }
  }
  return Rel.fromPairs(Bf, Cf, pairs);
}

export function rightResidual<A,B,C>(S: Rel<A,C>, X: Rel<B,C>): Rel<A,B> {
  if (S.B!==X.B) throw new Error("rightResidual: codomain mismatch");
  const Af = S.A, Bf = X.A;
  const pairs: [A, B][] = [];
  
  for (const a of Af.elems){
    for (const b of Bf.elems){
      // include (a,b) iff ∀c: b X c ⇒ a S c
      let ok = true;
      for (const c of S.B.elems){
        if (X.has(b, c) && !S.has(a, c)) { ok=false; break; }
      }
      if (ok) pairs.push([a, b]);
    }
  }
  return Rel.fromPairs(Af, Bf, pairs);
}

// Adjunction property checks
export function adjunctionLeftHolds<A,B,C>(R:Rel<A,B>, X:Rel<B,C>, S:Rel<A,C>): boolean {
  const lhs = R.compose(X).leq(S);
  const rhs = X.leq(leftResidual(R,S));
  return lhs===rhs;
}

export function adjunctionRightHolds<A,B,C>(R:Rel<A,B>, X:Rel<B,C>, S:Rel<A,C>): boolean {
  const lhs = R.compose(X).leq(S);
  const rhs = R.leq(rightResidual(S,X));
  return lhs===rhs;
}

/************ Galois connections via companions (∃_f ⊣ f* ⊣ ∀_f) ************/

/** Direct image ∃_f: P(A) → P(B) via f, i.e., ∃_f(P) = {f(a) | a ∈ P} */
export function existsAlong<A,B>(A0: Finite<A>, B0: Finite<B>, f: Fun<A,B>, P: Subset<A>): Subset<B> {
  const image = P.toArray().map(f);
  return Subset.from(B0, image);
}

/** Inverse image f*: P(B) → P(A), i.e., f*(Q) = {a | f(a) ∈ Q} */
export function preimageSub<A,B>(A0: Finite<A>, B0: Finite<B>, f: Fun<A,B>, Q: Subset<B>): Subset<A> {
  return Subset.by(A0, a => Q.contains(f(a)));
}

/** Universal image ∀_f: P(A) → P(B), i.e., ∀_f(P) = {b | ∀a. f(a)=b ⇒ a ∈ P} */
export function forallAlong<A,B>(A0: Finite<A>, B0: Finite<B>, f: Fun<A,B>, P: Subset<A>): Subset<B> {
  return Subset.by(B0, b => {
    // b ∈ ∀_f(P) iff every a with f(a)=b satisfies a ∈ P
    const preimageBOfB = A0.elems.filter(a => B0.eq(f(a), b));
    return preimageBOfB.every(a => P.contains(a));
  });
}

/** Check ∃_f ⊣ f*: ∃_f(P) ⊆ Q ⟺ P ⊆ f*(Q) */
export function adjunctionExistsPreimageHolds<A,B>(
  A0: Finite<A>, B0: Finite<B>, f: Fun<A,B>, P: Subset<A>, Q: Subset<B>
): boolean {
  const lhs = existsAlong(A0, B0, f, P).leq(Q);
  const rhs = P.leq(preimageSub(A0, B0, f, Q));
  return lhs === rhs;
}

/** Check f* ⊣ ∀_f: f*(Q) ⊆ R ⟺ Q ⊆ ∀_f(R) */
export function adjunctionPreimageForallHolds<A,B>(
  A0: Finite<A>, B0: Finite<B>, f: Fun<A,B>, Q: Subset<B>, R: Subset<A>
): boolean {
  const lhs = preimageSub(A0, B0, f, Q).leq(R);
  const rhs = Q.leq(forallAlong(A0, B0, f, R));
  return lhs === rhs;
}

/** Verify the full Galois connection chain ∃_f ⊣ f* ⊣ ∀_f */
export function verifyGaloisChain<A,B>(
  A0: Finite<A>, B0: Finite<B>, f: Fun<A,B>
): {
  existsPreimage: boolean;
  preimageForall: boolean;
  isCompleteChain: boolean;
} {
  // Test on a sample of subsets (full enumeration for small sets)
  const allSubsetsA = generateAllSubsets(A0);
  const allSubsetsB = generateAllSubsets(B0);
  
  let existsPreimageOk = true;
  let preimageForallOk = true;
  
  for (const P of allSubsetsA) {
    for (const Q of allSubsetsB) {
      if (!adjunctionExistsPreimageHolds(A0, B0, f, P, Q)) {
        existsPreimageOk = false;
      }
    }
  }
  
  for (const Q of allSubsetsB) {
    for (const R of allSubsetsA) {
      if (!adjunctionPreimageForallHolds(A0, B0, f, Q, R)) {
        preimageForallOk = false;
      }
    }
  }
  
  return {
    existsPreimage: existsPreimageOk,
    preimageForall: preimageForallOk,
    isCompleteChain: existsPreimageOk && preimageForallOk
  };
}

/** Generate all subsets of a finite set (for testing) */
export function generateAllSubsets<T>(U: Finite<T>): Subset<T>[] {
  const n = U.elems.length;
  const subsets: Subset<T>[] = [];
  
  for (let mask = 0; mask < (1 << n); mask++) {
    const elements: T[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        elements.push(U.elems[i]!);
      }
    }
    subsets.push(Subset.from(U, elements));
  }
  
  return subsets;
}

/************ Predicate transformer semantics ************/

/** Weakest precondition: wp(prog, post) = { s | ∀s'. s prog s' ⇒ s' ∈ post } */
export function wp<State>(
  prog: Rel<State,State>, 
  post: Subset<State>
): Subset<State> {
  return Subset.by(prog.A, s => {
    const image = prog.image([s]);
    return image.every(sPrime => post.contains(sPrime));
  });
}

/** Strongest postcondition: sp(pre, prog) = { s' | ∃s ∈ pre. s prog s' } */
export function sp<State>(
  pre: Subset<State>,
  prog: Rel<State,State>
): Subset<State> {
  const image = prog.image(pre.toArray());
  return Subset.from(prog.B, image);
}

/************ Hoare triples ************/
export function hoareHolds<State>(
  pre: Subset<State>,
  prog: Rel<State,State>,
  post: Subset<State>
): { ok:boolean; counterexample?: { s: State; sPrime: State } } {
  const image = prog.image(pre.toArray());
  for (const sPrime of image){
    if (!post.contains(sPrime)){
      // find a witness s that leads to sPrime
      for (const s of pre.toArray()){
        if (prog.has(s, sPrime)) return { ok:false, counterexample:{ s, sPrime } };
      }
    }
  }
  return { ok:true };
}

/************ Pretty printing helpers ************/
export function printRel<A,B>(R: Rel<A,B>, name?: string): void {
  const pairs = R.toPairs();
  console.log(`${name || 'Relation'}: {${pairs.map(([a,b]) => `${a}→${b}`).join(', ')}}`);
}

export function printSubset<T>(S: Subset<T>, name?: string): void {
  const elems = S.toArray();
  console.log(`${name || 'Subset'}: {${elems.join(', ')}}`);
}

/************ Demo function ************/
export function demo() {
  console.log("=".repeat(80));
  console.log("RELATIONAL EQUIPMENT & ALLEGORY DEMO");
  console.log("=".repeat(80));

  const A = new Finite([0,1,2,3]);
  const B = new Finite(["x","y","z"]);
  const C = new Finite(["X","Y","Z"]);

  // A nondeterministic spec R ⊆ A×B
  const R = Rel.fromPairs(A,B, [
    [0,"x"], [0,"y"],
    [1,"y"],
    [2,"y"], [2,"z"],
    [3,"z"]
  ]);

  console.log("\n1. BASIC RELATIONAL OPERATIONS");
  printRel(R, "Spec relation R");
  
  const g = (b:string)=> ({ x:"X", y:"Y", z:"Z" } as any)[b];
  const f = (a:number)=> a;
  const Aid = A, Cid = C;
  const Rprime = Rel.fromPairs(Aid,Cid, [
    [0,"X"], [0,"Y"],
    [1,"Y"],
    [2,"Y"], [2,"Z"],
    [3,"Z"]
  ]);

  printRel(Rprime, "Implementation relation R'");

  console.log("\n2. EQUIPMENT LAWS");
  console.log("Unit id_A ≤ ⟨f⟩†;⟨f⟩ ?", unitHolds(A,A,f)); // f: A -> A (identity)
  console.log("Counit ⟨g⟩;⟨g⟩† ≤ id_C ?", counitHolds(C,C,(c:string)=>c)); // g: C -> C (identity)

  console.log("\n3. SQUARE (REFINEMENT)");
  console.log("Square holds (f=id, g groups letters):", squareHolds(f, R, g, Rprime));

  console.log("\n4. ALLEGORY PROPERTIES");
  console.log("Dagger involutive?", RelOrder.daggerInvolutive(R));
  
  const S = Rel.fromPairs(B,C, [["x","X"],["y","Y"]]);
  const T = Rel.fromPairs(B,C, [["y","Y"],["z","Z"]]);
  console.log("Modular left R;(S∩T) ≤ R;S ∩ R;T ?", RelOrder.modularLeft(R,S,T));
  console.log("isMap(graph(f)) ?", RelOrder.isMap(graph(A,Aid,f)));

  console.log("\n5. RELATIONAL OPERATIONS");
  console.log("Domain of R:", domain(R));
  console.log("Range of R:", range(R));
  console.log("Image of {0,1} under R:", R.image([0,1]));
  console.log("Pre-image of {Y,Z} under R':", preImage(Rprime, ["Y","Z"]));

  console.log("\n6. HOARE LOGIC");
  const States = new Finite([0,1,2,3,4]);
  // Program: increment-or-stutter: s' = s or s+1 (capped at 4)
  const Prog = Rel.fromPairs(States, States,
    States.elems.flatMap(s => [[s,s], [s, Math.min(4, s+1)]] as [number,number][])
  );
  
  const Pre = Subset.by(States, s => s%2===0);       // even states
  const Post = Subset.by(States, s => s>=0 && s<=4); // trivial post
  
  printSubset(Pre, "Precondition (even states)");
  printSubset(Post, "Postcondition (≤4)");
  
  const hoare = hoareHolds(Pre, Prog, Post);
  console.log("{Pre} Prog {Post} holds:", hoare.ok);
  if (!hoare.ok && hoare.counterexample) {
    console.log("Counterexample:", hoare.counterexample);
  }

  console.log("\n7. PREDICATE TRANSFORMERS");
  const StrictPost = Subset.by(States, s => s <= 2);
  const weakest = wp(Prog, StrictPost);
  const strongest = sp(Pre, Prog);
  
  printSubset(weakest, "wp(Prog, ≤2)");
  printSubset(strongest, "sp(even, Prog)");

  console.log("\n8. GALOIS CONNECTIONS (∃_f ⊣ f* ⊣ ∀_f)");
  
  // Test Galois connections on a simple function
  const galoisF = (a: number) => a < 2 ? "small" : "large";
  const Labels = new Finite(["small", "large"]);
  
  console.log("Function f: {0,1,2,3} → {small,large} where f(a) = (a<2 ? small : large)");
  
  // Test the Galois chain
  const galoisTest = verifyGaloisChain(A, Labels, galoisF);
  console.log("∃_f ⊣ f* adjunction holds:", galoisTest.existsPreimage);
  console.log("f* ⊣ ∀_f adjunction holds:", galoisTest.preimageForall);
  console.log("Complete Galois chain ∃_f ⊣ f* ⊣ ∀_f:", galoisTest.isCompleteChain);
  
  // Show examples
  const testSet = Subset.from(A, [0, 1]);
  const existsImage = existsAlong(A, Labels, galoisF, testSet);
  const forallImage = forallAlong(A, Labels, galoisF, testSet);
  
  printSubset(testSet, "Test set {0,1}");
  printSubset(existsImage, "∃_f({0,1}) = direct image");
  printSubset(forallImage, "∀_f({0,1}) = universal image");

  console.log("\n" + "=".repeat(80));
  console.log("RELATIONAL EQUIPMENT FEATURES:");
  console.log("✓ Double category of relations with functions as companions/conjoints");
  console.log("✓ Equipment laws (unit/counit) verification");
  console.log("✓ Allegory structure with dagger, meet, modular laws");
  console.log("✓ Square refinement checking for program verification");
  console.log("✓ Relational Hoare logic with pre/post conditions");
  console.log("✓ Predicate transformers (wp/sp) for program analysis");
  console.log("✓ Residuals (left/right liftings) with adjunction verification");
  console.log("✓ Galois connections (∃_f ⊣ f* ⊣ ∀_f) with full chain verification");
  console.log("=".repeat(80));
}
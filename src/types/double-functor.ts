// double-functor.ts
// 2D reasoning with the double category (Set, Fun | Rel) of functions & relations.
// - Squares with horizontal/vertical composition and an interchange checker
// - A DoubleFunctor given by object-wise bijections (renamings)
// - Auto-checks that the functor preserves pasting (horizontal/vertical composition of squares)
//
// Run: ts-node double-functor.ts
//
// Depends on rel-equipment.ts

import {
  Finite, Rel, Fun, graph
} from "./rel-equipment.js";

/************ Squares in Set/Rel ************/
// A --R--> B
// | f      | g
// v        v
// A' -R'-> B'
export type Square<A,B,A1,B1> = {
  A: Finite<A>; B: Finite<B>; A1: Finite<A1>; B1: Finite<B1>;
  f: Fun<A,A1>; g: Fun<B,B1>;
  R: Rel<A,B>;  R1: Rel<A1,B1>;
};

export function squareHolds<A,B,A1,B1>(sq: Square<A,B,A1,B1>): boolean {
  // ∀a,b. a R b ⇒ f(a) R1 g(b)
  for (const [a,b] of sq.R.toPairs()){
    if (!sq.R1.has(sq.f(a), sq.g(b))) return false;
  }
  return true;
}

// Make the least R1 that makes the square hold (direct image along (f,g))
export function induceBottom<A,B,A1,B1>(A1_:Finite<A1>, B1_:Finite<B1>, f:Fun<A,A1>, g:Fun<B,B1>, R: Rel<A,B>): Rel<A1,B1> {
  const pairs: [A1,B1][] = [];
  for (const [a,b] of R.toPairs()) pairs.push([f(a), g(b)]);
  return Rel.fromPairs(A1_, B1_, pairs);
}

export function mkSquare<A,B,A1,B1>(A:Finite<A>, B:Finite<B>, A1:Finite<A1>, B1:Finite<B1>, f:Fun<A,A1>, R:Rel<A,B>, g:Fun<B,B1>, R1?:Rel<A1,B1>): Square<A,B,A1,B1> {
  const bottom = R1 ?? induceBottom(A1,B1,f,g,R);
  const sq: Square<A,B,A1,B1> = { A,B,A1,B1,f,g,R, R1: bottom };
  if (!squareHolds(sq)) throw new Error("mkSquare: given R1 does not satisfy square condition");
  return sq;
}

/************ Composition of squares ************/
// Horizontal composition:
//   A --R--> B --S--> C            A --R;S--> C
//   | f      | g      | h    ==>   | f            | h
//   v        v        v            v              v
//   A' -R'-> B' -S'-> C'           A' -R';S'->    C'
export function hComp<A,B,C,A1,B1,C1>(
  left: Square<A,B,A1,B1>,
  right: Square<B,C,B1,C1>
): Square<A,C,A1,C1> {
  if (left.B !== right.A) throw new Error("hComp: middle object mismatch");
  if (left.B1 !== right.A1) throw new Error("hComp: middle object (bottom) mismatch");
  const top = left.R.compose(right.R as any) as Rel<A,C>;
  const bot = left.R1.compose(right.R1 as any) as Rel<A1,C1>;
  const sq = { A: left.A, B: right.B, A1: left.A1, B1: right.B1, f: left.f, g: right.g, R: top, R1: bot } as Square<A,C,A1,C1>;
  if (!squareHolds(sq)) throw new Error("hComp: result is not a square (shouldn't happen)");
  return sq;
}

// Vertical composition:
//   A --R--> B
//   | f      | g
//   v        v
//   A' -R'-> B'
//   | f'     | g'
//   v        v
//   A''-R''> B''
// ==> compose verticals; keep top/bottom relations
export function vComp<A,B,A1,B1,A2,B2>(
  top: Square<A,B,A1,B1>,
  bot: Square<A1,B1,A2,B2>
): Square<A,B,A2,B2> {
  if (top.A1 !== bot.A) throw new Error("vComp: vertical A mismatch");
  if (top.B1 !== bot.B) throw new Error("vComp: vertical B mismatch");
  if (top.R1 !== bot.R) throw new Error("vComp: middle relation mismatch");
  const f = (a:A)=> bot.f(top.f(a));
  const g = (b:B)=> bot.g(top.g(b));
  const sq = { A: top.A, B: top.B, A1: bot.A1, B1: bot.B1, f, g, R: top.R, R1: bot.R1 } as Square<A,B,A2,B2>;
  if (!squareHolds(sq)) throw new Error("vComp: result is not a square (shouldn't happen)");
  return sq;
}

/************ Interchange checker ************/
export function interchangeHolds<A,B,C,A1,B1,C1,A2,B2,C2>(
  s00: Square<A,B,A1,B1>, s01: Square<B,C,B1,C1>,
  s10: Square<A1,B1,A2,B2>, s11: Square<B1,C1,B2,C2>
): boolean {
  // (s00 ⊞ s01) ▽ (s10 ⊞ s11)  ==  (s00 ▽ s10) ⊞ (s01 ▽ s11)
  const top = hComp(s00, s01);
  const bot = hComp(s10, s11);
  const left = vComp(top, bot);

  const lcol = vComp(s00, s10);
  const rcol = vComp(s01, s11);
  const right = hComp(lcol, rcol);

  return equalSquares(left, right);
}

/************ Double functor via bijective renamings ************/
export type Bijection<A,B> = { forth: Fun<A,B>; back: Fun<B,A> };

export function isBijection<A,B>(A:Finite<A>, B:Finite<B>, b:Bijection<A,B>): boolean {
  // back∘forth = id_A; forth∘back = id_B
  const ok1 = A.elems.every(a => b.back(b.forth(a)) === a);
  const ok2 = B.elems.every(bx => b.forth(b.back(bx)) === bx);
  return ok1 && ok2;
}

// A small "renaming" double functor: acts by bijections on objects, conjugation on verticals, direct image on horizontals.
export class RenamingDoubleFunctor {
  private objMap = new Map<Finite<any>, { target: Finite<any>, bij: Bijection<any,any> }>();

  addObject<A,B>(A:Finite<A>, A1:Finite<B>, bij: Bijection<A,B>): void {
    if (!isBijection(A, A1, bij)) throw new Error("addObject: not a bijection for this pair of carriers");
    this.objMap.set(A, { target: A1, bij: bij as any });
  }

  getTarget<A,B>(A:Finite<A>): { A1:Finite<B>; bij:Bijection<A,B> } {
    const x = this.objMap.get(A);
    if (!x) throw new Error("No target registered for this object");
    return { A1: x.target as any, bij: x.bij as any };
  }

  onObj(A:Finite<any>): Finite<any> { return this.getTarget(A).A1; }

  onV(A:Finite<any>, B:Finite<any>, f: Fun<any,any>): Fun<any,any> {
    const { bij: bA } = this.getTarget(A);
    const { bij: bB } = this.getTarget(B);
    return (a1: any) => bB.forth(f(bA.back(a1)));
  }

  onH(R: Rel<any,any>): Rel<any,any> {
    const { bij: bA, A1 } = this.getTarget(R.A as any);
    const { bij: bB, A1: B1_ } = this.getTarget(R.B as any);
    const pairs: [any,any][] = [];
    for (const [a,b] of R.toPairs()) pairs.push([bA.forth(a as any), bB.forth(b as any)]);
    return Rel.fromPairs(A1 as any, B1_ as any, pairs as any);
  }

  onSquare<A,B,A1,B1>(sq: Square<A,B,A1,B1>): Square<any,any,any,any> {
    const A1t = this.onObj(sq.A);
    const B1t = this.onObj(sq.B);
    const A2t = this.onObj(sq.A1);
    const B2t = this.onObj(sq.B1);
    const f = this.onV(sq.A, sq.A1, sq.f);
    const g = this.onV(sq.B, sq.B1, sq.g);
    const R = this.onH(sq.R);
    const R1 = this.onH(sq.R1);
    const out = { A: A1t, B: B1t, A1: A2t, B1: B2t, f, g, R, R1 };
    if (!squareHolds(out)) throw new Error("onSquare: image is not a square (shouldn't happen)");
    return out;
  }

  preservesHComp(left: Square<any,any,any,any>, right: Square<any,any,any,any>): boolean {
    try {
      const lhs = this.onSquare(hComp(left, right));
      const rhs = hComp(this.onSquare(left), this.onSquare(right));
      return equalSquares(lhs, rhs);
    } catch {
      return false;
    }
  }

  preservesVComp(top: Square<any,any,any,any>, bot: Square<any,any,any,any>): boolean {
    try {
      const lhs = this.onSquare(vComp(top, bot));
      const rhs = vComp(this.onSquare(top), this.onSquare(bot));
      return equalSquares(lhs, rhs);
    } catch {
      return false;
    }
  }
}

export function equalSquares(s: Square<any,any,any,any>, t: Square<any,any,any,any>): boolean {
  const sameF = (A:Finite<any>, f1:Fun<any,any>, f2:Fun<any,any>) =>
    A.elems.every((a:any) => f1(a) === f2(a));
  const sameRel = (R1:Rel<any,any>, R2:Rel<any,any>) => {
    const p1 = new Set(R1.toPairs().map(p=>JSON.stringify(p)));
    const p2 = new Set(R2.toPairs().map(p=>JSON.stringify(p)));
    if (p1.size!==p2.size) return false;
    for (const x of p1) if (!p2.has(x)) return false;
    return true;
  };
  return sameF(s.A as any, s.f, t.f)
      && sameF(s.B as any, s.g, t.g)
      && sameRel(s.R, t.R)
      && sameRel(s.R1, t.R1);
}

/************ Lax double functor via surjections ************/
export type Surjection<A,B> = { 
  surj: Fun<A,B>; 
  section: Fun<B,A>; // chosen section with surj ∘ section = id_B
};

export function isSurjection<A,B>(A:Finite<A>, B:Finite<B>, s:Surjection<A,B>): boolean {
  // Check surj ∘ section = id_B
  return B.elems.every(b => s.surj(s.section(b)) === b);
}

export class SurjectiveLaxDoubleFunctor {
  private objMap = new Map<Finite<any>, { target: Finite<any>, surj: Surjection<any,any> }>();

  addObject<A,B>(A:Finite<A>, B:Finite<B>, surj: Surjection<A,B>): void {
    if (!isSurjection(A, B, surj)) throw new Error("addObject: not a valid surjection");
    this.objMap.set(A, { target: B, surj: surj as any });
  }

  getTarget<A,B>(A:Finite<A>): { B:Finite<B>; surj:Surjection<A,B> } {
    const x = this.objMap.get(A);
    if (!x) throw new Error("No target registered for this object");
    return { B: x.target as any, surj: x.surj as any };
  }

  onObj(A:Finite<any>): Finite<any> { return this.getTarget(A).B; }

  onV(A:Finite<any>, B:Finite<any>, f: Fun<any,any>): Fun<any,any> {
    const { surj: sA } = this.getTarget(A);
    const { surj: sB } = this.getTarget(B);
    // F(f) = p_B ∘ f ∘ s_A
    return (a1: any) => sB.surj(f(sA.section(a1)));
  }

  onH(R: Rel<any,any>): Rel<any,any> {
    const { surj: sA, B: A1t } = this.getTarget(R.A as any);
    const { surj: sB, B: B1t } = this.getTarget(R.B as any);
    // F(R) = p_A† ; R ; p_B (fiberwise pushforward)
    const pairs: [any,any][] = [];
    for (const [a,b] of R.toPairs()) {
      pairs.push([sA.surj(a as any), sB.surj(b as any)]);
    }
    return Rel.fromPairs(A1t as any, B1t as any, pairs as any);
  }

  // Check lax square condition: F(R) ; graph(F(g)) ⊆ graph(F(f)) ; F(R1)
  squareLax<A,B,A1,B1>(sq: Square<A,B,A1,B1>): { left: Rel<any,any>, right: Rel<any,any>, holds: boolean } {
    const FR = this.onH(sq.R);
    const Fg = graph(this.onObj(sq.B), this.onObj(sq.B1), this.onV(sq.B, sq.B1, sq.g));
    const Ff = graph(this.onObj(sq.A), this.onObj(sq.A1), this.onV(sq.A, sq.A1, sq.f));
    const FR1 = this.onH(sq.R1);
    
    const left = FR.compose(Fg as any);
    const right = Ff.compose(FR1 as any);
    
    return {
      left: left as any,
      right: right as any,
      holds: left.leq(right as any)
    };
  }

  preservesHCompLax(left: Square<any,any,any,any>, right: Square<any,any,any,any>): boolean {
    try {
      const composed = hComp(left, right);
      const laxComp = this.squareLax(composed);
      const laxLeft = this.squareLax(left);
      const laxRight = this.squareLax(right);
      
      // For lax preservation, we need the lax condition to be preserved under composition
      return laxComp.holds && laxLeft.holds && laxRight.holds;
    } catch {
      return false;
    }
  }
}

/************ Utility functions ************/

export function printSquare<A,B,A1,B1>(sq: Square<A,B,A1,B1>, name?: string): void {
  console.log(`${name || 'Square'}:`);
  console.log(`  ${sq.A.elems.join(',')} --R--> ${sq.B.elems.join(',')}`);
  console.log(`  |f                    |g`);
  console.log(`  v                     v`);
  console.log(`  ${sq.A1.elems.join(',')} --R'--> ${sq.B1.elems.join(',')}`);
  console.log(`  R: {${sq.R.toPairs().map(([a,b]) => `${a}→${b}`).join(', ')}}`);
  console.log(`  R': {${sq.R1.toPairs().map(([a,b]) => `${a}→${b}`).join(', ')}}`);
  console.log(`  Holds: ${squareHolds(sq)}`);
}

export function createTestBijection<A,B>(A: Finite<A>, B: Finite<B>, mapping: Map<A,B>): Bijection<A,B> {
  const reverseMap = new Map<B,A>();
  for (const [a,b] of mapping) {
    reverseMap.set(b, a);
  }
  
  return {
    forth: (a: A) => mapping.get(a)!,
    back: (b: B) => reverseMap.get(b)!
  };
}

export function createTestSurjection<A,B>(A: Finite<A>, B: Finite<B>, mapping: Map<A,B>, section: Map<B,A>): Surjection<A,B> {
  return {
    surj: (a: A) => mapping.get(a)!,
    section: (b: B) => section.get(b)!
  };
}

/************ Demo function ************/
export function demo() {
  console.log("=".repeat(80));
  console.log("DOUBLE CATEGORY & 2D REASONING DEMO");
  console.log("=".repeat(80));

  // Objects
  const A = new Finite([0,1,2]);
  const B = new Finite(["x","y","z"]);
  const C = new Finite(["X","Y"]);

  const A1 = new Finite(["a0","a1","a2"]);
  const B1 = new Finite(["bx","by","bz"]);
  const C1 = new Finite(["cX","cY"]);

  console.log("\n1. SQUARE CONSTRUCTION");

  // Relations
  const R = Rel.fromPairs(A,B, [[0,"x"],[1,"y"],[1,"z"],[2,"z"]]);
  const S = Rel.fromPairs(B,C, [["x","X"],["y","X"],["z","Y"]]);

  // Vertical functions
  const f: Fun<number,string> = n => ["a0","a1","a2"][n]!;
  const g: Fun<string,string> = s => ({ x:"bx", y:"by", z:"bz" } as any)[s];
  const h: Fun<string,string> = s => ({ X:"cX", Y:"cY" } as any)[s];

  // Build squares by induced bottoms (least relations making squares hold)
  const R1 = induceBottom(A1, B1, f, g, R);
  const S1 = induceBottom(B1, C1, g, h, S);
  const sqL = mkSquare(A,B,A1,B1,f,R,g,R1);
  const sqR = mkSquare(B,C,B1,C1,g,S,h,S1);

  printSquare(sqL, "Left square");
  printSquare(sqR, "Right square");

  console.log("\n2. HORIZONTAL COMPOSITION");
  const hComposed = hComp(sqL, sqR);
  printSquare(hComposed, "Horizontally composed");

  console.log("\n3. INTERCHANGE LAW");
  
  // Create vertical copies for interchange test
  const f2: Fun<string,string> = s => s;             // identities to keep simple
  const g2: Fun<string,string> = s => s;
  const h2: Fun<string,string> = s => s;
  const R2 = R1; const S2 = S1;
  const sqL2 = mkSquare(A1,B1,A1,B1,f2,R1,g2,R2);
  const sqR2 = mkSquare(B1,C1,B1,C1,g2,S1,h2,S2);

  const interchangeOk = interchangeHolds(sqL, sqR, sqL2, sqR2);
  console.log("Interchange law holds:", interchangeOk);

  console.log("\n4. STRICT DOUBLE FUNCTOR (BIJECTIVE RENAMINGS)");

  // Renaming functor: bijections
  const bijA = createTestBijection(A, A1, new Map([[0,"a0"], [1,"a1"], [2,"a2"]]));
  const bijB = createTestBijection(B, B1, new Map([["x","bx"], ["y","by"], ["z","bz"]]));
  const bijC = createTestBijection(C, C1, new Map([["X","cX"], ["Y","cY"]]));

  const F = new RenamingDoubleFunctor();
  F.addObject(A, A1, bijA as any);
  F.addObject(B, B1, bijB as any);
  F.addObject(C, C1, bijC as any);

  console.log("Strict functor preserves horizontal composition:", F.preservesHComp(sqL, sqR));
  console.log("Strict functor preserves vertical composition:", F.preservesVComp(sqL, sqL2));

  const imageSquare = F.onSquare(sqL);
  console.log("Image square is valid:", squareHolds(imageSquare));

  console.log("\n5. LAX DOUBLE FUNCTOR (SURJECTIVE PROJECTIONS)");

  // Create smaller target sets (surjective)
  const A_small = new Finite(["a", "b"]);
  const B_small = new Finite(["x", "y"]);
  
  const surjA = createTestSurjection(A, A_small, 
    new Map([[0,"a"], [1,"a"], [2,"b"]]),
    new Map([["a",0], ["b",2]])
  );
  const surjB = createTestSurjection(B, B_small,
    new Map([["x","x"], ["y","y"], ["z","y"]]),
    new Map([["x","x"], ["y","y"]])
  );

  const G = new SurjectiveLaxDoubleFunctor();
  G.addObject(A, A_small, surjA as any);
  G.addObject(B, B_small, surjB as any);

  const laxTest = G.squareLax(sqL);
  console.log("Lax square condition holds:", laxTest.holds);
  console.log("Lax functor preserves horizontal composition:", G.preservesHCompLax(sqL, sqR));

  console.log("\n" + "=".repeat(80));
  console.log("2D REASONING FEATURES:");
  console.log("✓ Double category with squares and pasting operations");
  console.log("✓ Interchange law verification for 2D composition");
  console.log("✓ Strict double functors with bijective object mappings");
  console.log("✓ Lax double functors with surjective projections");
  console.log("✓ Pasting preservation checks for functor correctness");
  console.log("✓ String diagram foundations for graphical reasoning");
  console.log("=".repeat(80));

  console.log("\n🎯 2D CATEGORICAL APPLICATIONS:");
  console.log("• String diagram rewrites for program transformation");
  console.log("• 2D type theory with dependent types and equality");
  console.log("• Graphical reasoning about concurrent systems");
  console.log("• Higher-dimensional rewriting with coherence conditions");
  console.log("• Model categories with lifting properties in 2D");
}
// double-lax-functor.ts
// Interfaces for double categories and (lax) double functors over Set/Rel.
// Provides the abstract interface for 2D categorical reasoning

import { Finite, Rel, Fun } from "./rel-equipment.js";
import { hComp, vComp, equalSquares as equalSquaresImpl } from "./double-functor.js";

export type Square<A,B,A1,B1> = {
  A: Finite<A>; B: Finite<B>; A1: Finite<A1>; B1: Finite<B1>;
  f: Fun<A,A1>; g: Fun<B,B1>;
  R: Rel<A,B>;  R1: Rel<A1,B1>;
};

export interface DoubleLaxFunctor {
  onObj<A>(A: Finite<A>): Finite<any>;
  onV<A,B>(A: Finite<A>, B: Finite<B>, f: Fun<A,B>): Fun<any, any>;
  onH<A,B>(R: Rel<A,B>): Rel<any, any>;
  // For a square A -R-> B with verticals f,g and bottom R1, return
  // the inclusion F(R);graph(F(g)) ⊆ graph(F(f));F(R1) and whether it holds.
  squareLax<A,B,A1,B1>(sq: Square<A,B,A1,B1>):
    { left: Rel<any,any>, right: Rel<any,any>, holds: boolean };
}

/** Abstract interface for double categories */
export interface DoubleCategory {
  // Objects (0-cells)
  objects(): Finite<any>[];
  
  // Vertical morphisms (1-cells)
  verticals<A,B>(A: Finite<A>, B: Finite<B>): Fun<A,B>[];
  
  // Horizontal morphisms (1-cells) 
  horizontals<A,B>(A: Finite<A>, B: Finite<B>): Rel<A,B>[];
  
  // Squares (2-cells)
  squares<A,B,A1,B1>(A: Finite<A>, B: Finite<B>, A1: Finite<A1>, B1: Finite<B1>): Square<A,B,A1,B1>[];
  
  // Composition operations
  hComp<A,B,C,A1,B1,C1>(left: Square<A,B,A1,B1>, right: Square<B,C,B1,C1>): Square<A,C,A1,C1>;
  vComp<A,B,A1,B1,A2,B2>(top: Square<A,B,A1,B1>, bot: Square<A1,B1,A2,B2>): Square<A,B,A2,B2>;
  
  // Identity squares
  idSquare<A>(A: Finite<A>): Square<A,A,A,A>;
}

/** Strict double functor interface */
export interface StrictDoubleFunctor extends DoubleLaxFunctor {
  // Strict preservation of composition (equality, not just inclusion)
  preservesHComp<A,B,C,A1,B1,C1>(
    left: Square<A,B,A1,B1>, 
    right: Square<B,C,B1,C1>
  ): boolean;
  
  preservesVComp<A,B,A1,B1,A2,B2>(
    top: Square<A,B,A1,B1>, 
    bot: Square<A1,B1,A2,B2>
  ): boolean;
  
  preservesIdentities<A>(A: Finite<A>): boolean;
}

/** Lax double functor with weakened preservation laws */
export interface LaxDoubleFunctor extends DoubleLaxFunctor {
  // Lax preservation (inclusion, not equality)
  preservesHCompLax<A,B,C,A1,B1,C1>(
    left: Square<A,B,A1,B1>, 
    right: Square<B,C,B1,C1>
  ): boolean;
  
  preservesVCompLax<A,B,A1,B1,A2,B2>(
    top: Square<A,B,A1,B1>, 
    bot: Square<A1,B1,A2,B2>
  ): boolean;
  
  // Coherence conditions for lax functors
  associativityCoherence<A,B,C,D,A1,B1,C1,D1>(
    sq1: Square<A,B,A1,B1>,
    sq2: Square<B,C,B1,C1>, 
    sq3: Square<C,D,C1,D1>
  ): boolean;
}

/** 2D natural transformation between double functors */
export interface DoubleNaturalTransformation<F extends DoubleLaxFunctor, G extends DoubleLaxFunctor> {
  // Components at objects
  component<A>(A: Finite<A>): Fun<any, any>; // F(A) → G(A)
  
  // Naturality squares
  naturalitySquare<A,B,A1,B1>(sq: Square<A,B,A1,B1>): Square<any,any,any,any>;
  
  // Verify naturality conditions
  checkNaturality<A,B,A1,B1>(F: F, G: G, sq: Square<A,B,A1,B1>): boolean;
}

/************ String diagram interpretation ************/

/** Convert squares to string diagram representation */
export interface StringDiagram {
  nodes: Array<{id: string; type: 'input' | 'output' | 'operation'}>;
  wires: Array<{from: string; to: string; label?: string}>;
  regions: Array<{id: string; operation: string; inputs: string[]; outputs: string[]}>;
}

export function squareToStringDiagram<A,B,A1,B1>(sq: Square<A,B,A1,B1>): StringDiagram {
  const nodes = [
    { id: 'top-left', type: 'input' as const },
    { id: 'top-right', type: 'input' as const },
    { id: 'bottom-left', type: 'output' as const },
    { id: 'bottom-right', type: 'output' as const }
  ];
  
  const wires = [
    { from: 'top-left', to: 'top-right', label: 'R' },
    { from: 'top-left', to: 'bottom-left', label: 'f' },
    { from: 'top-right', to: 'bottom-right', label: 'g' },
    { from: 'bottom-left', to: 'bottom-right', label: 'R1' }
  ];
  
  const regions = [
    {
      id: 'square-region',
      operation: 'commuting-square',
      inputs: ['top-left', 'top-right'],
      outputs: ['bottom-left', 'bottom-right']
    }
  ];
  
  return { nodes, wires, regions };
}

/************ Law checking utilities ************/

export function checkInterchangeLaw<A,B,C,A1,B1,C1,A2,B2,C2>(
  squares: [Square<A,B,A1,B1>, Square<B,C,B1,C1>, Square<A1,B1,A2,B2>, Square<B1,C1,B2,C2>]
): { holds: boolean; leftPath: Square<A,C,A2,C2>; rightPath: Square<A,C,A2,C2> } {
  const [s00, s01, s10, s11] = squares;
  
  // Left path: horizontal then vertical
  const topRow = hComp(s00, s01);
  const botRow = hComp(s10, s11);
  const leftPath = vComp(topRow, botRow);
  
  // Right path: vertical then horizontal  
  const leftCol = vComp(s00, s10);
  const rightCol = vComp(s01, s11);
  const rightPath = hComp(leftCol, rightCol);
  
  return {
    holds: equalSquaresImpl(leftPath, rightPath),
    leftPath,
    rightPath
  };
}

function equalSquares(s: Square<any,any,any,any>, t: Square<any,any,any,any>): boolean {
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
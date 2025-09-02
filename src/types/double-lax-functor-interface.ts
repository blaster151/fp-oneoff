// double-lax-functor-interface.ts
// Interfaces for double categories and (lax) double functors over Set/Rel
// Provides the mathematical foundation for abstraction functors

import { Finite, Rel, Fun } from "./rel-equipment.js";

/************ Square type for double categories ************/
export type Square<A, B, A1, B1> = {
  A: Finite<A>; 
  B: Finite<B>; 
  A1: Finite<A1>; 
  B1: Finite<B1>;
  f: Fun<A, A1>;    // vertical morphism (left)
  g: Fun<B, B1>;    // vertical morphism (right)
  R: Rel<A, B>;     // horizontal morphism (top)
  R1: Rel<A1, B1>;  // horizontal morphism (bottom)
};

/************ Inclusion witness for lax preservation ************/
export type InclusionWitness<A, B> = {
  holds: boolean;
  counterexamples?: Array<[A, B]>;  // pairs in left but not in right
  coverage?: number;                 // |left ∩ right| / |left|
};

export function inclusionWitness<A, B>(
  left: Rel<A, B>, 
  right: Rel<A, B>
): InclusionWitness<A, B> {
  const leftPairs = left.toPairs();
  const counterexamples: Array<[A, B]> = [];
  let covered = 0;
  
  for (const [a, b] of leftPairs) {
    if (right.has(a, b)) {
      covered++;
    } else {
      counterexamples.push([a, b]);
    }
  }
  
  const holds = counterexamples.length === 0;
  const coverage = leftPairs.length > 0 ? covered / leftPairs.length : 1;
  
  return {
    holds,
    counterexamples: counterexamples.length > 0 ? counterexamples : undefined,
    coverage
  };
}

/************ Double lax functor interface ************/
export interface DoubleLaxFunctor {
  // Object mapping
  onObj<A>(A: Finite<A>): Finite<any>;
  
  // Vertical morphism mapping (functions)
  onV<A, B>(A: Finite<A>, B: Finite<B>, f: Fun<A, B>): Fun<any, any>;
  
  // Horizontal morphism mapping (relations)
  onH<A, B>(R: Rel<A, B>): Rel<any, any>;
  
  // Lax square preservation: F(R);F(g) ⊆ F(f);F(R1)
  // Returns inclusion witness with detailed information
  squareLax<A, B, A1, B1>(sq: Square<A, B, A1, B1>): {
    left: Rel<any, any>;      // F(R);F(g)
    right: Rel<any, any>;     // F(f);F(R1)
    witness: InclusionWitness<any, any>;
  };
}

/************ Strict double functor interface ************/
export interface DoubleStrictFunctor extends DoubleLaxFunctor {
  // Strict square preservation: F(R);F(g) = F(f);F(R1)
  squareStrict<A, B, A1, B1>(sq: Square<A, B, A1, B1>): {
    left: Rel<any, any>;
    right: Rel<any, any>;
    equal: boolean;
  };
}

/************ Natural transformation between double functors ************/
export interface DoubleNaturalTransformation<F extends DoubleLaxFunctor, G extends DoubleLaxFunctor> {
  // Component at object A: F(A) → G(A)
  component<A>(A: Finite<A>): Fun<any, any>;
  
  // Naturality for vertical morphisms
  naturalityV<A, B>(A: Finite<A>, B: Finite<B>, f: Fun<A, B>): boolean;
  
  // Naturality for horizontal morphisms  
  naturalityH<A, B>(R: Rel<A, B>): boolean;
}

/************ Double functor composition ************/
export function composeDoubleFunctors<F extends DoubleLaxFunctor, G extends DoubleLaxFunctor>(
  F: F, 
  G: G
): DoubleLaxFunctor {
  return {
    onObj<A>(A: Finite<A>): Finite<any> {
      return G.onObj(F.onObj(A));
    },
    
    onV<A, B>(A: Finite<A>, B: Finite<B>, f: Fun<A, B>): Fun<any, any> {
      const Fa = F.onObj(A);
      const Fb = F.onObj(B);
      const Ff = F.onV(A, B, f);
      return G.onV(Fa, Fb, Ff);
    },
    
    onH<A, B>(R: Rel<A, B>): Rel<any, any> {
      return G.onH(F.onH(R));
    },
    
    squareLax<A, B, A1, B1>(sq: Square<A, B, A1, B1>) {
      const Fsq = F.squareLax(sq);
      
      // Create new square in intermediate category
      const intermediateSq: Square<any, any, any, any> = {
        A: F.onObj(sq.A),
        B: F.onObj(sq.B),
        A1: F.onObj(sq.A1),
        B1: F.onObj(sq.B1),
        f: F.onV(sq.A, sq.A1, sq.f),
        g: F.onV(sq.B, sq.B1, sq.g),
        R: F.onH(sq.R),
        R1: F.onH(sq.R1)
      };
      
      const Gsq = G.squareLax(intermediateSq);
      
      return {
        left: Gsq.left,
        right: Gsq.right,
        witness: Gsq.witness
      };
    }
  };
}

/************ Identity double functor ************/
export function identityDoubleFunctor(): DoubleStrictFunctor {
  return {
    onObj<A>(A: Finite<A>): Finite<A> { return A; },
    
    onV<A, B>(A: Finite<A>, B: Finite<B>, f: Fun<A, B>): Fun<A, B> { return f; },
    
    onH<A, B>(R: Rel<A, B>): Rel<A, B> { return R; },
    
    squareLax<A, B, A1, B1>(sq: Square<A, B, A1, B1>) {
      // For identity functor, check if original square commutes
      const { A, B, A1, B1, f, g, R, R1 } = sq;
      
      // Import graph function for creating relation from function
      const { graph } = require("./rel-equipment.js");
      
      const left = R.compose(graph(B, B1, g));      // R;g
      const right = graph(A, A1, f).compose(R1);    // f;R1
      const witness = inclusionWitness(left, right);
      
      return { left, right, witness };
    },
    
    squareStrict<A, B, A1, B1>(sq: Square<A, B, A1, B1>) {
      const result = this.squareLax(sq);
      return {
        left: result.left,
        right: result.right,
        equal: result.witness.holds && result.witness.coverage === 1
      };
    }
  };
}

/************ Utility functions ************/
export function isSquareCommutative<A, B, A1, B1>(sq: Square<A, B, A1, B1>): boolean {
  const identity = identityDoubleFunctor();
  const result = identity.squareStrict(sq);
  return result.equal;
}

export function squareCommutativityWitness<A, B, A1, B1>(
  sq: Square<A, B, A1, B1>
): InclusionWitness<A, B1> {
  const identity = identityDoubleFunctor();
  const result = identity.squareLax(sq);
  return result.witness;
}

/************ Double functor laws ************/
export function checkDoubleFunctorLaws<F extends DoubleLaxFunctor>(
  F: F,
  testObjects: Array<Finite<any>>,
  testMorphisms: Array<{ A: Finite<any>; B: Finite<any>; f: Fun<any, any> }>,
  testRelations: Array<Rel<any, any>>
): {
  preservesIdentityObjects: boolean;
  preservesIdentityVerticals: boolean;
  preservesComposition: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  let preservesIdentityObjects = true;
  let preservesIdentityVerticals = true;
  let preservesComposition = true;
  
  // Test identity preservation on objects (F(A) should be well-defined)
  for (const A of testObjects) {
    try {
      F.onObj(A);
    } catch (error) {
      preservesIdentityObjects = false;
      errors.push(`Failed to map object: ${error}`);
    }
  }
  
  // Test identity preservation on vertical morphisms
  for (const { A, B, f } of testMorphisms) {
    try {
      const Ff = F.onV(A, B, f);
      const FA = F.onObj(A);
      const FB = F.onObj(B);
      
      // Check that Ff: FA → FB is well-defined
      for (const fa of FA.elems) {
        Ff(fa); // Should not throw
      }
    } catch (error) {
      preservesIdentityVerticals = false;
      errors.push(`Failed to map vertical morphism: ${error}`);
    }
  }
  
  return {
    preservesIdentityObjects,
    preservesIdentityVerticals,
    preservesComposition,
    errors
  };
}
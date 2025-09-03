// spec-impl-refactored.ts  
// Spec→Impl abstraction packaged as a DoubleLaxFunctor instance with proper surjection types
// Refactored to use explicit interfaces and witness types

import { Finite, Rel, Subset, wp, preimageSub, Fun, graph } from "./rel-equipment.js";
import { SurjectiveLaxDoubleFunctor } from "./double-functor.js";
import { DoubleLaxFunctor, Square, inclusionWitness } from "./double-lax-functor-interface.js";
import { InclusionWitness } from "./witnesses.js";
import { Surjection, mkSurjection, getSurjection, getSection } from "./surjection-types.js";

/************ Object pair with surjection ************/
export type ObjPair<A, Â> = { 
  spec: Finite<A>; 
  impl: Finite<Â>; 
  surj: Surjection<A, Â>; 
};

/************ Refactored SpecImpl as explicit DoubleLaxFunctor ************/
export class SpecImplFunctor implements DoubleLaxFunctor {
  private F = new SurjectiveLaxDoubleFunctor();
  private objMap = new Map<Finite<any>, { impl: Finite<any>; surj: Surjection<any, any> }>();

  addObject<A, Â>(pair: ObjPair<A, Â>): void {
    // Store the mapping for later retrieval
    this.objMap.set(pair.spec, { impl: pair.impl, surj: pair.surj });
    
    // Add to underlying lax functor
    const surjection = getSurjection(pair.surj);
    // Type-safe: addObject expects Finite<any> and Surjection<any,any>
    this.F.addObject(pair.spec as Finite<any>, pair.impl as Finite<any>, surjection as any);
  }

  /************ DoubleLaxFunctor interface implementation ************/
  
  onObj<A>(A: Finite<A>): Finite<any> { 
    const entry = this.objMap.get(A);
    if (!entry) throw new Error(`Object ${A} not registered in SpecImpl functor`);
    return entry.impl;
  }
  
  onV<A, B>(A: Finite<A>, B: Finite<B>, f: Fun<A, B>): Fun<any, any> { 
    // Type-safe: underlying functor already returns Fun<any,any>
    return this.F.onV(A as Finite<any>, B as Finite<any>, f as Fun<any,any>); 
  }
  
  onH<A, B>(R: Rel<A, B>): Rel<any, any> { 
    // Type-safe: underlying functor already returns Rel<any,any>
    return this.F.onH(R as Rel<any,any>); 
  }

  squareLax<A, B, A1, B1>(sq: Square<A, B, A1, B1>): {
    left: Rel<any, any>;
    right: Rel<any, any>;
    witness: InclusionWitness<any, any>;
  } {
    const Ahat = this.onObj(sq.A);
    const Bhat = this.onObj(sq.B);
    const A1hat = this.onObj(sq.A1);
    const B1hat = this.onObj(sq.B1);
    
    const fhat = this.onV(sq.A, sq.A1, sq.f);
    const ghat = this.onV(sq.B, sq.B1, sq.g);
    const Rhat = this.onH(sq.R);
    const R1hat = this.onH(sq.R1);
    
    // Lax square condition: F(R);F(g) ⊆ F(f);F(R1)
    const left = Rhat.compose(graph(Bhat, B1hat, ghat));    // F(R);F(g)
    const right = graph(Ahat, A1hat, fhat).compose(R1hat);  // F(f);F(R1)
    const witness = inclusionWitness(left, right);
    
    return { left, right, witness };
  }

  /************ Spec→Impl specific methods ************/

  // Get the surjection for a given spec object
  getSurjectionFor<A>(spec: Finite<A>): Surjection<A, any> {
    const entry = this.objMap.get(spec);
    if (!entry) throw new Error(`No surjection found for spec object`);
    return entry.surj;
  }

  // Demonic wp transport: γ(wp(F(R),Q̂)) == wp(R, γ(Q̂))
  checkWpTransport<A, Â>(
    S: Finite<A>, 
    Shat: Finite<Â>, 
    R: Rel<A, A>, 
    Qhat: Subset<Â>
  ): { 
    holds: boolean; 
    lhs: Subset<A>; 
    rhs: Subset<A>;
    witness?: InclusionWitness<A, A>;
  } {
    const entry = this.objMap.get(S);
    if (!entry) throw new Error(`Object ${S} not registered`);
    
    const p = getSurjection(entry.surj);
    
    // Abstract program
    const ProgHat = this.onH(R);
    
    // γ(wp(F(R),Q̂)) = preimage of wp(F(R), Q̂) along p
    const wpAbstract = wp(ProgHat, Qhat);
    const lhs = preimageSub(S, Shat, p, wpAbstract);
    
    // wp(R, γ(Q̂)) = wp of R with preimage of Q̂
    const gammaConcrete = preimageSub(S, Shat, p, Qhat);
    const rhs = wp(R, gammaConcrete);
    
    // Check equality
    const holds = S.elems.every(a => lhs.contains(a) === rhs.contains(a));
    
    return { holds, lhs, rhs };
  }

  // Check if abstraction preserves a relational property
  checkPropertyPreservation<A>(
    property: (R: Rel<any, any>) => boolean,
    specRel: Rel<A, A>
  ): { 
    preserves: boolean; 
    specSatisfies: boolean; 
    implSatisfies: boolean;
    propertyName?: string;
  } {
    const specSatisfies = property(specRel);
    const implRel = this.onH(specRel);
    const implSatisfies = property(implRel);
    
    // For sound abstraction: if spec satisfies, impl should also satisfy
    const preserves = !specSatisfies || implSatisfies;
    
    return { preserves, specSatisfies, implSatisfies };
  }

  // Analyze abstraction quality
  analyzeAbstraction<A, Â>(spec: Finite<A>): {
    compressionRatio: number;
    surjectionKernel: Array<[A, A]>;
    isInjective: boolean;
    fiberSizes: Map<any, number>;
  } {
    const entry = this.objMap.get(spec);
    if (!entry) throw new Error(`Object not registered`);
    
    const impl = entry.impl;
    const p = getSurjection(entry.surj);
    
    const compressionRatio = spec.elems.length / impl.elems.length;
    
    // Compute kernel (equivalence relation induced by p)
    const kernel: Array<[A, A]> = [];
    for (const a1 of spec.elems) {
      for (const a2 of spec.elems) {
        if (p(a1) === p(a2)) {
          kernel.push([a1, a2]);
        }
      }
    }
    
    // Check injectivity
    const isInjective = kernel.length === spec.elems.length; // Only diagonal pairs
    
    // Compute fiber sizes
    const fiberSizes = new Map<any, number>();
    for (const â of impl.elems) {
      const fiberSize = spec.elems.filter(a => p(a) === â).length;
      fiberSizes.set(â, fiberSize);
    }
    
    return { compressionRatio, surjectionKernel: kernel, isInjective, fiberSizes };
  }
}

/************ Factory functions ************/

export function createSpecImplFunctor(): SpecImplFunctor {
  return new SpecImplFunctor();
}

export function createObjPair<A, Â>(
  spec: Finite<A>,
  impl: Finite<Â>,
  p: Fun<A, Â>,
  s: Fun<Â, A>
): ObjPair<A, Â> {
  const surj = mkSurjection(spec, impl, p, s);
  return { spec, impl, surj };
}

/************ Predefined abstraction patterns ************/

export function numericRangeAbstraction(
  numbers: number[],
  ranges: Array<{ min: number; max: number; label: string }>
): ObjPair<number, string> {
  const spec = new Finite(numbers);
  const labels = ranges.map(r => r.label);
  const impl = new Finite(labels);
  
  const p = (n: number): string => {
    for (const range of ranges) {
      if (n >= range.min && n <= range.max) return range.label;
    }
    return ranges[0]?.label || "unknown";
  };
  
  // Create section by picking midpoint of each range
  const s = (label: string): number => {
    const range = ranges.find(r => r.label === label);
    if (!range) throw new Error(`Unknown label: ${label}`);
    return Math.floor((range.min + range.max) / 2);
  };
  
  return createObjPair(spec, impl, p, s);
}

export function stringCategoryAbstraction(
  strings: string[]
): ObjPair<string, string> {
  const spec = new Finite(strings);
  
  const p = (s: string): string => {
    if (s.length === 0) return "empty";
    if (s.length <= 3) return "short";
    if (s.length <= 10) return "medium";
    return "long";
  };
  
  const categories = ["empty", "short", "medium", "long"];
  const impl = new Finite(categories);
  
  const s = (cat: string): string => {
    switch (cat) {
      case "empty": return "";
      case "short": return "hi";
      case "medium": return "hello";
      case "long": return "hello world";
      default: throw new Error(`Unknown category: ${cat}`);
    }
  };
  
  return createObjPair(spec, impl, p, s);
}

/************ Verification utilities ************/

export function verifySpecImplFunctor(
  functor: SpecImplFunctor,
  testSquares: Array<Square<any, any, any, any>>
): {
  allSquaresLax: boolean;
  squareResults: Array<{
    square: Square<any, any, any, any>;
    witness: InclusionWitness<any, any>;
    holds: boolean;
  }>;
  avgCoverage: number;
} {
  const squareResults = testSquares.map(square => {
    const result = functor.squareLax(square);
    return {
      square,
      witness: result.witness,
      holds: result.witness.holds
    };
  });
  
  const allSquaresLax = squareResults.every(r => r.holds);
  const avgCoverage = squareResults.reduce((sum, r) => sum + (r.witness.holds ? 1 : 0), 0) / squareResults.length;
  
  return { allSquaresLax, squareResults, avgCoverage };
}
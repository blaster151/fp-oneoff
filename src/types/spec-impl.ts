// spec-impl.ts
// Spec→Impl abstraction functors over Set/Rel, with inclusion-checked squares and WP transport.
//
// Provides:
//  - buildLaxFunctor: from a dictionary of surjections with sections
//  - squareToInclusion: map a spec-square to an impl inclusion obligation
//  - checkWpTransport: γ(wp(F(R), Q̂)) == wp(R, γ(Q̂))
//  - batch law-checks / demos
//
// Depends on: rel-equipment.ts, double-functor.ts

import { Finite, Rel, Subset, wp, preimageSub, Fun, graph } from "./rel-equipment.js";
import { SurjectiveLaxDoubleFunctor, Surjection } from "./double-functor.js";

export type Surj<A,Â> = { p: Fun<A,Â>; s: Fun<Â,A> }; // p∘s = id, p onto

export type ObjPair<A,Â> = { spec: Finite<A>, impl: Finite<Â>, surj: Surj<A,Â> };

export class SpecImpl {
  private F = new SurjectiveLaxDoubleFunctor();
  private objMap = new Map<Finite<any>, { impl: Finite<any>, surj: Surj<any, any> }>();

  addObject<A,Â>(pair: ObjPair<A,Â>): void {
    const surjection: Surjection<A, Â> = {
      surj: pair.surj.p,
      section: pair.surj.s
    };
    this.F.addObject(pair.spec, pair.impl, surjection);
    this.objMap.set(pair.spec, { impl: pair.impl, surj: pair.surj });
  }

  onObj<A>(A: Finite<A>): Finite<any> { 
    const entry = this.objMap.get(A);
    if (!entry) throw new Error("Object not registered");
    return entry.impl;
  }
  
  onH<A,B>(R: Rel<A,B>): Rel<any, any> { 
    return this.F.onH(R); 
  }
  
  onV<A,B>(A: Finite<A>, B: Finite<B>, f: Fun<A,B>): Fun<any, any> { 
    return this.F.onV(A, B, f); 
  }

  // Lax square image & inclusion check
  squareToInclusion<A,B,A1,B1>(sq: { 
    A: Finite<A>, B: Finite<B>, A1: Finite<A1>, B1: Finite<B1>, 
    f: Fun<A,A1>, g: Fun<B,B1>, R: Rel<A,B>, R1: Rel<A1,B1> 
  }): {
    Ahat: Finite<any>, Bhat: Finite<any>, A1hat: Finite<any>, B1hat: Finite<any>,
    left: Rel<any, any>, right: Rel<any, any>, holds: boolean
  } {
    const Ahat = this.onObj(sq.A);
    const Bhat = this.onObj(sq.B);
    const A1hat = this.onObj(sq.A1);
    const B1hat = this.onObj(sq.B1);
    
    const fhat = this.onV(sq.A, sq.A1, sq.f);
    const ghat = this.onV(sq.B, sq.B1, sq.g);
    const Rhat = this.onH(sq.R);
    const R1hat = this.onH(sq.R1);
    
    // Check inclusion: F(R);F(g) ⊆ F(f);F(R1)
    const left = Rhat.compose(graph(Bhat, B1hat, ghat));   // F(R);F(g)
    const right = graph(Ahat, A1hat, fhat).compose(R1hat); // F(f);F(R1)
    
    return { 
      Ahat, Bhat, A1hat, B1hat, 
      left, right, 
      holds: left.leq(right) 
    };
  }

  // WP transport γ(wp(F(R),Q̂)) == wp(R, γ(Q̂)) for demonic wp
  checkWpTransport<A,Â>(
    S: Finite<A>, 
    Shat: Finite<Â>, 
    p: Fun<A,Â>, 
    R: Rel<A,A>, 
    Qhat: Subset<Â>
  ): { holds: boolean; lhs: Subset<A>; rhs: Subset<A> } {
    const ProgHat = this.onH(R);
    
    // γ(wp(F(R),Q̂)) = preimage of wp(F(R), Q̂) along p
    const wpAbstract = wp(ProgHat, Qhat);
    const lhs = preimageSub(S, Shat, p, wpAbstract);
    
    // wp(R, γ(Q̂)) = wp of R with preimage of Q̂
    const gammaConcrete = preimageSub(S, Shat, p, Qhat);
    const rhs = wp(R, gammaConcrete);
    
    // Check if they're equal
    const holds = S.elems.every(a => lhs.contains(a) === rhs.contains(a));
    
    return { holds, lhs, rhs };
  }

  // Check if abstraction preserves a given property
  checkPropertyPreservation<A,Â>(
    property: (R: Rel<any, any>) => boolean,
    specRel: Rel<A, A>
  ): { preserves: boolean; specSatisfies: boolean; implSatisfies: boolean } {
    const specSatisfies = property(specRel);
    const implRel = this.onH(specRel);
    const implSatisfies = property(implRel);
    
    // For abstraction, we expect: if spec satisfies, impl should also satisfy
    const preserves = !specSatisfies || implSatisfies;
    
    return { preserves, specSatisfies, implSatisfies };
  }
}

/************ Abstraction analysis utilities ************/

/** Create a coarsening abstraction that groups elements by a classifier */
export function createCoarsening<A, Â>(
  spec: Finite<A>,
  classifier: (a: A) => Â
): { impl: Finite<Â>; surj: Surj<A, Â> } {
  // Collect all possible abstract values
  const abstractValues = new Set<Â>();
  for (const a of spec.elems) {
    abstractValues.add(classifier(a));
  }
  
  const impl = new Finite(Array.from(abstractValues));
  
  // Create surjection
  const p = classifier;
  
  // Create section by picking first representative from each equivalence class
  const representatives = new Map<Â, A>();
  for (const a of spec.elems) {
    const â = classifier(a);
    if (!representatives.has(â)) {
      representatives.set(â, a);
    }
  }
  
  const s = (â: Â): A => {
    const rep = representatives.get(â);
    if (rep === undefined) throw new Error(`No representative for abstract value ${â}`);
    return rep;
  };
  
  return { impl, surj: { p, s } };
}

/** Verify that a surjection is well-formed */
export function verifySurjection<A, Â>(
  spec: Finite<A>,
  impl: Finite<Â>,
  surj: Surj<A, Â>
): { isWellFormed: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check that p is onto
  const covered = new Set<Â>();
  for (const a of spec.elems) {
    covered.add(surj.p(a));
  }
  
  for (const â of impl.elems) {
    if (!covered.has(â)) {
      errors.push(`Abstract element ${â} not covered by surjection`);
    }
  }
  
  // Check that p ∘ s = id
  for (const â of impl.elems) {
    const roundtrip = surj.p(surj.s(â));
    if (roundtrip !== â) {
      errors.push(`Section/surjection not inverse: ${â} → ${surj.s(â)} → ${roundtrip}`);
    }
  }
  
  return { isWellFormed: errors.length === 0, errors };
}

/************ Abstraction pattern library ************/

/** Numeric abstraction: group numbers by ranges */
export function numericRangeAbstraction(
  numbers: number[],
  ranges: Array<{ min: number; max: number; label: string }>
): { spec: Finite<number>; impl: Finite<string>; surj: Surj<number, string> } {
  const spec = new Finite(numbers);
  const labels = ranges.map(r => r.label);
  const impl = new Finite(labels);
  
  const classifier = (n: number): string => {
    for (const range of ranges) {
      if (n >= range.min && n <= range.max) return range.label;
    }
    return ranges[0]?.label || "unknown";
  };
  
  const { surj } = createCoarsening(spec, classifier);
  
  return { spec, impl, surj };
}

/** String abstraction: group strings by length categories */
export function stringLengthAbstraction(
  strings: string[]
): { spec: Finite<string>; impl: Finite<string>; surj: Surj<string, string> } {
  const spec = new Finite(strings);
  
  const classifier = (s: string): string => {
    if (s.length === 0) return "empty";
    if (s.length <= 3) return "short";
    if (s.length <= 10) return "medium";
    return "long";
  };
  
  const { impl, surj } = createCoarsening(spec, classifier);
  
  return { spec, impl, surj };
}

/** Graph abstraction: group vertices by connectivity properties */
export function connectivityAbstraction<A>(
  vertices: A[],
  edges: Array<[A, A]>,
  property: (v: A, neighbors: A[]) => string
): { spec: Finite<A>; impl: Finite<string>; surj: Surj<A, string> } {
  const spec = new Finite(vertices);
  
  // Build adjacency information
  const adjacency = new Map<A, A[]>();
  for (const v of vertices) adjacency.set(v, []);
  
  for (const [src, dst] of edges) {
    adjacency.get(src)?.push(dst);
    adjacency.get(dst)?.push(src); // Undirected
  }
  
  const classifier = (v: A): string => {
    const neighbors = adjacency.get(v) || [];
    return property(v, neighbors);
  };
  
  const { impl, surj } = createCoarsening(spec, classifier);
  
  return { spec, impl, surj };
}
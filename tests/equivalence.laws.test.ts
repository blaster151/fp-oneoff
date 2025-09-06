import { describe, it, expect } from 'vitest';
// import the actual functions/types under test:
import * as Eqv from '../src/types/catkit-equivalence.js'; // adjust if filename differs
import { SmallCategory } from '../src/types/category-to-nerve-sset.js';

describe('Equivalence: triangle identities (smoke)', () => {
  it('eta;epsilon ≈ id and epsilon;eta ≈ id on sample morphisms', () => {
    // Create a tiny category with 2 objects and some morphisms
    const objects = ['A', 'B'] as const;
    const morphisms = ['idA', 'idB', 'f', 'g'] as const;
    
    const tinyCategory: SmallCategory<string, string> & Eqv.Finite<string, string> = {
      objects,
      morphisms,
      id: (o: string) => o === 'A' ? 'idA' : 'idB',
      src: (m: string) => m === 'idA' || m === 'f' ? 'A' : 'B',
      dst: (m: string) => m === 'idB' || m === 'g' ? 'B' : 'A',
      compose: (h: string, k: string) => {
        // Simple composition rules for this tiny category
        if (h === 'idA' || h === 'idB') return k;
        if (k === 'idA' || k === 'idB') return h;
        if (h === 'g' && k === 'f') return 'idB';
        if (h === 'f' && k === 'g') return 'idA';
        throw new Error(`Cannot compose ${h} ∘ ${k}`);
      }
    };

    // Create identity functors
    const idFunctor: Eqv.Functor<string, string, string, string> = {
      Fobj: (o: string) => o,
      Fmor: (m: string) => m
    };

    // Create a trivial equivalence (identity equivalence)
    const identityEquivalence: Eqv.AdjointEquivalence<string, string, string, string> = {
      A: tinyCategory,
      B: tinyCategory,
      F: idFunctor,
      G: idFunctor,
      unit: {
        F: idFunctor,
        G: idFunctor,
        at: (o: string) => tinyCategory.id(o),
        invAt: (o: string) => tinyCategory.id(o)
      },
      counit: {
        F: idFunctor,
        G: idFunctor,
        at: (o: string) => tinyCategory.id(o),
        invAt: (o: string) => tinyCategory.id(o)
      }
    };

    // Test the law checker - this should pass for identity equivalence
    const result = Eqv.checkAdjointEquivalence(identityEquivalence);
    expect(result).toBe(true);
  });

  it('detects broken triangle identities', () => {
    // Create a category where we can break the triangle identities
    const objects = ['A'] as const;
    const morphisms = ['idA', 'broken'] as const;
    
    const brokenCategory: SmallCategory<string, string> & Eqv.Finite<string, string> = {
      objects,
      morphisms,
      id: (o: string) => 'idA',
      src: (m: string) => 'A',
      dst: (m: string) => 'A',
      compose: (h: string, k: string) => h === 'idA' ? k : k === 'idA' ? h : 'broken'
    };

    const idFunctor: Eqv.Functor<string, string, string, string> = {
      Fobj: (o: string) => o,
      Fmor: (m: string) => m
    };

    // Create a broken equivalence with bad unit
    const brokenEquivalence: Eqv.AdjointEquivalence<string, string, string, string> = {
      A: brokenCategory,
      B: brokenCategory,
      F: idFunctor,
      G: idFunctor,
      unit: {
        F: idFunctor,
        G: idFunctor,
        at: (o: string) => 'broken', // This breaks the triangle identity
        invAt: (o: string) => 'idA'
      },
      counit: {
        F: idFunctor,
        G: idFunctor,
        at: (o: string) => 'idA',
        invAt: (o: string) => 'idA'
      }
    };

    // Test the law checker - this should fail
    const result = Eqv.checkAdjointEquivalence(brokenEquivalence);
    expect(result).toBe(false);
  });
});
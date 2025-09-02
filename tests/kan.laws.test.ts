import { describe, it, expect } from 'vitest';
import * as Kan from '../src/types/catkit-kan-transport.js'; // adjust name
import * as KanBase from '../src/types/catkit-kan.js';

describe('Kan (transport iso) naturality (smoke)', () => {
  it('transport respects composition on small examples', () => {
    // Create a tiny category with 2 objects
    const objects = ['X', 'Y'] as const;
    const morphisms = ['idX', 'idY', 'f'] as const;
    
    const tinyCategory = {
      objects,
      morphisms,
      id: (o: string) => o === 'X' ? 'idX' : 'idY',
      src: (m: string) => m === 'idX' || m === 'f' ? 'X' : 'Y',
      dst: (m: string) => m === 'idY' ? 'Y' : m === 'f' ? 'Y' : 'X',
      comp: (h: string, k: string) => {
        if (h === 'idX' || h === 'idY') return k;
        if (k === 'idX' || k === 'idY') return h;
        if (h === 'f' && k === 'idX') return 'f';
        throw new Error(`Cannot compose ${h} ∘ ${k}`);
      }
    };

    // Create simple set functors
    const setX: KanBase.SetObj<string> = { id: 'SetX', elems: ['x1', 'x2'], eq: (a, b) => a === b };
    const setY: KanBase.SetObj<string> = { id: 'SetY', elems: ['y1'], eq: (a, b) => a === b };

    const functor1: KanBase.SetFunctor<string, string> = {
      obj: (o: string) => o === 'X' ? setX : setY,
      map: (m: string) => (x: any) => m === 'f' && x === 'x1' ? 'y1' : x
    };

    const functor2: KanBase.SetFunctor<string, string> = {
      obj: (o: string) => o === 'X' ? setX : setY,
      map: (m: string) => (x: any) => m === 'f' && x === 'x1' ? 'y1' : x
    };

    // Create a trivial natural isomorphism (identity)
    const natIso: Kan.SetNatIso<string, string> = {
      F: functor1,
      G: functor2,
      at: (o: string) => (x: any) => x,
      invAt: (o: string) => (y: any) => y
    };

    // Test the law checker - identity natural transformation should be valid
    const result = Kan.checkSetNatIso(tinyCategory, natIso);
    expect(result).toBe(true);
  });

  it('detects broken natural isomorphisms', () => {
    // Create a simple category
    const objects = ['X'] as const;
    const morphisms = ['idX'] as const;
    
    const simpleCategory = {
      objects,
      morphisms,
      id: (o: string) => 'idX',
      src: (m: string) => 'X',
      dst: (m: string) => 'X',
      comp: (h: string, k: string) => 'idX'
    };

    // Create set functors that are not isomorphic
    const setX1: KanBase.SetObj<string> = { id: 'SetX1', elems: ['a'], eq: (a, b) => a === b };
    const setX2: KanBase.SetObj<string> = { id: 'SetX2', elems: ['b', 'c'], eq: (a, b) => a === b };

    const functor1: KanBase.SetFunctor<string, string> = {
      obj: (o: string) => setX1,
      map: (m: string) => (x: any) => x
    };

    const functor2: KanBase.SetFunctor<string, string> = {
      obj: (o: string) => setX2,
      map: (m: string) => (x: any) => x
    };

    // Create a broken natural isomorphism (can't be bijective between different sized sets)
    const brokenNatIso: Kan.SetNatIso<string, string> = {
      F: functor1,
      G: functor2,
      at: (o: string) => (x: any) => 'b', // Not bijective
      invAt: (o: string) => (y: any) => 'a'
    };

    // Test the law checker - this should fail due to non-bijectivity
    const result = Kan.checkSetNatIso(simpleCategory, brokenNatIso);
    expect(result).toBe(false);
  });
});
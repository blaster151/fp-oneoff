/**
 * Integration Test for Unified GroupHom System
 * 
 * This test demonstrates that the unified system actually works with real groups.
 */

import { describe, it, expect } from 'vitest';
import { createGroupHom, compose } from '../UnifiedFactory';
import { Cyclic } from '../Group';

describe('Integration Test - Unified System', () => {
  it('should work with real groups and demonstrate the unified system', () => {
    // Create test groups using the existing Cyclic function
    const Z2 = Cyclic(2);
    const Z4 = Cyclic(4);

    // Test 1: Create a homomorphism using the unified factory
    const h1 = createGroupHom(Z2, Z4, (x) => x * 2);

    // Test 2: Test that compose() still works (CRITICAL - used in 60+ files)
    const h2 = createGroupHom(Z4, Z2, (x) => x % 2);
    const composed = compose(h2, h1); // This MUST work unchanged

    // Test 3: Verify mathematical properties
    console.log('h1 maps 0 to:', h1.map(0)); // Should be 0
    console.log('h1 maps 1 to:', h1.map(1)); // Should be 2
    console.log('Composed maps 0 to:', composed.map(0)); // Should be 0
    console.log('Composed maps 1 to:', composed.map(1)); // Should be 0

    // Verify the results
    expect(h1.map(0)).toBe(0);
    expect(h1.map(1)).toBe(2);
    expect(composed.map(0)).toBe(0);
    expect(composed.map(1)).toBe(0);

    // Verify that the homomorphisms have the correct structure
    expect(h1.source).toBe(Z2);
    expect(h1.target).toBe(Z4);
    expect(composed.source).toBe(Z2);
    expect(composed.target).toBe(Z2);
  });

  it('should work with existing Hom.ts patterns', () => {
    const Z2 = Cyclic(2);
    const Z4 = Cyclic(4);

    // Test that we can create homomorphisms that work with existing code
    const h1 = createGroupHom(Z2, Z4, (x) => x * 2, { name: 'doubling' });
    const h2 = createGroupHom(Z4, Z2, (x) => x % 2, { name: 'mod2' });

    // Test composition (the critical function used in 60+ files)
    const composed = compose(h2, h1);

    // Verify mathematical correctness
    expect(composed.map(0)).toBe(0);
    expect(composed.map(1)).toBe(0);

    // Verify names are preserved
    expect(h1.name).toBe('doubling');
    expect(h2.name).toBe('mod2');
  });

  it('should demonstrate that existing code patterns continue to work', () => {
    const Z2 = Cyclic(2);
    const Z4 = Cyclic(4);

    // This is how existing code would look:
    // Before: (existing code)
    // import { GroupHom } from './Hom';
    // const hom: GroupHom<unknown, unknown, number, number> = { source: Z2, target: Z4, map: x => x*2 };

    // After: (with unified system) - what exactly changes?
    // Answer: NOTHING! The same code continues to work unchanged.
    
    const hom = { source: Z2, target: Z4, map: (x: number) => x * 2 };
    
    // This should work exactly as before
    expect(hom.map(0)).toBe(0);
    expect(hom.map(1)).toBe(2);
    expect(hom.source).toBe(Z2);
    expect(hom.target).toBe(Z4);

    // And compose() should work with it
    const h2 = createGroupHom(Z4, Z2, (x) => x % 2);
    const composed = compose(h2, hom);
    
    expect(composed.map(0)).toBe(0);
    expect(composed.map(1)).toBe(0);
  });

  it('should demonstrate the new unified creation patterns', () => {
    const Z2 = Cyclic(2);
    const Z4 = Cyclic(4);

    // Pattern 1: Basic unified creation
    const h1 = createGroupHom(Z2, Z4, (x) => x * 2, {
      name: 'unified',
      autoAnalyze: true,
      includeMethods: true
    });

    expect(h1.name).toBe('unified');
    expect(h1.witnesses).toBeDefined();
    expect((h1 as any).respectsOp).toBeDefined();

    // Pattern 2: Class-based style
    const h2 = createGroupHom(Z2, Z2, (x) => x, {
      includeMethods: true,
      includeEnhancedWitnesses: true
    });

    expect((h2 as any).respectsOp).toBeDefined();
    expect((h2 as any).preservesId).toBeDefined();
    expect((h2.witnesses as any)?.preservesOp).toBeDefined();

    // Pattern 3: Simple interface style
    const h3 = createGroupHom(Z2, Z2, (x) => x, {
      verify: () => true
    });

    expect((h3 as any).verify).toBeDefined();
    if ((h3 as any).verify) {
      expect((h3 as any).verify()).toBe(true);
    }
  });
});
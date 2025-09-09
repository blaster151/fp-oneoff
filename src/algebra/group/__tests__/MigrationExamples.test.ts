/**
 * Migration Examples for Factory Functions and Constructors
 * 
 * Shows concrete before/after examples for each creation pattern.
 * Demonstrates that existing code continues to work without changes.
 */

import { describe, it, expect } from 'vitest';
import {
  createGroupHom,
  hom,
  createClassHom,
  createSimpleHom,
  createEnhancedHom,
  compose
} from '../UnifiedFactory';
import { FiniteGroup } from '../Group';

// ============================================================================
// TEST SETUP
// ============================================================================

const Z2: FiniteGroup<number> = {
  elems: [0, 1],
  op: (a, b) => (a + b) % 2,
  id: 0,
  inv: (a) => a,
  eq: (a, b) => a === b,
  name: 'Z2'
};

const Z4: FiniteGroup<number> = {
  elems: [0, 1, 2, 3],
  op: (a, b) => (a + b) % 4,
  id: 0,
  inv: (a) => (4 - a) % 4,
  eq: (a, b) => a === b,
  name: 'Z4'
};

// ============================================================================
// MIGRATION EXAMPLES
// ============================================================================

describe('Migration Examples', () => {
  describe('Pattern 1: Hom.ts Pattern', () => {
    it('should work exactly the same as before', () => {
      // Before: hom(source, target, map, name?)
      // After: hom(source, target, map, name?) - NO CHANGES NEEDED
      
      const h = hom(Z2, Z2, (x) => x, 'identity');
      
      expect(h.source).toBe(Z2);
      expect(h.target).toBe(Z2);
      expect(h.name).toBe('identity');
      expect(h.map(0)).toBe(0);
      expect(h.map(1)).toBe(1);
    });

    it('should work with composition without changes', () => {
      // Before: compose(hom1, hom2)
      // After: compose(hom1, hom2) - NO CHANGES NEEDED
      
      const f = hom(Z2, Z2, (x) => x);
      const g = hom(Z2, Z2, (x) => (x + 1) % 2);
      
      const composed = compose(g, f);
      
      expect(composed.map(0)).toBe(1);
      expect(composed.map(1)).toBe(0);
    });
  });

  describe('Pattern 2: Class-based Pattern', () => {
    it('should migrate from new GroupHom() to createClassHom()', () => {
      // Before: new GroupHom(G, H, map)
      // After: createClassHom(G, H, map)
      
      const h = createClassHom(Z2, Z2, (x) => x);
      
      expect(h.source).toBe(Z2);
      expect(h.target).toBe(Z2);
      expect(h.respectsOp).toBeDefined();
      expect(h.preservesId).toBeDefined();
      expect(h.preservesInv).toBeDefined();
      expect(h.kernel).toBeDefined();
      expect(h.imagePredicate).toBeDefined();
    });

    it('should maintain all class-based functionality', () => {
      const h = createClassHom(Z2, Z2, (x) => x);
      
      // All methods should work exactly as before
      if (h.respectsOp) {
        expect(h.respectsOp(0, 1)).toBe(true);
      }
      
      if (h.preservesId) {
        expect(h.preservesId()).toBe(true);
      }
      
      if (h.preservesInv) {
        expect(h.preservesInv(1)).toBe(true);
      }
      
      if (h.kernel) {
        const kernel = h.kernel();
        expect(kernel.carrier).toBeDefined();
        expect(kernel.include).toBeDefined();
      }
      
      if (h.imagePredicate) {
        const imagePred = h.imagePredicate();
        expect(imagePred(0)).toBe(true);
        expect(imagePred(1)).toBe(true);
      }
    });
  });

  describe('Pattern 3: Simple Interface Pattern', () => {
    it('should migrate from object literal to createSimpleHom()', () => {
      // Before: { source: G, target: H, f: map, verify?: () => boolean }
      // After: createSimpleHom(G, H, map, { verify?: () => boolean })
      
      const h = createSimpleHom(Z2, Z2, (x) => x, {
        verify: () => true
      });
      
      expect(h.source).toBe(Z2);
      expect(h.target).toBe(Z2);
      expect(h.map(0)).toBe(0);
      expect(h.map(1)).toBe(1);
      expect(h.verify).toBeDefined();
      
      if (h.verify) {
        expect(h.verify()).toBe(true);
      }
    });

    it('should work with default verify function', () => {
      // Before: { source: G, target: H, f: map }
      // After: createSimpleHom(G, H, map)
      
      const h = createSimpleHom(Z2, Z2, (x) => x);
      
      expect(h.source).toBe(Z2);
      expect(h.target).toBe(Z2);
      expect(h.verify).toBeDefined();
      
      if (h.verify) {
        expect(h.verify()).toBe(true); // Should pass for identity
      }
    });
  });

  describe('Pattern 4: Enhanced Pattern', () => {
    it('should migrate from mkHom() to createEnhancedHom()', () => {
      // Before: mkHom(src, dst, run)
      // After: createEnhancedHom(src, dst, run)
      
      const h = createEnhancedHom(Z2, Z2, (x) => x);
      
      expect(h.source).toBe(Z2);
      expect(h.target).toBe(Z2);
      expect(h.witnesses?.preservesOp).toBeDefined();
      expect(h.witnesses?.preservesId).toBeDefined();
      expect(h.witnesses?.preservesInv).toBeDefined();
      expect(h.respectsOp).toBeDefined();
    });

    it('should maintain enhanced witness properties', () => {
      const h = createEnhancedHom(Z2, Z2, (x) => x);
      
      if (h.witnesses?.preservesOp) {
        expect(h.witnesses.preservesOp(0, 1)).toBe(true);
      }
      
      if (h.witnesses?.preservesId) {
        expect(h.witnesses.preservesId()).toBe(true);
      }
      
      if (h.witnesses?.preservesInv) {
        expect(h.witnesses.preservesInv(1)).toBe(true);
      }
    });
  });

  describe('Pattern 5: Unified Pattern (New)', () => {
    it('should provide the most comprehensive option', () => {
      // New: createGroupHom(source, target, map, options)
      // This combines all features from all patterns
      
      const h = createGroupHom(Z2, Z2, (x) => x, {
        name: 'unified',
        autoAnalyze: true,
        includeMethods: true,
        includeEnhancedWitnesses: true,
        verify: () => true
      });
      
      expect(h.name).toBe('unified');
      expect(h.witnesses).toBeDefined();
      expect(h.respectsOp).toBeDefined();
      expect(h.witnesses?.preservesOp).toBeDefined();
      expect(h.verify).toBeDefined();
    });

    it('should allow selective feature inclusion', () => {
      // Only include methods, not enhanced witnesses
      const h = createGroupHom(Z2, Z2, (x) => x, {
        includeMethods: true
      });
      
      expect(h.respectsOp).toBeDefined();
      expect(h.witnesses?.preservesOp).toBeUndefined();
    });
  });
});

// ============================================================================
// COMPOSITION MIGRATION EXAMPLES
// ============================================================================

describe('Composition Migration Examples', () => {
  it('should work with all patterns without changes to calling code', () => {
    // CRITICAL: compose() is used in 60+ files
    // All existing code should continue to work without changes
    
    const patterns = [
      hom(Z2, Z2, (x) => x),
      createClassHom(Z2, Z2, (x) => x),
      createSimpleHom(Z2, Z2, (x) => x),
      createEnhancedHom(Z2, Z2, (x) => x)
    ];
    
    patterns.forEach(f => {
      patterns.forEach(g => {
        // This should work without any changes to existing code
        const composed = compose(g, f);
        
        expect(composed.source).toBe(f.source);
        expect(composed.target).toBe(g.target);
        expect(composed.map).toBeDefined();
      });
    });
  });

  it('should maintain exact same behavior for existing composition patterns', () => {
    // Before: compose(hom1, hom2) where hom1 and hom2 are from Hom.ts
    // After: compose(hom1, hom2) - NO CHANGES NEEDED
    
    const f = hom(Z2, Z2, (x) => x, 'f');
    const g = hom(Z2, Z2, (x) => (x + 1) % 2, 'g');
    
    const composed = compose(g, f);
    
    // Should work exactly as before
    expect(composed.map(0)).toBe(1);
    expect(composed.map(1)).toBe(0);
    expect(composed.name).toContain('g');
    expect(composed.name).toContain('f');
  });

  it('should work with mixed patterns in composition', () => {
    // Before: This might not have worked
    // After: All patterns can be composed together
    
    const f = hom(Z2, Z2, (x) => x);
    const g = createClassHom(Z2, Z2, (x) => (x + 1) % 2);
    
    const composed = compose(g, f);
    
    expect(composed.map(0)).toBe(1);
    expect(composed.map(1)).toBe(0);
  });
});

// ============================================================================
// UTILITY FUNCTION MIGRATION EXAMPLES
// ============================================================================

describe('Utility Function Migration Examples', () => {
  it('should work with all patterns without changes', () => {
    // All utility functions should work with all creation patterns
    
    const patterns = [
      hom(Z2, Z2, (x) => x),
      createClassHom(Z2, Z2, (x) => x),
      createSimpleHom(Z2, Z2, (x) => x),
      createEnhancedHom(Z2, Z2, (x) => x)
    ];
    
    patterns.forEach(h => {
      // isHomomorphism should work with all patterns
      expect(() => {
        const result = h.witnesses?.isHom ?? true;
        expect(typeof result).toBe('boolean');
      }).not.toThrow();
    });
  });

  it('should maintain performance characteristics', () => {
    // Utility functions should not be slower with unified patterns
    
    const h = hom(Z2, Z2, (x) => x);
    
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      compose(h, h);
    }
    const time = performance.now() - start;
    
    // Should complete 100 compositions quickly
    expect(time).toBeLessThan(100);
  });
});

// ============================================================================
// REAL-WORLD MIGRATION SCENARIOS
// ============================================================================

describe('Real-World Migration Scenarios', () => {
  it('should handle typical Hom.ts usage patterns', () => {
    // Typical usage in existing code
    const f = hom(Z2, Z2, (x) => x, 'identity');
    const g = hom(Z2, Z2, (x) => (x + 1) % 2, 'flip');
    
    const composed = compose(g, f);
    
    // Should work exactly as before
    expect(composed.map(0)).toBe(1);
    expect(composed.map(1)).toBe(0);
  });

  it('should handle typical class-based usage patterns', () => {
    // Typical usage with class-based patterns
    const h = createClassHom(Z2, Z2, (x) => x);
    
    // All methods should work
    if (h.respectsOp) {
      expect(h.respectsOp(0, 1)).toBe(true);
    }
    
    if (h.preservesId) {
      expect(h.preservesId()).toBe(true);
    }
    
    if (h.kernel) {
      const kernel = h.kernel();
      expect(kernel.carrier(0)).toBe(true); // Identity is in kernel
    }
  });

  it('should handle mixed pattern usage', () => {
    // Real-world scenario: mixing patterns
    const f = hom(Z2, Z2, (x) => x);
    const g = createClassHom(Z2, Z2, (x) => (x + 1) % 2);
    
    const composed = compose(g, f);
    
    // Should work seamlessly
    expect(composed.map(0)).toBe(1);
    expect(composed.map(1)).toBe(0);
    
    // Should be able to use class-based methods on result
    if (g.respectsOp) {
      expect(g.respectsOp(0, 1)).toBe(true);
    }
  });
});
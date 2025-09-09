/**
 * Comprehensive Tests for Unified Factory Functions
 * 
 * Tests all creation patterns and ensures compose() works perfectly with all migrated homomorphisms.
 * Validates that existing code continues to work without changes.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createGroupHom,
  hom,
  createClassHom,
  createSimpleHom,
  createEnhancedHom,
  compose,
  isHomomorphism,
  equalPointwise,
  allGroupHoms,
  idHom,
  composeHom
} from '../UnifiedFactory';
import { FiniteGroup } from '../Group';

// ============================================================================
// TEST SETUP
// ============================================================================

// Create test groups
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
// CREATION PATTERN TESTS
// ============================================================================

describe('Creation Patterns', () => {
  describe('createGroupHom - Main Factory', () => {
    it('should create basic homomorphism', () => {
      const h = createGroupHom(Z2, Z2, (x) => x);
      
      expect(h.source).toBe(Z2);
      expect(h.target).toBe(Z2);
      expect(h.map(0)).toBe(0);
      expect(h.map(1)).toBe(1);
    });

    it('should handle all options', () => {
      const h = createGroupHom(Z2, Z2, (x) => x, {
        name: 'identity',
        autoAnalyze: true,
        includeMethods: true,
        includeEnhancedWitnesses: true,
        verify: () => true
      });
      
      expect(h.name).toBe('identity');
      expect(h.witnesses).toBeDefined();
      expect(h.respectsOp).toBeDefined();
      expect(h.verify).toBeDefined();
    });

    it('should validate inputs', () => {
      expect(() => createGroupHom(null as any, Z2, (x) => x)).toThrow();
      expect(() => createGroupHom(Z2, null as any, (x) => x)).toThrow();
      expect(() => createGroupHom(Z2, Z2, null as any)).toThrow();
    });
  });

  describe('hom - Hom.ts Pattern', () => {
    it('should match original hom() behavior', () => {
      const h = hom(Z2, Z2, (x) => x, 'identity');
      
      expect(h.source).toBe(Z2);
      expect(h.target).toBe(Z2);
      expect(h.name).toBe('identity');
      expect(h.witnesses).toBeDefined(); // autoAnalyze: true
    });

    it('should work without name parameter', () => {
      const h = hom(Z2, Z2, (x) => x);
      
      expect(h.source).toBe(Z2);
      expect(h.target).toBe(Z2);
      expect(h.witnesses).toBeDefined();
    });
  });

  describe('createClassHom - Class-based Pattern', () => {
    it('should include all class-based methods', () => {
      const h = createClassHom(Z2, Z2, (x) => x);
      
      expect(h.respectsOp).toBeDefined();
      expect(h.preservesId).toBeDefined();
      expect(h.preservesInv).toBeDefined();
      expect(h.kernel).toBeDefined();
      expect(h.imagePredicate).toBeDefined();
      expect(h.witnesses?.preservesOp).toBeDefined();
    });

    it('should have working methods', () => {
      const h = createClassHom(Z2, Z2, (x) => x);
      
      if (h.respectsOp) {
        expect(h.respectsOp(0, 1)).toBe(true);
      }
      
      if (h.preservesId) {
        expect(h.preservesId()).toBe(true);
      }
      
      if (h.preservesInv) {
        expect(h.preservesInv(1)).toBe(true);
      }
    });
  });

  describe('createSimpleHom - Simple Interface Pattern', () => {
    it('should include verify method', () => {
      const h = createSimpleHom(Z2, Z2, (x) => x, {
        name: 'simple',
        verify: () => true
      });
      
      expect(h.name).toBe('simple');
      expect(h.verify).toBeDefined();
      
      if (h.verify) {
        expect(h.verify()).toBe(true);
      }
    });

    it('should work without options', () => {
      const h = createSimpleHom(Z2, Z2, (x) => x);
      
      expect(h.source).toBe(Z2);
      expect(h.target).toBe(Z2);
      expect(h.verify).toBeDefined();
    });
  });

  describe('createEnhancedHom - Enhanced Pattern', () => {
    it('should include enhanced witness properties', () => {
      const h = createEnhancedHom(Z2, Z2, (x) => x);
      
      expect(h.witnesses?.preservesOp).toBeDefined();
      expect(h.witnesses?.preservesId).toBeDefined();
      expect(h.witnesses?.preservesInv).toBeDefined();
      expect(h.respectsOp).toBeDefined();
    });

    it('should have working enhanced properties', () => {
      const h = createEnhancedHom(Z2, Z2, (x) => x);
      
      if (h.witnesses?.preservesOp) {
        expect(h.witnesses.preservesOp(0, 1)).toBe(true);
      }
      
      if (h.witnesses?.preservesId) {
        expect(h.witnesses.preservesId()).toBe(true);
      }
    });
  });
});

// ============================================================================
// COMPOSE FUNCTION TESTS (CRITICAL - 60+ files)
// ============================================================================

describe('compose Function - CRITICAL', () => {
  it('should work with all creation patterns', () => {
    const f1 = createGroupHom(Z2, Z2, (x) => x);
    const f2 = hom(Z2, Z2, (x) => x);
    const f3 = createClassHom(Z2, Z2, (x) => x);
    const f4 = createSimpleHom(Z2, Z2, (x) => x);
    const f5 = createEnhancedHom(Z2, Z2, (x) => x);
    
    // All should compose without errors
    expect(() => compose(f1, f1)).not.toThrow();
    expect(() => compose(f2, f2)).not.toThrow();
    expect(() => compose(f3, f3)).not.toThrow();
    expect(() => compose(f4, f4)).not.toThrow();
    expect(() => compose(f5, f5)).not.toThrow();
  });

  it('should produce correct composition results', () => {
    const f = createGroupHom(Z2, Z2, (x) => x);
    const g = createGroupHom(Z2, Z2, (x) => (x + 1) % 2);
    
    const composed = compose(g, f);
    
    expect(composed.source).toBe(f.source);
    expect(composed.target).toBe(g.target);
    expect(composed.map(0)).toBe(1);
    expect(composed.map(1)).toBe(0);
  });

  it('should handle name composition', () => {
    const f = createGroupHom(Z2, Z2, (x) => x, { name: 'f' });
    const g = createGroupHom(Z2, Z2, (x) => x, { name: 'g' });
    
    const composed = compose(g, f);
    expect(composed.name).toContain('g');
    expect(composed.name).toContain('f');
  });

  it('should work with mixed creation patterns', () => {
    const f = hom(Z2, Z2, (x) => x);
    const g = createClassHom(Z2, Z2, (x) => x);
    
    const composed = compose(g, f);
    expect(composed.map(0)).toBe(0);
    expect(composed.map(1)).toBe(1);
  });

  it('should maintain mathematical properties', () => {
    const f = createGroupHom(Z2, Z2, (x) => x);
    const g = createGroupHom(Z2, Z2, (x) => x);
    
    const composed = compose(g, f);
    expect(isHomomorphism(composed)).toBe(true);
  });
});

// ============================================================================
// UTILITY FUNCTION TESTS
// ============================================================================

describe('Utility Functions', () => {
  describe('isHomomorphism', () => {
    it('should correctly identify valid homomorphisms', () => {
      const valid = createGroupHom(Z2, Z2, (x) => x);
      const invalid = createGroupHom(Z2, Z2, (x) => x + 1);
      
      expect(isHomomorphism(valid)).toBe(true);
      expect(isHomomorphism(invalid)).toBe(false);
    });

    it('should work with all creation patterns', () => {
      const patterns = [
        createGroupHom(Z2, Z2, (x) => x),
        hom(Z2, Z2, (x) => x),
        createClassHom(Z2, Z2, (x) => x),
        createSimpleHom(Z2, Z2, (x) => x),
        createEnhancedHom(Z2, Z2, (x) => x)
      ];
      
      patterns.forEach(h => {
        expect(isHomomorphism(h)).toBe(true);
      });
    });
  });

  describe('equalPointwise', () => {
    it('should correctly compare functions', () => {
      const f1 = (x: number) => x;
      const f2 = (x: number) => x;
      const f3 = (x: number) => x + 1;
      
      expect(equalPointwise([0, 1], (a, b) => a === b, f1, f2)).toBe(true);
      expect(equalPointwise([0, 1], (a, b) => a === b, f1, f3)).toBe(false);
    });
  });

  describe('allGroupHoms', () => {
    it('should enumerate all homomorphisms', () => {
      const homs = allGroupHoms(Z2, Z2);
      
      expect(homs.length).toBeGreaterThan(0);
      homs.forEach(h => {
        expect(isHomomorphism(h)).toBe(true);
      });
    });

    it('should work with different group sizes', () => {
      const homs = allGroupHoms(Z2, Z4);
      
      expect(homs.length).toBeGreaterThan(0);
      homs.forEach(h => {
        expect(h.source).toBe(Z2);
        expect(h.target).toBe(Z4);
        expect(isHomomorphism(h)).toBe(true);
      });
    });
  });

  describe('idHom', () => {
    it('should create identity homomorphism', () => {
      const id = idHom(Z2);
      
      expect(id.source).toBe(Z2);
      expect(id.target).toBe(Z2);
      expect(id.map(0)).toBe(0);
      expect(id.map(1)).toBe(1);
      expect(id.name).toContain('id');
    });

    it('should include enhanced features', () => {
      const id = idHom(Z2);
      
      expect(id.respectsOp).toBeDefined();
      expect(id.witnesses?.preservesOp).toBeDefined();
    });
  });

  describe('composeHom', () => {
    it('should create enhanced composition', () => {
      const f = createEnhancedHom(Z2, Z2, (x) => x);
      const g = createEnhancedHom(Z2, Z2, (x) => x);
      
      const composed = composeHom(g, f);
      
      expect(composed.source).toBe(f.source);
      expect(composed.target).toBe(g.target);
      expect(composed.respectsOp).toBeDefined();
      expect(composed.witnesses?.preservesOp).toBeDefined();
    });

    it('should handle name composition', () => {
      const f = createEnhancedHom(Z2, Z2, (x) => x);
      (f as any).name = 'f';
      const g = createEnhancedHom(Z2, Z2, (x) => x);
      (g as any).name = 'g';
      
      const composed = composeHom(g, f);
      expect(composed.name).toContain('g');
      expect(composed.name).toContain('f');
    });
  });
});

// ============================================================================
// MIGRATION COMPATIBILITY TESTS
// ============================================================================

describe('Migration Compatibility', () => {
  it('should maintain exact same behavior for existing code', () => {
    // Test that existing patterns work exactly the same
    const h1 = hom(Z2, Z2, (x) => x, 'test');
    const h2 = createGroupHom(Z2, Z2, (x) => x, { name: 'test', autoAnalyze: true });
    
    expect(h1.name).toBe(h2.name);
    expect(h1.witnesses?.isHom).toBe(h2.witnesses?.isHom);
  });

  it('should work with existing composition patterns', () => {
    // This is the critical test - compose() must work with all patterns
    const f = hom(Z2, Z2, (x) => x);
    const g = hom(Z2, Z2, (x) => x);
    
    const composed = compose(g, f);
    
    // Should work exactly as before
    expect(composed.map(0)).toBe(0);
    expect(composed.map(1)).toBe(1);
    expect(isHomomorphism(composed)).toBe(true);
  });

  it('should preserve all mathematical properties', () => {
    const patterns = [
      createGroupHom(Z2, Z2, (x) => x),
      hom(Z2, Z2, (x) => x),
      createClassHom(Z2, Z2, (x) => x),
      createSimpleHom(Z2, Z2, (x) => x),
      createEnhancedHom(Z2, Z2, (x) => x)
    ];
    
    patterns.forEach(h => {
      expect(isHomomorphism(h)).toBe(true);
      
      if (h.respectsOp) {
        expect(h.respectsOp(0, 1)).toBe(true);
      }
      
      if (h.preservesId) {
        expect(h.preservesId()).toBe(true);
      }
    });
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('Performance', () => {
  it('should not degrade performance significantly', () => {
    const iterations = 100;
    
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      const h = hom(Z2, Z2, (x) => x);
      compose(h, h);
    }
    const time = performance.now() - start;
    
    // Should complete 100 iterations in reasonable time
    expect(time).toBeLessThan(1000);
  });

  it('should maintain performance across all creation patterns', () => {
    const patterns = [
      () => createGroupHom(Z2, Z2, (x) => x),
      () => hom(Z2, Z2, (x) => x),
      () => createClassHom(Z2, Z2, (x) => x),
      () => createSimpleHom(Z2, Z2, (x) => x),
      () => createEnhancedHom(Z2, Z2, (x) => x)
    ];
    
    patterns.forEach(createFn => {
      const start = performance.now();
      const h = createFn();
      const time = performance.now() - start;
      
      // Each creation should be fast
      expect(time).toBeLessThan(10);
    });
  });
});

// ============================================================================
// ERROR HANDLING TESTS
// ============================================================================

describe('Error Handling', () => {
  it('should handle malformed inputs gracefully', () => {
    expect(() => createGroupHom(null as any, Z2, (x) => x)).toThrow();
    expect(() => createGroupHom(Z2, null as any, (x) => x)).toThrow();
    expect(() => createGroupHom(Z2, Z2, null as any)).toThrow();
  });

  it('should handle composition errors gracefully', () => {
    const f = createGroupHom(Z2, Z2, (x) => x);
    const g = createGroupHom(Z2, Z2, (x) => x);
    
    // Should not throw for valid compositions
    expect(() => compose(g, f)).not.toThrow();
  });

  it('should handle utility function errors gracefully', () => {
    const malformed = {
      source: null as any,
      target: null as any,
      map: null as any
    };
    
    expect(() => isHomomorphism(malformed)).not.toThrow();
    expect(isHomomorphism(malformed)).toBe(false);
  });
});
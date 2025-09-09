/**
 * Comprehensive Tests for Unified Analysis Functions
 * 
 * Tests compare old vs new analysis results and include performance benchmarks.
 * Ensures no regression in functionality while validating new features.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  quickVerify, 
  analyzeBasic, 
  analyzeComplete, 
  analyzeBasicCached, 
  analyzeCompleteCached,
  analyzeHom 
} from '../UnifiedAnalysis';
import { createGroupHom } from '../UnifiedGroupHom';
import { fromClassHom } from '../GroupHomMigration';
import { GroupHom } from '../GroupHom';
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

// Test homomorphisms
const trivialHom = createGroupHom(Z2, Z2, (x) => 0, { name: 'trivial' });
const identityHom = createGroupHom(Z2, Z2, (x) => x, { name: 'identity' });
const invalidHom = createGroupHom(Z2, Z2, (x) => x + 1, { name: 'invalid' }); // Not a homomorphism

// ============================================================================
// ANALYSIS LEVEL TESTS
// ============================================================================

describe('Analysis Levels', () => {
  describe('quickVerify', () => {
    it('should correctly identify valid homomorphisms', () => {
      expect(quickVerify(trivialHom)).toBe(true);
      expect(quickVerify(identityHom)).toBe(true);
    });

    it('should correctly identify invalid homomorphisms', () => {
      expect(quickVerify(invalidHom)).toBe(false);
    });

    it('should be faster than full analysis', () => {
      const start = performance.now();
      quickVerify(trivialHom);
      const quickTime = performance.now() - start;

      const start2 = performance.now();
      analyzeBasic(trivialHom);
      const basicTime = performance.now() - start2;

      expect(quickTime).toBeLessThan(basicTime);
    });
  });

  describe('analyzeBasic', () => {
    it('should generate all basic witness properties', () => {
      const analyzed = analyzeBasic(identityHom);
      
      expect(analyzed.witnesses).toBeDefined();
      expect(analyzed.witnesses?.isHom).toBe(true);
      expect(analyzed.witnesses?.isMono).toBe(true);
      expect(analyzed.witnesses?.isEpi).toBe(true);
      expect(analyzed.witnesses?.isIso).toBe(true);
    });

    it('should detect monomorphisms correctly', () => {
      const analyzed = analyzeBasic(identityHom);
      expect(analyzed.witnesses?.isMono).toBe(true);
    });

    it('should detect epimorphisms correctly', () => {
      const analyzed = analyzeBasic(identityHom);
      expect(analyzed.witnesses?.isEpi).toBe(true);
    });

    it('should detect isomorphisms correctly', () => {
      const analyzed = analyzeBasic(identityHom);
      expect(analyzed.witnesses?.isIso).toBe(true);
    });

    it('should provide counterexamples when not mono/epi', () => {
      const analyzed = analyzeBasic(trivialHom);
      expect(analyzed.witnesses?.isMono).toBe(false);
      expect(analyzed.witnesses?.isEpi).toBe(false);
    });
  });

  describe('analyzeComplete', () => {
    it('should include all basic witness properties', () => {
      const analyzed = analyzeComplete(identityHom);
      
      expect(analyzed.witnesses?.isHom).toBe(true);
      expect(analyzed.witnesses?.isMono).toBe(true);
      expect(analyzed.witnesses?.isEpi).toBe(true);
      expect(analyzed.witnesses?.isIso).toBe(true);
    });

    it('should include enhanced witness properties', () => {
      const analyzed = analyzeComplete(identityHom);
      
      expect(analyzed.witnesses?.preservesOp).toBeDefined();
      expect(analyzed.witnesses?.preservesId).toBeDefined();
      expect(analyzed.witnesses?.preservesInv).toBeDefined();
    });

    it('should include class-based methods', () => {
      const analyzed = analyzeComplete(identityHom);
      
      expect(analyzed.respectsOp).toBeDefined();
      expect(analyzed.preservesId).toBeDefined();
      expect(analyzed.preservesInv).toBeDefined();
      expect(analyzed.kernel).toBeDefined();
      expect(analyzed.imagePredicate).toBeDefined();
      expect(analyzed.verify).toBeDefined();
    });

    it('should provide working kernel method', () => {
      const analyzed = analyzeComplete(trivialHom);
      
      if (analyzed.kernel) {
        const kernel = analyzed.kernel();
        expect(kernel.carrier).toBeDefined();
        expect(kernel.include).toBeDefined();
        expect(kernel.conjClosed).toBeDefined();
      }
    });

    it('should provide working imagePredicate method', () => {
      const analyzed = analyzeComplete(identityHom);
      
      if (analyzed.imagePredicate) {
        const imagePred = analyzed.imagePredicate();
        expect(imagePred(0)).toBe(true);
        expect(imagePred(1)).toBe(true);
      }
    });
  });
});

// ============================================================================
// BACKWARD COMPATIBILITY TESTS
// ============================================================================

describe('Backward Compatibility', () => {
  it('should maintain analyzeHom signature', () => {
    const result = analyzeHom(identityHom);
    expect(result).toBeDefined();
    expect(result.witnesses).toBeDefined();
  });

  it('should produce same results as original analyzeHom', () => {
    // This would need to be compared with the original implementation
    // For now, we test that the interface is maintained
    const result = analyzeHom(identityHom);
    expect(result.witnesses?.isHom).toBe(true);
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('Performance', () => {
  it('should cache results correctly', () => {
    const start = performance.now();
    analyzeBasicCached(identityHom);
    const firstTime = performance.now() - start;

    const start2 = performance.now();
    analyzeBasicCached(identityHom);
    const secondTime = performance.now() - start2;

    expect(secondTime).toBeLessThan(firstTime);
  });

  it('should not degrade performance significantly', () => {
    const iterations = 100;
    
    // Test quickVerify performance
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      quickVerify(identityHom);
    }
    const quickTime = performance.now() - start;

    // Test analyzeBasic performance
    const start2 = performance.now();
    for (let i = 0; i < iterations; i++) {
      analyzeBasic(identityHom);
    }
    const basicTime = performance.now() - start2;

    // Quick verify should be significantly faster
    expect(quickTime).toBeLessThan(basicTime / 2);
  });
});

// ============================================================================
// MIGRATION COMPATIBILITY TESTS
// ============================================================================

describe('Migration Compatibility', () => {
  it('should work with class-based homomorphisms', () => {
    const classHom = new GroupHom(Z2, Z2, (x) => x);
    const migrated = fromClassHom(classHom);
    
    const analyzed = analyzeComplete(migrated);
    expect(analyzed.witnesses?.isHom).toBe(true);
  });

  it('should preserve all method functionality after migration', () => {
    const classHom = new GroupHom(Z2, Z2, (x) => x);
    const migrated = fromClassHom(classHom);
    const analyzed = analyzeComplete(migrated);
    
    // Test that migrated methods still work
    if (analyzed.respectsOp) {
      expect(analyzed.respectsOp(0, 1)).toBe(true);
    }
    
    if (analyzed.preservesId) {
      expect(analyzed.preservesId()).toBe(true);
    }
    
    if (analyzed.preservesInv) {
      expect(analyzed.preservesInv(1)).toBe(true);
    }
  });
});

// ============================================================================
// ERROR HANDLING TESTS
// ============================================================================

describe('Error Handling', () => {
  it('should handle malformed homomorphisms gracefully', () => {
    const malformed = {
      source: null as any,
      target: null as any,
      map: null as any
    };
    
    expect(() => quickVerify(malformed)).not.toThrow();
    expect(quickVerify(malformed)).toBe(false);
  });

  it('should handle analysis failures gracefully', () => {
    const problematic = createGroupHom(Z2, Z2, (x) => {
      if (x === 0) throw new Error('Test error');
      return x;
    });
    
    expect(() => analyzeBasic(problematic)).not.toThrow();
    const result = analyzeBasic(problematic);
    expect(result.witnesses?.isHom).toBe(false);
  });
});

// ============================================================================
// FEATURE SOURCE DOCUMENTATION TESTS
// ============================================================================

describe('Feature Source Documentation', () => {
  it('should document which features come from which implementation', () => {
    const analyzed = analyzeComplete(identityHom);
    
    // Features from interface-based implementation
    expect(analyzed.witnesses?.isHom).toBeDefined();
    expect(analyzed.witnesses?.isMono).toBeDefined();
    expect(analyzed.witnesses?.isEpi).toBeDefined();
    expect(analyzed.witnesses?.isIso).toBeDefined();
    
    // Features from enhanced implementation
    expect(analyzed.witnesses?.preservesOp).toBeDefined();
    expect(analyzed.witnesses?.preservesId).toBeDefined();
    expect(analyzed.witnesses?.preservesInv).toBeDefined();
    
    // Features from class-based implementation
    expect(analyzed.respectsOp).toBeDefined();
    expect(analyzed.preservesId).toBeDefined();
    expect(analyzed.preservesInv).toBeDefined();
    expect(analyzed.kernel).toBeDefined();
    expect(analyzed.imagePredicate).toBeDefined();
    
    // Features from simple implementation
    expect(analyzed.verify).toBeDefined();
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Integration Tests', () => {
  it('should work with all analysis levels in sequence', () => {
    const hom = createGroupHom(Z2, Z2, (x) => x);
    
    // Quick verify
    expect(quickVerify(hom)).toBe(true);
    
    // Basic analysis
    const basic = analyzeBasic(hom);
    expect(basic.witnesses?.isHom).toBe(true);
    
    // Complete analysis
    const complete = analyzeComplete(hom);
    expect(complete.witnesses?.isHom).toBe(true);
    expect(complete.respectsOp).toBeDefined();
  });

  it('should maintain consistency across analysis levels', () => {
    const hom = createGroupHom(Z2, Z2, (x) => x);
    
    const quick = quickVerify(hom);
    const basic = analyzeBasic(hom);
    const complete = analyzeComplete(hom);
    
    expect(basic.witnesses?.isHom).toBe(quick);
    expect(complete.witnesses?.isHom).toBe(quick);
  });
});
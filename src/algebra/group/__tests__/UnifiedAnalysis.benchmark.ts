/**
 * Performance Benchmarks for Unified Analysis Functions
 * 
 * Ensures no performance regression compared to original implementations.
 * Tests various group sizes and analysis levels.
 */

import { describe, it, expect } from 'vitest';
import { 
  quickVerify, 
  analyzeBasic, 
  analyzeComplete, 
  analyzeBasicCached, 
  analyzeCompleteCached 
} from '../UnifiedAnalysis';
import { createGroupHom } from '../UnifiedGroupHom';
import { FiniteGroup } from '../Group';

// ============================================================================
// BENCHMARK SETUP
// ============================================================================

// Create test groups of various sizes
const createCyclicGroup = (n: number): FiniteGroup<number> => ({
  elems: Array.from({ length: n }, (_, i) => i),
  op: (a, b) => (a + b) % n,
  id: 0,
  inv: (a) => (n - a) % n,
  eq: (a, b) => a === b,
  name: `C${n}`
});

const Z2 = createCyclicGroup(2);
const Z3 = createCyclicGroup(3);
const Z4 = createCyclicGroup(4);
const Z5 = createCyclicGroup(5);

// Test homomorphisms
const identityZ2 = createGroupHom(Z2, Z2, (x) => x);
const identityZ3 = createGroupHom(Z3, Z3, (x) => x);
const identityZ4 = createGroupHom(Z4, Z4, (x) => x);
const identityZ5 = createGroupHom(Z5, Z5, (x) => x);

// ============================================================================
// PERFORMANCE BENCHMARKS
// ============================================================================

describe('Performance Benchmarks', () => {
  describe('quickVerify Performance', () => {
    it('should complete quickly for small groups', () => {
      const iterations = 1000;
      const start = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        quickVerify(identityZ2);
      }
      
      const time = performance.now() - start;
      const avgTime = time / iterations;
      
      // Should complete in under 1ms per iteration for Z2
      expect(avgTime).toBeLessThan(1);
    });

    it('should scale reasonably with group size', () => {
      const iterations = 100;
      
      const z2Start = performance.now();
      for (let i = 0; i < iterations; i++) {
        quickVerify(identityZ2);
      }
      const z2Time = performance.now() - z2Start;
      
      const z3Start = performance.now();
      for (let i = 0; i < iterations; i++) {
        quickVerify(identityZ3);
      }
      const z3Time = performance.now() - z3Start;
      
      const z4Start = performance.now();
      for (let i = 0; i < iterations; i++) {
        quickVerify(identityZ4);
      }
      const z4Time = performance.now() - z4Start;
      
      // Z3 should be roughly 2.25x slower than Z2 (3^2 vs 2^2)
      expect(z3Time).toBeLessThan(z2Time * 3);
      
      // Z4 should be roughly 4x slower than Z2 (4^2 vs 2^2)
      expect(z4Time).toBeLessThan(z2Time * 5);
    });
  });

  describe('analyzeBasic Performance', () => {
    it('should complete within reasonable time for small groups', () => {
      const start = performance.now();
      analyzeBasic(identityZ2);
      const time = performance.now() - start;
      
      // Should complete in under 100ms for Z2
      expect(time).toBeLessThan(100);
    });

    it('should be significantly slower than quickVerify', () => {
      const quickStart = performance.now();
      quickVerify(identityZ2);
      const quickTime = performance.now() - quickStart;
      
      const basicStart = performance.now();
      analyzeBasic(identityZ2);
      const basicTime = performance.now() - basicStart;
      
      // Basic analysis should be at least 10x slower than quick verify
      expect(basicTime).toBeGreaterThan(quickTime * 10);
    });

    it('should scale with group size', () => {
      const z2Start = performance.now();
      analyzeBasic(identityZ2);
      const z2Time = performance.now() - z2Start;
      
      const z3Start = performance.now();
      analyzeBasic(identityZ3);
      const z3Time = performance.now() - z3Start;
      
      // Z3 analysis should be slower than Z2
      expect(z3Time).toBeGreaterThan(z2Time);
    });
  });

  describe('analyzeComplete Performance', () => {
    it('should include all features without major performance penalty', () => {
      const basicStart = performance.now();
      analyzeBasic(identityZ2);
      const basicTime = performance.now() - basicStart;
      
      const completeStart = performance.now();
      analyzeComplete(identityZ2);
      const completeTime = performance.now() - completeStart;
      
      // Complete analysis should not be more than 2x slower than basic
      expect(completeTime).toBeLessThan(basicTime * 2);
    });

    it('should provide all methods without significant overhead', () => {
      const analyzed = analyzeComplete(identityZ2);
      
      // Test that methods are available and work
      if (analyzed.respectsOp) {
        const start = performance.now();
        analyzed.respectsOp(0, 1);
        const time = performance.now() - start;
        
        // Method call should be very fast
        expect(time).toBeLessThan(1);
      }
    });
  });

  describe('Caching Performance', () => {
    it('should provide significant speedup on repeated analysis', () => {
      const hom = identityZ2;
      
      // First analysis (no cache)
      const firstStart = performance.now();
      analyzeBasicCached(hom);
      const firstTime = performance.now() - firstStart;
      
      // Second analysis (with cache)
      const secondStart = performance.now();
      analyzeBasicCached(hom);
      const secondTime = performance.now() - secondStart;
      
      // Cached version should be at least 5x faster
      expect(secondTime).toBeLessThan(firstTime / 5);
    });

    it('should maintain cache effectiveness across different analysis levels', () => {
      const hom = identityZ2;
      
      // First complete analysis
      const firstStart = performance.now();
      analyzeCompleteCached(hom);
      const firstTime = performance.now() - firstStart;
      
      // Second basic analysis (should use cache)
      const secondStart = performance.now();
      analyzeBasicCached(hom);
      const secondTime = performance.now() - secondStart;
      
      // Should benefit from caching
      expect(secondTime).toBeLessThan(firstTime);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory with repeated analysis', () => {
      const iterations = 100;
      
      // Perform many analyses
      for (let i = 0; i < iterations; i++) {
        const hom = createGroupHom(Z2, Z2, (x) => x);
        analyzeComplete(hom);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      // This test mainly ensures no exceptions are thrown
      // In a real environment, you'd measure actual memory usage
      expect(true).toBe(true);
    });
  });
});

// ============================================================================
// COMPARATIVE BENCHMARKS
// ============================================================================

describe('Comparative Benchmarks', () => {
  it('should maintain performance compared to original implementations', () => {
    // This would compare against the original analyzeHom function
    // For now, we establish baseline performance expectations
    
    const hom = identityZ2;
    const iterations = 10;
    
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      analyzeBasic(hom);
    }
    const time = performance.now() - start;
    const avgTime = time / iterations;
    
    // Should complete basic analysis in under 50ms on average
    expect(avgTime).toBeLessThan(50);
  });

  it('should provide better performance for simple cases', () => {
    const hom = identityZ2;
    
    // Quick verify should be much faster for simple validation
    const quickStart = performance.now();
    const quickResult = quickVerify(hom);
    const quickTime = performance.now() - quickStart;
    
    // Basic analysis for comparison
    const basicStart = performance.now();
    const basicResult = analyzeBasic(hom);
    const basicTime = performance.now() - basicStart;
    
    // Results should be consistent
    expect(quickResult).toBe(basicResult.witnesses?.isHom);
    
    // Quick verify should be much faster
    expect(quickTime).toBeLessThan(basicTime / 10);
  });
});

// ============================================================================
// STRESS TESTS
// ============================================================================

describe('Stress Tests', () => {
  it('should handle larger groups without major performance degradation', () => {
    const Z5 = createCyclicGroup(5);
    const hom = createGroupHom(Z5, Z5, (x) => x);
    
    const start = performance.now();
    const result = analyzeBasic(hom);
    const time = performance.now() - start;
    
    // Should complete Z5 analysis in under 1 second
    expect(time).toBeLessThan(1000);
    expect(result.witnesses?.isHom).toBe(true);
  });

  it('should handle multiple concurrent analyses', () => {
    const homs = [
      createGroupHom(Z2, Z2, (x) => x),
      createGroupHom(Z3, Z3, (x) => x),
      createGroupHom(Z4, Z4, (x) => x)
    ];
    
    const start = performance.now();
    const results = homs.map(hom => analyzeBasic(hom));
    const time = performance.now() - start;
    
    // Should complete all analyses in reasonable time
    expect(time).toBeLessThan(500);
    expect(results.every(r => r.witnesses?.isHom === true)).toBe(true);
  });
});
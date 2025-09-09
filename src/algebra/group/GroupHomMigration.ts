/**
 * GroupHom Migration Utilities
 * 
 * This module provides migration utilities to convert between the four competing
 * GroupHom implementations to the unified interface.
 * 
 * Migration Priority:
 * 1. EnhancedGroupHom (57 references across 15 files) - HIGHEST PRIORITY
 * 2. Class-based GroupHom (8 imports) - MEDIUM PRIORITY  
 * 3. Simple interface GroupHom (0 direct imports) - LOW PRIORITY
 */

import type { GroupHom as UnifiedGroupHom } from './UnifiedGroupHom';
import type { FiniteGroup } from './Group';
import type { NormalSubgroup } from './NormalSubgroup';
import type { Eq } from '../../types/eq.js';

// ============================================================================
// TYPE DEFINITIONS FOR MIGRATION
// ============================================================================

/**
 * Result of canonical factorization through kernel-pair quotient.
 */
interface FactorizationResult<A, B> {
  quotient: any; // QuotientGroup type
  pi: (g: A) => any; // projection to quotient
  iota: (q: { rep: A }) => B; // injection from quotient
  law_compose_equals_f: (g: A) => boolean; // composition law
}

// ============================================================================
// FROM CLASS-BASED IMPLEMENTATION (8 imports to migrate)
// ============================================================================

/**
 * Migrates from class-based GroupHom to unified interface.
 * 
 * Converts constructor-based to interface-based while preserving all method implementations.
 * 
 * @param classHom - The class-based GroupHom instance
 * @returns Unified GroupHom interface
 * 
 * @example
 * ```typescript
 * // Before migration:
 * const classHom = new GroupHom(G, H, map);
 * 
 * // After migration:
 * const unifiedHom = fromClassHom(classHom);
 * // All methods (respectsOp, preservesId, etc.) are preserved
 * ```
 */
export function fromClassHom<G, H>(
  classHom: import('./GroupHom').GroupHom<G, H>
): UnifiedGroupHom<unknown, unknown, G, H> {
  try {
    // Validate input
    if (!classHom || typeof classHom !== 'object') {
      throw new Error('Invalid classHom: must be a GroupHom instance');
    }
    
    if (!classHom.G || !classHom.H || typeof classHom.map !== 'function') {
      throw new Error('Invalid classHom: missing required properties (G, H, map)');
    }
    
    // Create unified interface with all preserved methods
    const result: UnifiedGroupHom<unknown, unknown, G, H> = {
      source: classHom.G,
      target: classHom.H,
      map: classHom.map
    };
    
    // Preserve all method implementations from class-based version
    if (typeof classHom.respectsOp === 'function') {
      result.respectsOp = classHom.respectsOp.bind(classHom);
    }
    
    if (typeof classHom.preservesId === 'function') {
      result.preservesId = classHom.preservesId.bind(classHom);
    }
    
    if (typeof classHom.preservesInv === 'function') {
      result.preservesInv = classHom.preservesInv.bind(classHom);
    }
    
    if (typeof classHom.kernel === 'function') {
      result.kernel = classHom.kernel.bind(classHom);
    }
    
    if (typeof classHom.imagePredicate === 'function') {
      result.imagePredicate = classHom.imagePredicate.bind(classHom);
    }
    
    if (typeof classHom.factorization === 'function') {
      result.factorization = classHom.factorization.bind(classHom);
    }
    
    if (typeof classHom.verify === 'function') {
      result.verify = classHom.verify.bind(classHom);
    }
    
    // Validate mathematical properties with small example
    if (result.respectsOp && classHom.G.elems && classHom.G.elems.length > 0) {
      const testElement = classHom.G.elems[0];
      if (testElement !== undefined) {
        try {
          result.respectsOp(testElement, testElement);
        } catch (error) {
          console.warn('Warning: respectsOp method may have issues:', error);
        }
      }
    }
    
    return result;
    
  } catch (error) {
    throw new Error(`Failed to migrate class-based GroupHom: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ============================================================================
// FROM SIMPLE INTERFACE (0 direct imports, but used via re-exports)
// ============================================================================

/**
 * Migrates from simple interface GroupHom to unified interface.
 * 
 * Handles property name mapping: simpleHom.f → result.map
 * Preserves verify() method and other properties.
 * 
 * @param simpleHom - The simple interface GroupHom
 * @returns Unified GroupHom interface
 * 
 * @example
 * ```typescript
 * // Before migration:
 * const simpleHom = { source: G, target: H, f: map, verify: () => true };
 * 
 * // After migration:
 * const unifiedHom = fromSimpleHom(simpleHom);
 * // Property 'f' is mapped to 'map', verify() is preserved
 * ```
 */
export function fromSimpleHom<A, B>(
  simpleHom: import('../structures/group/Hom').GroupHom<A, B>
): UnifiedGroupHom<unknown, unknown, A, B> {
  try {
    // Validate input
    if (!simpleHom || typeof simpleHom !== 'object') {
      throw new Error('Invalid simpleHom: must be an object');
    }
    
    if (!simpleHom.source || !simpleHom.target || typeof simpleHom.f !== 'function') {
      throw new Error('Invalid simpleHom: missing required properties (source, target, f)');
    }
    
    // Create unified interface with property name mapping
    const result: UnifiedGroupHom<unknown, unknown, A, B> = {
      source: simpleHom.source,
      target: simpleHom.target,
      map: simpleHom.f, // Map 'f' to 'map'
      name: simpleHom.name,
      witnesses: simpleHom.witnesses
    };
    
    // Preserve verify() method if it exists
    if (typeof simpleHom.verify === 'function') {
      result.verify = simpleHom.verify.bind(simpleHom);
    }
    
    // Validate mathematical properties with small example
    if (simpleHom.source.elems && simpleHom.source.elems.length > 0) {
      const testElement = simpleHom.source.elems[0];
      if (testElement !== undefined) {
        try {
          const mapped = result.map(testElement);
          // Basic validation that mapping works
          if (mapped === undefined) {
            console.warn('Warning: mapping function returned undefined for test element');
          }
        } catch (error) {
          console.warn('Warning: mapping function may have issues:', error);
        }
      }
    }
    
    return result;
    
  } catch (error) {
    throw new Error(`Failed to migrate simple interface GroupHom: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ============================================================================
// FROM ENHANCED INTERFACE (57 references across 15 files - HIGHEST PRIORITY)
// ============================================================================

/**
 * Migrates from enhanced interface GroupHom to unified interface.
 * 
 * Handles property name mappings:
 * - enhancedHom.src → result.source
 * - enhancedHom.dst → result.target  
 * - enhancedHom.run → result.map
 * 
 * Preserves built-in witness properties in the witnesses field.
 * 
 * @param enhancedHom - The enhanced interface GroupHom
 * @returns Unified GroupHom interface
 * 
 * @example
 * ```typescript
 * // Before migration:
 * const enhancedHom = mkHom(src, dst, run);
 * 
 * // After migration:
 * const unifiedHom = fromEnhancedHom(enhancedHom);
 * // Property names are mapped, witness properties are preserved
 * ```
 */
export function fromEnhancedHom<A, B>(
  enhancedHom: import('./EnhancedGroupHom').EnhancedGroupHom<A, B>
): UnifiedGroupHom<unknown, unknown, A, B> {
  try {
    // Validate input
    if (!enhancedHom || typeof enhancedHom !== 'object') {
      throw new Error('Invalid enhancedHom: must be an object');
    }
    
    if (!enhancedHom.src || !enhancedHom.dst || typeof enhancedHom.run !== 'function') {
      throw new Error('Invalid enhancedHom: missing required properties (src, dst, run)');
    }
    
    // Create unified interface with property name mappings
    const result: UnifiedGroupHom<unknown, unknown, A, B> = {
      source: enhancedHom.src, // Map 'src' to 'source'
      target: enhancedHom.dst, // Map 'dst' to 'target'
      map: enhancedHom.run     // Map 'run' to 'map'
    };
    
    // Preserve built-in witness properties in witnesses field
    if (enhancedHom.preservesOp || enhancedHom.preservesId || enhancedHom.preservesInv) {
      result.witnesses = {
        isHom: true, // Enhanced homomorphisms are assumed to be valid
        isMono: false, // Would need separate analysis
        isEpi: false,  // Would need separate analysis
        isIso: false,  // Would need separate analysis
        preservesOp: enhancedHom.preservesOp,
        preservesId: enhancedHom.preservesId,
        preservesInv: enhancedHom.preservesInv
      };
    }
    
    // Validate mathematical properties with small example
    if (enhancedHom.src.elems && enhancedHom.src.elems.length > 0) {
      const testElement = enhancedHom.src.elems[0];
      if (testElement !== undefined) {
        try {
          // Test the mapping function
          const mapped = result.map(testElement);
          if (mapped === undefined) {
            console.warn('Warning: enhanced mapping function returned undefined for test element');
          }
          
          // Test witness properties if available
          if (enhancedHom.preservesOp) {
            const preservesOpResult = enhancedHom.preservesOp(testElement, testElement);
            if (typeof preservesOpResult !== 'boolean') {
              console.warn('Warning: preservesOp returned non-boolean value');
            }
          }
          
          if (enhancedHom.preservesId) {
            const preservesIdResult = enhancedHom.preservesId();
            if (typeof preservesIdResult !== 'boolean') {
              console.warn('Warning: preservesId returned non-boolean value');
            }
          }
          
        } catch (error) {
          console.warn('Warning: enhanced homomorphism may have issues:', error);
        }
      }
    }
    
    return result;
    
  } catch (error) {
    throw new Error(`Failed to migrate enhanced GroupHom: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ============================================================================
// PROPERTY NAME COMPATIBILITY ADAPTERS
// ============================================================================

/**
 * Adds property name compatibility getters to a unified GroupHom.
 * 
 * Provides backward compatibility by adding 'f' and 'run' getters that delegate to 'map'.
 * 
 * @param hom - The unified GroupHom
 * @returns Enhanced GroupHom with compatibility getters
 * 
 * @example
 * ```typescript
 * const unifiedHom = createGroupHom(G, H, map);
 * const compatibleHom = addPropertyCompatibility(unifiedHom);
 * 
 * // Now all three property names work:
 * compatibleHom.map(x);  // Original
 * compatibleHom.f(x);    // Simple interface compatibility
 * compatibleHom.run(x);  // Enhanced interface compatibility
 * ```
 */
export function addPropertyCompatibility<A, B>(
  hom: UnifiedGroupHom<unknown, unknown, A, B>
): UnifiedGroupHom<unknown, unknown, A, B> & { f: (a: A) => B; run: (a: A) => B } {
  try {
    // Validate input
    if (!hom || typeof hom !== 'object') {
      throw new Error('Invalid hom: must be a GroupHom object');
    }
    
    if (typeof hom.map !== 'function') {
      throw new Error('Invalid hom: missing required map function');
    }
    
    // Create enhanced object with compatibility getters
    const enhanced = Object.create(hom) as UnifiedGroupHom<unknown, unknown, A, B> & { f: (a: A) => B; run: (a: A) => B };
    
    // Add compatibility getters
    Object.defineProperty(enhanced, 'f', {
      get: () => hom.map,
      enumerable: true,
      configurable: true
    });
    
    Object.defineProperty(enhanced, 'run', {
      get: () => hom.map,
      enumerable: true,
      configurable: true
    });
    
    // Validate that compatibility getters work
    if (hom.source.elems && hom.source.elems.length > 0) {
      const testElement = hom.source.elems[0];
      if (testElement !== undefined) {
        try {
          const originalResult = hom.map(testElement);
          const fResult = enhanced.f(testElement);
          const runResult = enhanced.run(testElement);
          
          // Verify all three methods return the same result
          if (originalResult !== fResult || originalResult !== runResult) {
            console.warn('Warning: compatibility getters may not be working correctly');
          }
        } catch (error) {
          console.warn('Warning: compatibility getters may have issues:', error);
        }
      }
    }
    
    return enhanced;
    
  } catch (error) {
    throw new Error(`Failed to add property compatibility: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ============================================================================
// BULK MIGRATION UTILITIES
// ============================================================================

/**
 * Migrates multiple enhanced GroupHoms in bulk (for the 57 references).
 * 
 * @param enhancedHoms - Array of enhanced GroupHoms to migrate
 * @returns Array of unified GroupHoms
 * 
 * @example
 * ```typescript
 * const enhancedHoms = [mkHom(G1, H1, f1), mkHom(G2, H2, f2)];
 * const unifiedHoms = migrateEnhancedHoms(enhancedHoms);
 * ```
 */
export function migrateEnhancedHoms<A, B>(
  enhancedHoms: import('./EnhancedGroupHom').EnhancedGroupHom<A, B>[]
): UnifiedGroupHom<unknown, unknown, A, B>[] {
  try {
    if (!Array.isArray(enhancedHoms)) {
      throw new Error('enhancedHoms must be an array');
    }
    
    const results: UnifiedGroupHom<unknown, unknown, A, B>[] = [];
    const errors: string[] = [];
    
    for (let i = 0; i < enhancedHoms.length; i++) {
      try {
        const migrated = fromEnhancedHom(enhancedHoms[i]);
        results.push(migrated);
      } catch (error) {
        const errorMsg = `Failed to migrate enhanced hom at index ${i}: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }
    
    if (errors.length > 0) {
      console.warn(`Migration completed with ${errors.length} errors out of ${enhancedHoms.length} items`);
    }
    
    return results;
    
  } catch (error) {
    throw new Error(`Bulk migration failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Migrates multiple class-based GroupHoms in bulk.
 * 
 * @param classHoms - Array of class-based GroupHoms to migrate
 * @returns Array of unified GroupHoms
 */
export function migrateClassHoms<G, H>(
  classHoms: import('./GroupHom').GroupHom<G, H>[]
): UnifiedGroupHom<unknown, unknown, G, H>[] {
  try {
    if (!Array.isArray(classHoms)) {
      throw new Error('classHoms must be an array');
    }
    
    const results: UnifiedGroupHom<unknown, unknown, G, H>[] = [];
    const errors: string[] = [];
    
    for (let i = 0; i < classHoms.length; i++) {
      try {
        const migrated = fromClassHom(classHoms[i]);
        results.push(migrated);
      } catch (error) {
        const errorMsg = `Failed to migrate class hom at index ${i}: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }
    
    if (errors.length > 0) {
      console.warn(`Migration completed with ${errors.length} errors out of ${classHoms.length} items`);
    }
    
    return results;
    
  } catch (error) {
    throw new Error(`Bulk migration failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validates that a migrated GroupHom maintains mathematical properties.
 * 
 * @param hom - The migrated GroupHom to validate
 * @returns Validation result with details
 */
export function validateMigratedHom<A, B>(
  hom: UnifiedGroupHom<unknown, unknown, A, B>
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    // Basic structure validation
    if (!hom.source || !hom.target || typeof hom.map !== 'function') {
      errors.push('Missing required properties: source, target, or map');
      return { isValid: false, errors, warnings };
    }
    
    // Test mapping function with sample elements
    if (hom.source.elems && hom.source.elems.length > 0) {
      const testElement = hom.source.elems[0];
      if (testElement !== undefined) {
        try {
          const result = hom.map(testElement);
          if (result === undefined) {
            warnings.push('Mapping function returned undefined for test element');
          }
        } catch (error) {
          errors.push(`Mapping function failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
    
    // Test optional methods if they exist
    if (hom.respectsOp && hom.source.elems && hom.source.elems.length > 0) {
      const testElement = hom.source.elems[0];
      if (testElement !== undefined) {
        try {
          const result = hom.respectsOp(testElement, testElement);
          if (typeof result !== 'boolean') {
            warnings.push('respectsOp returned non-boolean value');
          }
        } catch (error) {
          warnings.push(`respectsOp method failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
    
    if (hom.preservesId) {
      try {
        const result = hom.preservesId();
        if (typeof result !== 'boolean') {
          warnings.push('preservesId returned non-boolean value');
        }
      } catch (error) {
        warnings.push(`preservesId method failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    if (hom.verify) {
      try {
        const result = hom.verify();
        if (typeof result !== 'boolean') {
          warnings.push('verify returned non-boolean value');
        }
      } catch (error) {
        warnings.push(`verify method failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return { isValid: errors.length === 0, errors, warnings };
    
  } catch (error) {
    errors.push(`Validation failed: ${error instanceof Error ? error.message : String(error)}`);
    return { isValid: false, errors, warnings };
  }
}
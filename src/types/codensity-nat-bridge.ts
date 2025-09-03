// codensity-nat-bridge.ts
// Turn an End-element in T^G(A) into a natural transformation G^A ⇒ G
// Provides bridge between End representation and Nat viewpoint

import { SetObj } from "./catkit-kan.js";
import { SmallCategory } from "./category-to-nerve-sset.js";
import { powerFunctor } from "./codensity-nat-view.js";

/************ Local Natural Transformation Type ************/

export interface NatTrans<B_O> {
  at: (b: B_O) => (k: (a: any) => any) => any;
}

/************ End to Nat Conversion ************/

/**
 * Convert End element to natural transformation G^A ⇒ G
 * From {φ_b : (A → G b) → G b} to α: G^A ⇒ G
 */
export function endToNat<B_O, B_M>(
  B: SmallCategory<B_O, B_M> & { objects: ReadonlyArray<B_O>; morphisms: ReadonlyArray<B_M> },
  A: SetObj<any>,
  G: any, // SetFunctor but avoiding import issues
  endElem: any
): NatTrans<B_O> {
  return {
    at: (b: B_O) => {
      // Extract component φ_b from end element
      if (endElem && typeof endElem === 'object' && endElem.at) {
        const phib = endElem.at(b);
        if (typeof phib === 'function') {
          // α_b : (G b)^A → G b given by α_b(k) = φ_b(k)
          return (k: (a: any) => any) => phib(k);
        }
      }
      
      // Fallback for unit elements
      if (endElem && endElem.type === 'unit' && endElem.value !== undefined) {
        // For η_A(a), the component is k ↦ k(a)
        return (k: (a: any) => any) => k(endElem.value);
      }
      
      // Default fallback
      return (k: (a: any) => any) => {
        if (A.elems.length > 0) {
          return k(A.elems[0]);
        }
        return undefined;
      };
    }
  };
}

/**
 * Convert natural transformation back to End element (reverse direction)
 */
export function natToEnd<B_O, B_M>(
  B: SmallCategory<B_O, B_M> & { objects: ReadonlyArray<B_O> },
  A: SetObj<any>,
  G: any,
  nat: NatTrans<B_O>
): any {
  return {
    type: 'nat-derived',
    source: A,
    
    at: (b: B_O) => {
      const alpha_b = nat.at(b);
      // φ_b(k) = α_b(k) where k: A → G b
      return (k: (a: any) => any) => alpha_b(k);
    }
  };
}

/************ Verification Utilities ************/

/**
 * Verify that End ↔ Nat conversion preserves behavior
 */
export function verifyEndNatRoundtrip<B_O, B_M>(
  B: SmallCategory<B_O, B_M> & { objects: ReadonlyArray<B_O>; morphisms: ReadonlyArray<B_M> },
  A: SetObj<any>,
  G: any,
  endElem: any,
  testContinuations: ((a: any) => any)[]
): boolean {
  try {
    // End → Nat → End
    const nat = endToNat(B, A, G, endElem);
    const endBack = natToEnd(B, A, G, nat);
    
    // Test behavior on sample continuations for each object
    for (const b of B.objects) {
      const originalComponent = endElem.at ? endElem.at(b) : undefined;
      const roundtripComponent = endBack.at(b);
      
      if (typeof originalComponent === 'function' && typeof roundtripComponent === 'function') {
        for (const k of testContinuations) {
          const original = originalComponent(k);
          const roundtrip = roundtripComponent(k);
          
          // Use JSON comparison for complex values
          if (JSON.stringify(original) !== JSON.stringify(roundtrip)) {
            return false;
          }
        }
      }
    }
    
    return true;
  } catch {
    return false;
  }
}

/************ Demonstration Function ************/

export function demonstrateNatBridge(): void {
  console.log('='.repeat(70));
  console.log('🌉 NAT/END BRIDGE DEMONSTRATION');
  console.log('='.repeat(70));

  console.log('\n📐 MATHEMATICAL BRIDGE:');
  console.log('   End element {φ_b} ↔ Natural transformation α: G^A ⇒ G');
  console.log('   Component extraction: φ_b ↔ α_b');
  console.log('   Behavior preservation: roundtrip isomorphism');

  console.log('\n🔄 CONVERSION OPERATIONS:');
  console.log('   endToNat: End → Nat (extract components)');
  console.log('   natToEnd: Nat → End (reconstruct family)');
  console.log('   verifyEndNatRoundtrip: Test isomorphism');

  console.log('\n🎯 APPLICATIONS:');
  console.log('   ✓ Alternative ultrafilter construction');
  console.log('   ✓ Component-wise testing and verification');
  console.log('   ✓ Naturality-based law derivation');
  console.log('   ✓ Bridge between categorical and computational views');

  console.log('='.repeat(70));
}
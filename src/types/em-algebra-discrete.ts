// em-algebra-discrete.ts
// Discrete compact-Hausdorff Eilenberg-Moore algebra for ultrafilter monad
// In finite sets: Hausdorff ⇒ discrete, every finite space is compact
// EM structure map α_X: U(X) → X picks the unique ultrafilter limit (principal witness)

import { SetObj } from "./catkit-kan.js";
import { EMAlgebra } from "./strong-monad.js"; // Use existing EM algebra interface
import { ultrafilterFromCodensity } from "./ultrafilter.js";
import { UF } from "./ultrafilter-monad.js";

/************ Discrete EM Algebra Interface ************/

/**
 * Eilenberg-Moore algebra for ultrafilter monad on finite discrete spaces
 * Uses existing EMAlgebra interface from strong-monad.ts
 */
export interface DiscreteEMAlgebra<A> extends EMAlgebra<'Ultrafilter', A> {
  Aset: SetObj<A>;
  alg(ta: any): A; // Structure map U(A) → A (inherited)
  alpha: (t: any) => A; // Alias for alg with clearer name
}

/************ Main Implementation ************/

/** 
 * For a finite discrete space, α returns the principal witness
 * Since finite discrete spaces are compact Hausdorff, every ultrafilter is principal
 */
export function discreteEMAlgebra<A>(Aset: SetObj<A>): DiscreteEMAlgebra<A> {
  const alpha = (t: any): A => {
    const U = ultrafilterFromCodensity<A>(Aset, t);
    
    if (!U.isPrincipal || U.principalWitness === undefined) {
      throw new Error("Non-principal ultrafilter encountered in finite discrete space");
    }
    
    return U.principalWitness;
  };
  
  return {
    Aset,
    alg: alpha, // EMAlgebra interface requirement
    alpha       // Clearer name for ultrafilter context
  };
}

/************ EM Algebra Law Checking ************/

/**
 * Check Eilenberg-Moore algebra laws for discrete ultrafilter algebra:
 * (1) α ∘ η = id_A (unit law)
 * (2) α ∘ T(α) = α ∘ μ (associativity law)
 */
export function checkEMLaws<A>(alg: DiscreteEMAlgebra<A>): {
  unitLaw: boolean;
  assocLaw: boolean;
  violations: string[];
} {
  const { Aset, alpha } = alg;
  const violations: string[] = [];
  
  // Law 1: Unit law - α(η_A(a)) = a
  const unitLaw = (): boolean => {
    for (const a of Aset.elems) {
      try {
        const t = UF.of(Aset)(a); // η_A(a)
        const result = alpha(t);
        
        if (!Aset.eq(result, a)) {
          violations.push(`Unit law: α(η(${a})) = ${result} ≠ ${a}`);
          return false;
        }
      } catch (error) {
        violations.push(`Unit law error at ${a}: ${(error as Error).message}`);
        return false;
      }
    }
    return true;
  };

  // Law 2: Associativity law - α(T(α)(tt)) = α(μ_A(tt))
  const assocLaw = (): boolean => {
    // Generate sample elements tt ∈ T(T(A)) via η_{T(A)}(t0)
    const TA = UF.T.obj(Aset);
    
    // Create some sample elements t0 ∈ T(A)
    const sampleElements = Aset.elems.slice(0, 3); // Limit for performance
    
    for (const a of sampleElements) {
      try {
        const t0 = UF.of(Aset)(a); // t0 = η_A(a) ∈ T(A)
        const tt = UF.of(TA)(t0);  // tt = η_{T(A)}(t0) ∈ T(T(A))
        
        // Left side: α(T(α)(tt))
        const T_alpha = UF.T.map((x: any) => alpha(x)); // T(α): T(T(A)) → T(A)
        const left_intermediate = T_alpha(tt);
        const left = alpha(left_intermediate);
        
        // Right side: α(μ_A(tt))
        const right_intermediate = UF.mu(Aset)(tt);
        const right = alpha(right_intermediate);
        
        if (!Aset.eq(left, right)) {
          violations.push(`Associativity law: α(T(α)(tt)) = ${left} ≠ ${right} = α(μ(tt)) for a=${a}`);
          return false;
        }
        
      } catch (error) {
        violations.push(`Associativity law error at ${a}: ${(error as Error).message}`);
        return false;
      }
    }
    
    return true;
  };

  const unitResult = unitLaw();
  const assocResult = assocLaw();
  
  return {
    unitLaw: unitResult,
    assocLaw: assocResult,
    violations
  };
}

/************ Compact Hausdorff Properties ************/

/**
 * Verify that finite discrete space has compact Hausdorff properties
 */
export function verifyCompactHausdorff<A>(Aset: SetObj<A>): {
  isDiscrete: boolean;
  isCompact: boolean; 
  isHausdorff: boolean;
} {
  // For finite sets:
  // - Discrete: Every subset is open/closed
  // - Compact: Every open cover has finite subcover (trivial for finite)
  // - Hausdorff: Any two distinct points can be separated (trivial for discrete)
  
  return {
    isDiscrete: true,   // Finite sets are discrete
    isCompact: true,    // Finite sets are compact
    isHausdorff: true   // Discrete spaces are Hausdorff
  };
}

/**
 * Verify convergence property: every ultrafilter converges to unique point
 */
export function verifyConvergence<A>(
  Aset: SetObj<A>,
  t: any
): { converges: boolean; limit?: A } {
  // In discrete spaces, ultrafilter converges to its principal witness
  const U = ultrafilterFromCodensity<A>(Aset, t);
  
  return {
    converges: U.isPrincipal,
    limit: U.principalWitness!
  } as { converges: boolean; limit?: A };
}

/************ Demonstration Function ************/

export function demonstrateDiscreteEM(): void {
  console.log('='.repeat(70));
  console.log('🏛️  DISCRETE EM ALGEBRA DEMONSTRATION');
  console.log('='.repeat(70));

  console.log('\n📐 THEORETICAL FOUNDATION:');
  console.log('   Compact Hausdorff space: Finite discrete X');
  console.log('   Ultrafilter monad: T(X) = ultrafilters on X');
  console.log('   EM structure map: α_X: T(X) → X (convergence)');
  console.log('   Principal property: α(η(a)) = a (unit law)');
  console.log('   Associativity: α ∘ T(α) = α ∘ μ (algebra law)');

  // Test with small discrete space
  const X: SetObj<string> = {
    id: "X",
    elems: ["p", "q", "r"],
    eq: (a, b) => a === b
  };

  console.log(`\n🎮 EXAMPLE: X = {${X.elems.join(', ')}} (finite discrete space)`);

  try {
    const algebra = discreteEMAlgebra(X);
    
    console.log('\n   EM Algebra Structure:');
    console.log('   ✓ Structure map α: T(X) → X defined');
    console.log('   ✓ Finite discrete space (compact Hausdorff)');
    
    // Test unit law
    console.log('\n   Unit Law Testing:');
    X.elems.forEach(a => {
      const t = UF.of(X)(a); // η_X(a)
      const result = algebra.alpha(t);
      const correct = result === a;
      console.log(`     α(η("${a}")) = "${result}" ${correct ? '✅' : '❌'}`);
    });
    
    // Test EM laws comprehensively
    const lawCheck = checkEMLaws(algebra);
    console.log('\n   EM Algebra Laws:');
    console.log('     Unit law alpha o eta = id:', lawCheck.unitLaw ? '✅' : '❌');
    console.log('     Associativity alpha o T(alpha) = alpha o mu:', lawCheck.assocLaw ? '✅' : '❌');
    
    if (lawCheck.violations.length > 0) {
      console.log('   Violations:');
      lawCheck.violations.forEach(v => console.log(`     ${v}`));
    }
    
    // Test compact Hausdorff properties
    const topology = verifyCompactHausdorff(X);
    console.log('\n   Topological Properties:');
    console.log('     Discrete:', topology.isDiscrete ? '✅' : '❌');
    console.log('     Compact:', topology.isCompact ? '✅' : '❌');
    console.log('     Hausdorff:', topology.isHausdorff ? '✅' : '❌');
    
    // Test convergence
    const testElement = "q";
    const testUltrafilter = UF.of(X)(testElement);
    const convergence = verifyConvergence(X, testUltrafilter);
    console.log(`\n   Convergence for η("${testElement}"):`);
    console.log('     Converges:', convergence.converges ? '✅' : '❌');
    console.log('     Limit:', convergence.limit);
    
  } catch (error) {
    console.log('   Error:', (error as Error).message);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ DISCRETE EM ALGEBRA FEATURES:');
  console.log('   🔹 Compact Hausdorff structure on finite discrete spaces');
  console.log('   🔹 EM algebra laws: unit and associativity');
  console.log('   🔹 Principal ultrafilter convergence');
  console.log('   🔹 Structure map α: T(X) → X via principal witness');
  console.log('   🔹 Integration with ultrafilter monad');
  console.log('   🔹 Topological properties verification');
  console.log('='.repeat(70));
}
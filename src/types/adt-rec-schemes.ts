/** @math DEF-CATAMORPHISM @math THM-INITIAL-ALGEBRA */

/** Build recursion schemes from an external mapF (useful if F-nodes don't carry fmap). */
import { Fix, In, Out } from "./adt-fix.js";

export function makeSchemes<F>(mapF: (f: (x: any) => any, fa: F) => F) {
  const cata = <A>(alg: (fa: F) => A) =>
    function go(fx: Fix<F>): A {
      const fa = Out(fx);
      return alg(mapF((child: Fix<F>) => go(child), fa));
    };
    
  const ana = <A>(coalg: (a: A) => F) =>
    function go(a: A): Fix<F> {
      return In(mapF((seed: A) => go(seed), coalg(a)));
    };
    
  const hylo = <A, B>(alg: (fa: F) => B, coalg: (a: A) => F) =>
    function go(a: A): B {
      return alg(mapF((seed: A) => go(seed), coalg(a)));
    };
    
  const para = <A>(alg: (fpa: any) => A) =>
    function go(fx: Fix<F>): A {
      const fa = Out(fx);
      return alg(mapF((child: Fix<F>) => [child, go(child)], fa));
    };
    
  const apo = <A>(coalg: (a: A) => F) =>
    function go(a: A): Fix<F> {
      const fr = coalg(a);
      return In(mapF((e: any) => e?._t === "inl" ? e.value : go(e.value), fr));
    };
    
  return { cata, ana, hylo, para, apo };
}

/**
 * Demonstrate external recursion schemes
 */
export function demonstrateExternalSchemes() {
  console.log("🔧 EXTERNAL RECURSION SCHEMES");
  console.log("=" .repeat(50));
  
  console.log("\\nExternal MapF:");
  console.log("  • mapF: (f, fa) => F (external functor mapping)");
  console.log("  • Useful when F-nodes don't carry embedded fmap");
  console.log("  • Alternative to withMap approach");
  
  console.log("\\nRecursion Schemes:");
  console.log("  • cata: Catamorphism with external mapF");
  console.log("  • ana: Anamorphism with external mapF");
  console.log("  • hylo: Hylomorphism with external mapF");
  console.log("  • para: Paramorphism with external mapF");
  console.log("  • apo: Apomorphism with external mapF");
  
  console.log("\\nAdvantages:");
  console.log("  • Flexibility: Works with any functor representation");
  console.log("  • Separation: Keeps mapF logic separate from data");
  console.log("  • Compatibility: Works with existing F-structures");
  
  console.log("\\n🎯 Alternative recursion scheme foundation!");
}
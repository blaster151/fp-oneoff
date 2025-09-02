// surjection-types.ts
// Proper surjection types with witness evidence and runtime verification
// Models surjective functions as functions-with-sections for constructive proof

import { Finite, Fun } from "./rel-equipment.js";

/************ Surjection with witness ************/
const SurjBrand = Symbol("Surjection");

export type Surjection<A, Â> = {
  readonly [SurjBrand]: "Surjection";
  readonly p: Fun<A, Â>;      // surjection p: A ↠ Â
  readonly s: Fun<Â, A>;      // section s: Â → A (witness that p is surjective)
};

/************ Constructor with verification ************/
export function mkSurjection<A, Â>(
  A: Finite<A>, 
  Ahat: Finite<Â>, 
  p: Fun<A, Â>, 
  s: Fun<Â, A>
): Surjection<A, Â> {
  // Verify p is onto: every element in Â has a preimage in A
  const onto = Ahat.elems.every(â => A.elems.some(a => p(a) === â));
  
  // Verify s is a section: p ∘ s = id_Â
  const sect = Ahat.elems.every(â => p(s(â)) === â);
  
  if (!onto) {
    const uncovered = Ahat.elems.filter(â => !A.elems.some(a => p(a) === â));
    throw new Error(`Function is not surjective: elements ${uncovered} have no preimages`);
  }
  
  if (!sect) {
    const violations = Ahat.elems.filter(â => p(s(â)) !== â);
    throw new Error(`Section property violated: p(s(â)) ≠ â for â ∈ {${violations}}`);
  }
  
  return { [SurjBrand]: "Surjection", p, s };
}

/************ Accessor functions ************/
export function getSurjection<A, Â>(surj: Surjection<A, Â>): Fun<A, Â> {
  return surj.p;
}

export function getSection<A, Â>(surj: Surjection<A, Â>): Fun<Â, A> {
  return surj.s;
}

/************ Composition of surjections ************/
export function composeSurjections<A, Â, Ã>(
  A: Finite<A>,
  Ahat: Finite<Â>,
  Atilde: Finite<Ã>,
  f: Surjection<A, Â>,
  g: Surjection<Â, Ã>
): Surjection<A, Ã> {
  // Composition of surjections is surjective
  const p = (a: A): Ã => g.p(f.p(a));
  
  // Section is composition in reverse order
  const s = (ã: Ã): A => f.s(g.s(ã));
  
  return mkSurjection(A, Atilde, p, s);
}

/************ Identity surjection ************/
export function idSurjection<A>(A: Finite<A>): Surjection<A, A> {
  const id = (a: A): A => a;
  return mkSurjection(A, A, id, id);
}

/************ Verification utilities ************/
export function verifySurjection<A, Â>(
  A: Finite<A>,
  Ahat: Finite<Â>,
  surj: Surjection<A, Â>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    // Re-verify the surjection properties
    mkSurjection(A, Ahat, surj.p, surj.s);
    return { isValid: true, errors: [] };
  } catch (error) {
    return { 
      isValid: false, 
      errors: [error instanceof Error ? error.message : String(error)]
    };
  }
}

/************ Quotient construction ************/
export function quotientSurjection<A, Â>(
  A: Finite<A>,
  equivalenceClass: (a: A) => Â
): { impl: Finite<Â>; surj: Surjection<A, Â> } {
  // Collect equivalence classes
  const classes = new Set<Â>();
  for (const a of A.elems) {
    classes.add(equivalenceClass(a));
  }
  
  const impl = new Finite(Array.from(classes));
  
  // Create section by picking first representative from each class
  const representatives = new Map<Â, A>();
  for (const a of A.elems) {
    const â = equivalenceClass(a);
    if (!representatives.has(â)) {
      representatives.set(â, a);
    }
  }
  
  const p = equivalenceClass;
  const s = (â: Â): A => {
    const rep = representatives.get(â);
    if (rep === undefined) {
      throw new Error(`No representative found for equivalence class ${â}`);
    }
    return rep;
  };
  
  const surj = mkSurjection(A, impl, p, s);
  
  return { impl, surj };
}

/************ Surjection properties ************/
export function isSurjectionSplit<A, Â>(
  A: Finite<A>,
  Ahat: Finite<Â>,
  surj: Surjection<A, Â>
): boolean {
  // A surjection is split if it has a section (which it does by construction)
  // This checks if the section is also a surjection (making the original an isomorphism)
  try {
    mkSurjection(Ahat, A, surj.s, surj.p);
    return true;
  } catch {
    return false;
  }
}

export function surjectionKernel<A, Â>(
  A: Finite<A>,
  surj: Surjection<A, Â>
): Array<[A, A]> {
  // Kernel pairs: (a1, a2) where p(a1) = p(a2)
  const kernel: Array<[A, A]> = [];
  
  for (const a1 of A.elems) {
    for (const a2 of A.elems) {
      if (surj.p(a1) === surj.p(a2)) {
        kernel.push([a1, a2]);
      }
    }
  }
  
  return kernel;
}

/************ Factorization through surjections ************/
export function factorThroughSurjection<A, B, Â>(
  A: Finite<A>,
  B: Finite<B>,
  Ahat: Finite<Â>,
  f: Fun<A, B>,
  surj: Surjection<A, Â>
): { factors: boolean; induced?: Fun<Â, B> } {
  // Check if f factors through surj: f = f̂ ∘ p for some f̂: Â → B
  // This requires f to be constant on fibers of p
  
  const fiberMap = new Map<Â, B>();
  
  for (const a of A.elems) {
    const â = surj.p(a);
    const b = f(a);
    
    if (fiberMap.has(â)) {
      if (fiberMap.get(â) !== b) {
        // f is not constant on this fiber
        return { factors: false };
      }
    } else {
      fiberMap.set(â, b);
    }
  }
  
  // Define the induced function
  const induced = (â: Â): B => {
    const b = fiberMap.get(â);
    if (b === undefined) {
      throw new Error(`No value defined for ${â}`);
    }
    return b;
  };
  
  return { factors: true, induced };
}

/************ Examples and tests ************/
export function createExampleSurjections(): {
  modulo: Surjection<number, number>;
  stringLength: Surjection<string, string>;
  parity: Surjection<number, boolean>;
} {
  // Modulo 3 surjection
  const numbers = new Finite([0, 1, 2, 3, 4, 5]);
  const mod3 = new Finite([0, 1, 2]);
  const modulo = mkSurjection(
    numbers, 
    mod3,
    (n: number) => n % 3,
    (r: number) => r  // section: 0→0, 1→1, 2→2
  );
  
  // String length categories
  const strings = new Finite(["", "a", "bb", "ccc", "dddd"]);
  const lengths = new Finite(["empty", "short", "medium", "long"]);
  const classify = (s: string): string => {
    if (s.length === 0) return "empty";
    if (s.length <= 2) return "short";
    if (s.length === 3) return "medium";
    return "long";
  };
  const stringLength = mkSurjection(
    strings,
    lengths,
    classify,
    (cat: string) => {
      switch (cat) {
        case "empty": return "";
        case "short": return "a";
        case "medium": return "ccc";
        case "long": return "dddd";
        default: throw new Error(`Unknown category: ${cat}`);
      }
    }
  );
  
  // Parity surjection
  const integers = new Finite([0, 1, 2, 3, 4, 5]);
  const booleans = new Finite([false, true]);
  const parity = mkSurjection(
    integers,
    booleans,
    (n: number) => n % 2 === 0,
    (b: boolean) => b ? 0 : 1
  );
  
  return { modulo, stringLength, parity };
}
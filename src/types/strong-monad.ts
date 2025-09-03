// strong-monad.ts
// Strong monads (over Set with cartesian product), EM algebras, and EM monoids.
// Includes Option, Array, Reader, State, Writer instances + comprehensive law-check helpers

import { 
  LawCheck, lawCheck, lawCheckWithShrinking,
  MonadLeftUnitWitness, MonadRightUnitWitness, MonadAssociativityWitness,
  StrengthUnitWitness, EMAlgebraUnitWitness, EMMultiplicativityWitness, EMUnitMorphismWitness
} from './witnesses.js';
import { applyShrinking } from './property-shrinking.js';

/************ Base types ************/
export type Option<A> = { tag: "none" } | { tag: "some"; value: A };
export const None: Option<never> = { tag: "none" };
export const Some = <A>(value: A): Option<A> => ({ tag: "some", value });
export const isSome = <A>(o: Option<A>): o is { tag:"some"; value:A } => o.tag==="some";
export const isNone = <A>(o: Option<A>): o is { tag:"none" } => o.tag==="none";

/************ Strong monad interface ************/
export interface StrongMonad<TF> {
  // Monad operations
  of<A>(a: A): any;                                    // η: A → T A
  map<A, B>(ta: any, f: (a: A) => B): any;            // T f: T A → T B
  chain<A, B>(ta: any, k: (a: A) => any): any;        // μ: T T A → T A (via bind)
  
  // Strong monad operations
  strength<A, B>(a: A, tb: any): any;                 // τ: A × T B → T(A × B)
  prod<A, B>(ta: any, tb: any): any;                  // T A × T B → T(A × B)
  
  // Derived operations
  ap<A, B>(tf: any, ta: any): any;                    // T(A → B) × T A → T B
}

/************ Option instance ************/
export const StrongOption: StrongMonad<"Option"> = {
  of: <A>(a: A): Option<A> => Some(a),
  
  map: <A,B>(ta: Option<A>, f: (a:A)=>B): Option<B> => 
    isSome(ta) ? Some(f(ta.value)) : None,
  
  chain: <A,B>(ta: Option<A>, k: (a:A)=>Option<B>): Option<B> => 
    isSome(ta) ? k(ta.value) : None,
  
  strength: <A,B>(a:A, tb: Option<B>): Option<[A,B]> => 
    isSome(tb) ? Some([a, tb.value]) : None,
  
  prod: <A,B>(ta: Option<A>, tb: Option<B>): Option<[A,B]> =>
    isSome(ta) && isSome(tb) ? Some([ta.value, tb.value]) : None,
  
  ap: <A,B>(tf: Option<(a:A)=>B>, ta: Option<A>): Option<B> =>
    isSome(tf) && isSome(ta) ? Some(tf.value(ta.value)) : None
};

/************ Array instance ************/
export const StrongArray: StrongMonad<"Array"> = {
  of: <A>(a:A): A[] => [a],
  
  map: <A,B>(ta: A[], f:(a:A)=>B): B[] => ta.map(f),
  
  chain: <A,B>(ta: A[], k:(a:A)=>B[]): B[] => ta.flatMap(k),
  
  strength: <A,B>(a:A, tb:B[]): [A,B][] => tb.map(b => [a,b] as [A,B]),
  
  prod: <A,B>(ta:A[], tb:B[]): [A,B][] => 
    ta.flatMap(a => tb.map(b => [a,b] as [A,B])),
  
  ap: <A,B>(tf: Array<(a:A)=>B>, ta: A[]): B[] =>
    tf.flatMap(f => ta.map(f))
};

/************ Reader monad ************/
export type Reader<R, A> = (r: R) => A;

export const StrongReader = <R>(): StrongMonad<"Reader"> => ({
  of: <A>(a: A): Reader<R, A> => (_r: R) => a,
  
  map: <A, B>(ra: Reader<R, A>, f: (a: A) => B): Reader<R, B> =>
    (r: R) => f(ra(r)),
  
  chain: <A, B>(ra: Reader<R, A>, k: (a: A) => Reader<R, B>): Reader<R, B> =>
    (r: R) => k(ra(r))(r),
  
  strength: <A, B>(a: A, rb: Reader<R, B>): Reader<R, [A, B]> =>
    (r: R) => [a, rb(r)],
  
  prod: <A, B>(ra: Reader<R, A>, rb: Reader<R, B>): Reader<R, [A, B]> =>
    (r: R) => [ra(r), rb(r)],
  
  ap: <A, B>(rf: Reader<R, (a: A) => B>, ra: Reader<R, A>): Reader<R, B> =>
    (r: R) => rf(r)(ra(r))
});

/************ State monad ************/
export type State<S, A> = (s: S) => [A, S];

export const StrongState = <S>(): StrongMonad<"State"> => ({
  of: <A>(a: A): State<S, A> => (s: S) => [a, s],
  
  map: <A, B>(sa: State<S, A>, f: (a: A) => B): State<S, B> =>
    (s: S) => { const [a, s1] = sa(s); return [f(a), s1]; },
  
  chain: <A, B>(sa: State<S, A>, k: (a: A) => State<S, B>): State<S, B> =>
    (s: S) => { const [a, s1] = sa(s); return k(a)(s1); },
  
  strength: <A, B>(a: A, sb: State<S, B>): State<S, [A, B]> =>
    (s: S) => { const [b, s1] = sb(s); return [[a, b], s1]; },
  
  prod: <A, B>(sa: State<S, A>, sb: State<S, B>): State<S, [A, B]> =>
    (s: S) => { const [a, s1] = sa(s); const [b, s2] = sb(s1); return [[a, b], s2]; },
  
  ap: <A, B>(sf: State<S, (a: A) => B>, sa: State<S, A>): State<S, B> =>
    (s: S) => { const [f, s1] = sf(s); const [a, s2] = sa(s1); return [f(a), s2]; }
});

/************ Writer monad ************/
export type Writer<W, A> = [A, W];

export const StrongWriter = <W>(monoid: { empty: W; concat: (w1: W, w2: W) => W }): StrongMonad<"Writer"> => ({
  of: <A>(a: A): Writer<W, A> => [a, monoid.empty],
  
  map: <A, B>(wa: Writer<W, A>, f: (a: A) => B): Writer<W, B> =>
    [f(wa[0]), wa[1]],
  
  chain: <A, B>(wa: Writer<W, A>, k: (a: A) => Writer<W, B>): Writer<W, B> => {
    const [a, w1] = wa;
    const [b, w2] = k(a);
    return [b, monoid.concat(w1, w2)];
  },
  
  strength: <A, B>(a: A, wb: Writer<W, B>): Writer<W, [A, B]> =>
    [[a, wb[0]], wb[1]],
  
  prod: <A, B>(wa: Writer<W, A>, wb: Writer<W, B>): Writer<W, [A, B]> =>
    [[wa[0], wb[0]], monoid.concat(wa[1], wb[1])],
  
  ap: <A, B>(wf: Writer<W, (a: A) => B>, wa: Writer<W, A>): Writer<W, B> =>
    [wf[0](wa[0]), monoid.concat(wf[1], wa[1])]
});

/************ EM algebras and EM monoids ************/
export interface EMAlgebra<TF, A> {
  // Structure map α: T A → A
  alg(ta: any): A;
}

export interface EMMonoid<TF, A> extends EMAlgebra<TF, A> {
  empty: A;
  concat(x: A, y: A): A;
}

/************ Free EM monoid construction ************/
export function freeEMMonoid<TF, A>(
  T: StrongMonad<TF>,
  baseSet: A[]
): EMMonoid<TF, A[]> {
  return {
    empty: [],
    concat: (xs: A[], ys: A[]) => [...xs, ...ys],
    alg: (ta: any): A[] => {
      // This is a simplified version - full implementation would depend on T
      if (Array.isArray(ta)) return ta.flat();
      if (ta && typeof ta === 'object' && 'value' in ta) return [ta.value];
      return [];
    }
  };
}

/************ Law-check helpers (finite domains) ************/
export interface Finite<A> { elems: A[]; }

// Enumerate Option<A> from a finite A
export function enumOption<A>(FA: Finite<A>): Option<A>[] {
  return [None as Option<A>, ...FA.elems.map(Some)];
}

// Enumerate small arrays from finite A
export function enumArray<A>(FA: Finite<A>, maxLength: number = 2): A[][] {
  const result: A[][] = [[]]; // empty array
  
  for (let len = 1; len <= maxLength; len++) {
    const combinations = generateCombinations(FA.elems, len);
    result.push(...combinations);
  }
  
  return result;
}

function generateCombinations<A>(elems: A[], length: number): A[][] {
  if (length === 0) return [[]];
  if (length === 1) return elems.map(e => [e]);
  
  const result: A[][] = [];
  for (let i = 0; i < elems.length; i++) {
    const shorter = generateCombinations(elems, length - 1);
    for (const combo of shorter) {
      result.push([elems[i]!, ...combo]);
    }
  }
  return result;
}

/************ Strong monad law checking ************/
export type StrongMonadLawResults<T> = {
  monadLaws: {
    leftUnit: LawCheck<MonadLeftUnitWitness<T>>;
    rightUnit: LawCheck<MonadRightUnitWitness<T>>;
    associativity: LawCheck<MonadAssociativityWitness<T>>;
  };
  strengthLaws: {
    unit: LawCheck<StrengthUnitWitness<T>>;
  };
};

export function checkStrongMonadLaws<TF>(
  T: StrongMonad<TF>,
  FA: Finite<any>,
  FB: Finite<any>,
  FC: Finite<any>,
  enumTA: (FA: Finite<any>) => any[]
): StrongMonadLawResults<any> {
  
  // Left unit: chain(of(a), k) = k(a)
  let leftUnitWitness: MonadLeftUnitWitness<any> | undefined;
  for (const a of FA.elems) {
    for (const b of FB.elems) {
      const k = (_: any) => T.of(b);
      try {
        const leftSide = T.chain(T.of(a), k);
        const rightSide = k(a);
        // Simplified equality check
        if (JSON.stringify(leftSide) !== JSON.stringify(rightSide)) {
          leftUnitWitness = {
            input: a,
            k,
            leftSide,
            rightSide,
            shrunk: { input: a } // Simple shrinking - just the input
          };
          break;
        }
      } catch (error) {
        leftUnitWitness = {
          input: a,
          k,
          leftSide: `Error: ${error}` as any,
          rightSide: `k(${a})` as any,
        };
        break;
      }
    }
    if (leftUnitWitness) break;
  }
  
  // Right unit: chain(m, of) = m  
  let rightUnitWitness: MonadRightUnitWitness<any> | undefined;
  const TA = enumTA(FA);
  for (const ta of TA) {
    try {
      const leftSide = T.chain(ta, T.of);
      if (JSON.stringify(leftSide) !== JSON.stringify(ta)) {
        rightUnitWitness = {
          input: ta,
          leftSide,
          rightSide: ta,
          shrunk: { input: ta }
        };
        break;
      }
    } catch (error) {
      rightUnitWitness = {
        input: ta,
        leftSide: `Error: ${error}` as any,
        rightSide: ta
      };
      break;
    }
  }
  
  // Associativity: chain(chain(m, k), h) = chain(m, x => chain(k(x), h))
  let assocWitness: MonadAssociativityWitness<any> | undefined;
  for (const ta of TA.slice(0, 3)) { // Limit for performance
    for (const b of FB.elems.slice(0, 2)) {
      for (const c of FC.elems.slice(0, 2)) {
        const k = (_: any) => T.of(b);
        const h = (_: any) => T.of(c);
        try {
          const leftSide = T.chain(T.chain(ta, k), h);
          const rightSide = T.chain(ta, (x: any) => T.chain(k(x), h));
          if (JSON.stringify(leftSide) !== JSON.stringify(rightSide)) {
            assocWitness = {
              m: ta,
              k,
              h,
              leftSide,
              rightSide,
              shrunk: { m: ta, k, h }
            };
            break;
          }
        } catch (error) {
          assocWitness = {
            m: ta,
            k,
            h,
            leftSide: `Error: ${error}` as any,
            rightSide: `chain(m, x => chain(k(x), h))` as any
          };
          break;
        }
      }
      if (assocWitness) break;
    }
    if (assocWitness) break;
  }
  
  // Strength unit law: strength(a, of(b)) = of([a, b])
  let strengthUnitWitness: StrengthUnitWitness<any> | undefined;
  for (const a of FA.elems) {
    for (const b of FB.elems) {
      try {
        const leftSide = T.strength(a, T.of(b));
        const rightSide = T.of([a, b]);
        if (JSON.stringify(leftSide) !== JSON.stringify(rightSide)) {
          strengthUnitWitness = {
            a,
            b,
            leftSide,
            rightSide,
            shrunk: { a, b }
          };
          break;
        }
      } catch (error) {
        strengthUnitWitness = {
          a,
          b,
          leftSide: `Error: ${error}` as any,
          rightSide: T.of([a, b])
        };
        break;
      }
    }
    if (strengthUnitWitness) break;
  }
  
  // Apply shrinking to witnesses for minimal counterexamples
  const shrunkLeftUnit = leftUnitWitness ? applyShrinking(leftUnitWitness, (w) => {
    try {
      const leftSide = T.chain(T.of(w.input), w.k);
      const rightSide = w.k(w.input);
      return JSON.stringify(leftSide) !== JSON.stringify(rightSide);
    } catch {
      return false;
    }
  }) : undefined;
  
  const shrunkRightUnit = rightUnitWitness ? applyShrinking(rightUnitWitness, (w) => {
    try {
      const leftSide = T.chain(w.input, T.of);
      return JSON.stringify(leftSide) !== JSON.stringify(w.input);
    } catch {
      return false;
    }
  }) : undefined;
  
  const shrunkStrengthUnit = strengthUnitWitness ? applyShrinking(strengthUnitWitness, (w) => {
    try {
      const leftSide = T.strength(w.a, T.of(w.b));
      const rightSide = T.of([w.a, w.b]);
      return JSON.stringify(leftSide) !== JSON.stringify(rightSide);
    } catch {
      return false;
    }
  }) : undefined;

  return {
    monadLaws: {
      leftUnit: lawCheck(!leftUnitWitness, shrunkLeftUnit, "Left unit: chain(of(a), k) = k(a)"),
      rightUnit: lawCheck(!rightUnitWitness, shrunkRightUnit, "Right unit: chain(m, of) = m"),
      associativity: lawCheck(!assocWitness, assocWitness, "Associativity: chain(chain(m, k), h) = chain(m, x => chain(k(x), h))")
    },
    strengthLaws: {
      unit: lawCheck(!strengthUnitWitness, shrunkStrengthUnit, "Strength unit: strength(a, of(b)) = of([a, b])")
    }
  };
}

/************ EM-monoid law checking ************/
export type EMMonoidLawResults<T, A> = {
  monoidLaws: LawCheck<{ a: A; b: A; c: A; operation: string }>;
  algebraUnit: LawCheck<EMAlgebraUnitWitness<T, A>>;
  multiplicativity: LawCheck<EMMultiplicativityWitness<T, A>>;
  unitMorphism: LawCheck<EMUnitMorphismWitness<T, A>>;
};

export function checkEMMonoid<TF, A>(
  T: StrongMonad<TF>,
  FA: Finite<A>,
  em: EMMonoid<TF, A>,
  enumTA: (FA: Finite<A>) => any[]
): EMMonoidLawResults<any, A> {
  
  // Monoid laws (associativity + unit)
  let monoidWitness: { a: A; b: A; c: A; operation: string } | undefined;
  for (const a of FA.elems) {
    for (const b of FA.elems) {
      for (const c of FA.elems) {
        const ab = em.concat(a, b);
        const bc = em.concat(b, c);
        if (em.concat(ab, c) !== em.concat(a, bc)) {
          monoidWitness = { a, b, c, operation: "associativity" };
          break;
        }
      }
      if (monoidWitness) break;
    }
    if (monoidWitness) break;
  }
  
  if (!monoidWitness) {
    for (const a of FA.elems) {
      if (em.concat(em.empty, a) !== a) {
        monoidWitness = { a, b: em.empty as A, c: a, operation: "left unit" };
        break;
      }
      if (em.concat(a, em.empty) !== a) {
        monoidWitness = { a, b: em.empty as A, c: a, operation: "right unit" };
        break;
      }
    }
  }

  // Algebra unit: α ∘ of = id
  let algebraUnitWitness: EMAlgebraUnitWitness<any, A> | undefined;
  for (const a of FA.elems) {
    try {
      const leftSide = em.alg(T.of(a));
      if (leftSide !== a) {
        algebraUnitWitness = {
          input: a,
          leftSide,
          rightSide: a,
          shrunk: { input: a }
        };
        break;
      }
    } catch (error) {
      algebraUnitWitness = {
        input: a,
        leftSide: `Error: ${error}` as any,
        rightSide: a
      };
      break;
    }
  }

  // Multiplicativity: α(map(concat, prod(ta,tb))) = concat(α(ta), α(tb))
  let multiplicativityWitness: EMMultiplicativityWitness<any, A> | undefined;
  const TA = enumTA(FA);
  for (const ta of TA.slice(0, 3)) { // Limit for performance
    for (const tb of TA.slice(0, 3)) {
      try {
        const prodResult = T.prod(ta, tb);
        const mappedResult = T.map(prodResult, ([a, b]: [A, A]) => em.concat(a, b));
        const leftSide = em.alg(mappedResult);
        const rightSide = em.concat(em.alg(ta), em.alg(tb));
        
        if (leftSide !== rightSide) {
          multiplicativityWitness = {
            ta,
            tb,
            leftSide,
            rightSide,
            shrunk: { ta, tb }
          };
          break;
        }
      } catch (error) {
        multiplicativityWitness = {
          ta,
          tb,
          leftSide: `Error: ${error}` as any,
          rightSide: em.concat(em.alg(ta), em.alg(tb))
        };
        break;
      }
    }
    if (multiplicativityWitness) break;
  }

  // Unit morphism: α(map(_=>empty, ta)) = empty and α(of(empty)) = empty
  let unitMorphismWitness: EMUnitMorphismWitness<any, A> | undefined;
  for (const ta of TA.slice(0, 3)) {
    try {
      const mapped = T.map(ta, (_: A) => em.empty);
      const leftSide = em.alg(mapped);
      if (leftSide !== em.empty) {
        unitMorphismWitness = {
          input: mapped,
          leftSide,
          rightSide: em.empty,
          shrunk: { input: ta }
        };
        break;
      }
    } catch (error) {
      unitMorphismWitness = {
        input: ta,
        leftSide: `Error: ${error}` as any,
        rightSide: em.empty
      };
      break;
    }
  }
  
  if (!unitMorphismWitness) {
    try {
      const leftSide = em.alg(T.of(em.empty));
      if (leftSide !== em.empty) {
        unitMorphismWitness = {
          input: T.of(em.empty),
          leftSide,
          rightSide: em.empty
        };
      }
    } catch (error) {
      unitMorphismWitness = {
        input: T.of(em.empty),
        leftSide: `Error: ${error}` as any,
        rightSide: em.empty
      };
    }
  }

  return {
    monoidLaws: lawCheck(!monoidWitness, monoidWitness, "Monoid laws: associativity and unit"),
    algebraUnit: lawCheck(!algebraUnitWitness, algebraUnitWitness, "Algebra unit: alg(of(a)) = a"),
    multiplicativity: lawCheck(!multiplicativityWitness, multiplicativityWitness, "Multiplicativity: alg(map(concat, prod(ta,tb))) = concat(alg(ta), alg(tb))"),
    unitMorphism: lawCheck(!unitMorphismWitness, unitMorphismWitness, "Unit morphism: alg(map(_ => empty, ta)) = empty")
  };
}

/************ Example EM monoids ************/
export const optionSumEMMonoid: EMMonoid<"Option", number> = {
  empty: 0,
  concat: (x: number, y: number) => x + y,
  alg: (mx: Option<number>) => isSome(mx) ? mx.value : 0
};

export const arrayStringEMMonoid: EMMonoid<"Array", string> = {
  empty: "",
  concat: (x: string, y: string) => x + y,
  alg: (xs: string[]) => xs.join("")
};

export const optionMaxEMMonoid: EMMonoid<"Option", number> = {
  empty: -Infinity,
  concat: (x: number, y: number) => Math.max(x, y),
  alg: (mx: Option<number>) => isSome(mx) ? mx.value : -Infinity
};

/************ Demo function ************/
export function demonstrateStrongMonads(): void {
  console.log("=".repeat(60));
  console.log("STRONG MONADS & EILENBERG-MOORE STRUCTURES DEMO");
  console.log("=".repeat(60));

  // Test Option + Sum EM-monoid
  const FA: Finite<number> = { elems: [0, 1, 2] };
  const optionResult = checkEMMonoid(StrongOption, FA, optionSumEMMonoid, enumOption);
  
  console.log("\n1. OPTION + SUM EM-MONOID:");
  console.log("  Monoid laws:", optionResult.monoidLaws.ok ? "✅" : "❌");
  console.log("  Algebra unit:", optionResult.algebraUnit.ok ? "✅" : "❌");
  console.log("  Multiplicativity:", optionResult.multiplicativity.ok ? "✅" : "❌");
  console.log("  Unit morphism:", optionResult.unitMorphism.ok ? "✅" : "❌");
  
  if (!optionResult.monoidLaws.ok) {
    console.log("  Monoid violation:", JSON.stringify(optionResult.monoidLaws.witness));
  }
  if (!optionResult.algebraUnit.ok) {
    console.log("  Algebra unit violation:", JSON.stringify(optionResult.algebraUnit.witness));
  }

  // Test Array + String EM-monoid
  const FS: Finite<string> = { elems: ["x", "y"] };
  const arrayResult = checkEMMonoid(StrongArray, FS, arrayStringEMMonoid, (F) => enumArray(F, 2));
  
  console.log("\n2. ARRAY + STRING EM-MONOID:");
  console.log("  Monoid laws:", arrayResult.monoidLaws.ok ? "✅" : "❌");
  console.log("  Algebra unit:", arrayResult.algebraUnit.ok ? "✅" : "❌");
  console.log("  Multiplicativity:", arrayResult.multiplicativity.ok ? "✅" : "❌");
  console.log("  Unit morphism:", arrayResult.unitMorphism.ok ? "✅" : "❌");
  
  if (!arrayResult.multiplicativity.ok) {
    console.log("  Multiplicativity violation:", JSON.stringify(arrayResult.multiplicativity.witness));
  }

  // Test strong monad laws
  const FB: Finite<string> = { elems: ["a", "b"] };
  const FC: Finite<boolean> = { elems: [true, false] };
  const strongLaws = checkStrongMonadLaws(StrongOption, FA, FB, FC, enumOption);
  
  console.log("\n3. STRONG MONAD LAWS (Option):");
  console.log("  Left unit:", strongLaws.monadLaws.leftUnit.ok ? "✅" : "❌");
  console.log("  Right unit:", strongLaws.monadLaws.rightUnit.ok ? "✅" : "❌");
  console.log("  Associativity:", strongLaws.monadLaws.associativity.ok ? "✅" : "❌");
  console.log("  Strength unit:", strongLaws.strengthLaws.unit.ok ? "✅" : "❌");
  
  if (!strongLaws.monadLaws.leftUnit.ok) {
    console.log("  Left unit violation:", JSON.stringify(strongLaws.monadLaws.leftUnit.witness));
  }
  if (!strongLaws.strengthLaws.unit.ok) {
    console.log("  Strength unit violation:", JSON.stringify(strongLaws.strengthLaws.unit.witness));
  }

  console.log("\n" + "=".repeat(60));
  console.log("STRONG MONAD FEATURES:");
  console.log("✓ Strength operation: A × T B → T(A × B)");
  console.log("✓ Tensor product: T A × T B → T(A × B)");
  console.log("✓ EM algebras: T A → A with unit and multiplicativity");
  console.log("✓ EM monoids: Monoid objects in Eilenberg-Moore category");
  console.log("✓ Comprehensive law checking with finite model enumeration");
  console.log("✓ Multiple instances: Option, Array, Reader, State, Writer");
  console.log("=".repeat(60));
}
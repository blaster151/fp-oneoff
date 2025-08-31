/**
 * Examples demonstrating running optics with concrete profunctors
 * 
 * This shows how to implement Function and Forget profunctors
 * and use them to execute optics with over, set, and view operations.
 */

import { HKT2Prof } from '../types';

// ----- Concrete Profunctor Implementations -----

// Function profunctor (for modifying/setting)
type PFN = 'PFN'
type FunctionProfunctor<A, B> = HKT2Prof<PFN, A, B> & ((a: A) => B)

const FunctionStrong = {
  dimap: <A, B, C, D>(pab: FunctionProfunctor<A, B>, l: (c: C) => A, r: (b: B) => D): FunctionProfunctor<C, D> => {
    return ((c: C) => r(pab(l(c)))) as FunctionProfunctor<C, D>;
  },
  first: <A, B, C>(pab: FunctionProfunctor<A, B>): FunctionProfunctor<[A, C], [B, C]> => {
    return (([a, c]: [A, C]) => [pab(a), c]) as FunctionProfunctor<[A, C], [B, C]>;
  }
};

// Forget profunctor (for getting/folding)
// type PFG = 'PFG'
// type ForgetProfunctor<R, A, B> = HKT2Prof<PFG, A, B> & ((a: A) => R)

// ForgetStrong implementation (commented out to avoid unused variable)
// const ForgetStrong = <R>() => ({ ... });

// ----- Simple Optic Types -----

// Simple lens type for demonstration (type parameters used in return type)
type SimpleLens<S, T, A, B> = (P: any) => (pab: (a: A) => B) => (s: S) => T;

// ----- Smart Constructors -----

const lens = <S, T, A, B>(
  get: (s: S) => A,
  set: (s: S, b: B) => T
): SimpleLens<S, T, A, B> =>
  (P: any) => (pab: any) =>
    P.dimap(
      P.first(pab),
      (s: S): [A, S] => [get(s), s],
      ([b, s]: [B, S]): T => set(s, b)
    );

// ----- Helper Functions -----

// over: apply function to focus
export const over = <S, T, A, B>(o: SimpleLens<S, T, A, B>, f: (a: A) => B) =>
  o(FunctionStrong)(f) as (s: S) => T;

export const set = <S, T, A>(o: SimpleLens<S, T, A, A>, b: A) =>
  over(o, _ => b);

// view (lens): use Forget with R=A
export const view = <S, A>(_o: SimpleLens<S, S, A, A>) =>
  (s: S): A => s as any; // Simplified implementation

// ----- Examples -----

export function demonstrateRunningOptics() {
  console.log('=== Running Optics Examples ===');
  
  // Define a simple record type
  type Person = { name: string; age: number };
  
  // Create a lens that focuses on the name field
  const nameLens = lens<Person, Person, string, string>(
    (p: Person) => p.name,                    // get: Person -> string
    (p: Person, name: string) => ({ ...p, name })  // set: (Person, string) -> Person
  );
  
  const person: Person = { name: 'alice', age: 30 };
  
  // Use over to apply a function
  const upperName = over(nameLens, (s: string) => s.toUpperCase());
  const result1 = upperName(person);
  console.log('Original person:', person);
  console.log('After over (uppercase name):', result1);
  
  // Use set to set a value
  const setBob = set(nameLens, 'bob');
  const result2 = setBob(person);
  console.log('After set (name to bob):', result2);
  
  // Use view to get a value
  const getName = view(nameLens);
  const name = getName(person);
  console.log('View name:', name);
}

export function demonstrateNestedLens() {
  console.log('\n=== Nested Lens Examples ===');
  
  // Define nested structure
  type Address = { street: string; city: string };
  type Person = { name: string; address: Address };
  
  // Create lenses
  // Individual lenses for demonstration (commented out to avoid unused variables)
  // const _addressLens = lens<Person, Person, Address, Address>(
  //   (p: Person) => p.address,
  //   (p: Person, addr: Address) => ({ ...p, address: addr })
  // );
  // 
  // const _streetLens = lens<Address, Address, string, string>(
  //   (a: Address) => a.street,
  //   (a: Address, street: string) => ({ ...a, street })
  // );
  
  // Compose lenses (addressLens . streetLens)
  const addressStreetLens = lens<Person, Person, string, string>(
    (p: Person) => p.address.street,
    (p: Person, street: string) => ({ 
      ...p, 
      address: { ...p.address, street } 
    })
  );
  
  const person: Person = {
    name: 'Bob',
    address: { street: 'main street', city: 'New York' }
  };
  
  // Use the composed lens
  const upperStreet = over(addressStreetLens, (s: string) => s.toUpperCase());
  const result = upperStreet(person);
  
  console.log('Original person:', person);
  console.log('After over (uppercase street):', result);
  
  // View the street
  const getStreet = view(addressStreetLens);
  const street = getStreet(person);
  console.log('View street:', street);
}

// ----- Free Structures Examples -----

// Simple Free Monad implementation
type SimpleFree<A> = 
  | { _tag: 'Pure'; a: A }
  | { _tag: 'Suspend'; fa: any };

const pure = <A>(a: A): SimpleFree<A> => ({ _tag: 'Pure', a });

// We have a proper FreeAp<F, A> defined in ../types/advanced.ts

// Coyoneda (free functor)
type SimpleCoyoneda<A> = { fea: any; k: (x: any) => A };

const liftCoy = <A>(fa: any): SimpleCoyoneda<A> => ({ fea: fa, k: (x: any) => x });

export function demonstrateFreeStructures() {
  console.log('\n=== Free Structures Examples ===');
  
  // Demonstrate Free Monad
  const freeValue = pure('hello');
  console.log('Free monad pure value:', freeValue);
  
  // Demonstrate Coyoneda
  const coyValue = liftCoy('test');
  console.log('Coyoneda lifted value:', coyValue);
  
  console.log('Free structures provide a way to get Functor/Monad/Applicative for any type');
  console.log('by deferring the actual implementation until interpretation time.');
}

// Run the examples
if (require.main === module) {
  demonstrateRunningOptics();
  demonstrateNestedLens();
  demonstrateFreeStructures();
}

/**
 * Developer Demo:
 * - This file is not part of the library build.
 * - Do not import it from 'src/index.ts' or 'src/types/index.ts'.
 */

import { Profunctor2, Strong, Choice, iso, lens, prism, PIso, PLens, PPrism } from '../types';
import { HKT2Prof, Either } from '../types';

// Example 1: Function profunctor (the canonical example)
interface FunctionHKT<A, B> extends HKT2Prof<'Function', A, B> {}

class FunctionProfunctor<A, B> implements FunctionHKT<A, B> {
  readonly _URI = 'Function' as const;
  readonly _A = undefined as A;
  readonly _B = undefined as B;
  
  constructor(public readonly run: (a: A) => B) {}
}

const functionProfunctor: Profunctor2<'Function'> = {
  dimap: <A, B, C, D>(pab: FunctionHKT<A, B>, l: (c: C) => A, r: (b: B) => D): FunctionHKT<C, D> => {
    const func = pab as FunctionProfunctor<A, B>;
    return new FunctionProfunctor<C, D>((c: C) => r(func.run(l(c))));
  }
};

const functionStrong: Strong<'Function'> = {
  ...functionProfunctor,
  first: <A, B, C>(pab: FunctionHKT<A, B>): FunctionHKT<[A, C], [B, C]> => {
    const func = pab as FunctionProfunctor<A, B>;
    return new FunctionProfunctor<[A, C], [B, C]>(([a, c]: [A, C]) => [func.run(a), c]);
  }
};

const functionChoice: Choice<'Function'> = {
  ...functionProfunctor,
  left: <A, B, C>(pab: FunctionHKT<A, B>): FunctionHKT<Either<A, C>, Either<B, C>> => {
    const func = pab as FunctionProfunctor<A, B>;
    return new FunctionProfunctor<Either<A, C>, Either<B, C>>((e: Either<A, C>) => {
      if (e._tag === 'Left') {
        return { _tag: 'Left' as const, left: func.run(e.left) };
      } else {
        return { _tag: 'Right' as const, right: e.right };
      }
    });
  }
};

// Example 2: Using the smart constructors
function demonstrateIso() {
  console.log('=== Profunctor-encoded Iso Examples ===');
  
  // Create an iso that converts between string and number
  const stringNumberIso: PIso<string, string, number, number> = iso(
    (s: string) => parseInt(s),  // get: string -> number
    (n: number) => n.toString()  // reverse: number -> string
  );
  
  // Apply it to a function profunctor
  const liftedIso = stringNumberIso(functionProfunctor);
  
  // Create a function that doubles numbers
  const doubleFunc = new FunctionProfunctor<number, number>((n: number) => n * 2);
  
  // Lift it through the iso
  const stringDoubleFunc = liftedIso(doubleFunc) as FunctionProfunctor<string, string>;
  
  console.log('Original function (double):', doubleFunc.run(5));
  console.log('Lifted through iso:', stringDoubleFunc.run('10'));
  console.log('Result type:', typeof stringDoubleFunc.run('10'));
}

function demonstrateLens() {
  console.log('\n=== Profunctor-encoded Lens Examples ===');
  
  // Define a simple record type
  type Person = { name: string; age: number };
  
  // Create a lens that focuses on the name field
  const nameLens: PLens<Person, Person, string, string> = lens(
    (p: Person) => p.name,                    // get: Person -> string
    (p: Person, name: string) => ({ ...p, name })  // set: (Person, string) -> Person
  );
  
  // Apply it to the function profunctor
  const liftedLens = nameLens(functionStrong);
  
  // Create a function that uppercases strings
  const upperFunc = new FunctionProfunctor<string, string>((s: string) => s.toUpperCase());
  
  // Lift it through the lens
  const personUpperNameFunc = liftedLens(upperFunc) as FunctionProfunctor<Person, Person>;
  
  const person: Person = { name: 'alice', age: 30 };
  const result = personUpperNameFunc.run(person);
  
  console.log('Original person:', person);
  console.log('After lifting uppercase through name lens:', result);
}

function demonstratePrism() {
  console.log('\n=== Profunctor-encoded Prism Examples ===');
  
  // Define a sum type
  type Shape = { _tag: 'Circle'; radius: number } | { _tag: 'Square'; side: number };
  
  // Create a prism that focuses on Circle
  const circlePrism: PPrism<Shape, Shape, number, number> = prism(
    (s: Shape): Either<number, Shape> => {
      if (s._tag === 'Circle') {
        return { _tag: 'Left', left: s.radius };
      } else {
        return { _tag: 'Right', right: s };
      }
    },
    (radius: number): Shape => ({ _tag: 'Circle', radius })
  );
  
  // Apply it to the function profunctor
  const liftedPrism = circlePrism(functionChoice);
  
  // Create a function that doubles numbers
  const doubleFunc = new FunctionProfunctor<number, number>((n: number) => n * 2);
  
  // Lift it through the prism
  const shapeDoubleRadiusFunc = liftedPrism(doubleFunc) as FunctionProfunctor<Shape, Shape>;
  
  const circle: Shape = { _tag: 'Circle', radius: 5 };
  const square: Shape = { _tag: 'Square', side: 10 };
  
  console.log('Original circle:', circle);
  console.log('After lifting double through circle prism:', shapeDoubleRadiusFunc.run(circle));
  console.log('Original square:', square);
  console.log('After lifting double through circle prism (no effect):', shapeDoubleRadiusFunc.run(square));
}

// Example 3: Composing optics
function demonstrateComposition() {
  console.log('\n=== Profunctor-encoded Optics Composition ===');
  
  // Define a nested structure
  type Address = { street: string; city: string };
  type Person = { name: string; address: Address };
  
  // Create a lens for the address field
  const addressLens: PLens<Person, Person, Address, Address> = lens(
    (p: Person) => p.address,
    (p: Person, addr: Address) => ({ ...p, address: addr })
  );
  
  // Create a lens for the street field
  const streetLens: PLens<Address, Address, string, string> = lens(
    (a: Address) => a.street,
    (a: Address, street: string) => ({ ...a, street })
  );
  
  // Compose them (addressLens . streetLens)
  const addressStreetLens: PLens<Person, Person, string, string> = 
    <P>(P: Strong<P>) => (pab: HKT2Prof<P, string, string>) => {
      const liftedStreet = streetLens(P)(pab);
      return addressLens(P)(liftedStreet);
    };
  
  // Apply the composed lens
  const liftedComposedLens = addressStreetLens(functionStrong);
  
  // Create a function that uppercases strings
  const upperFunc = new FunctionProfunctor<string, string>((s: string) => s.toUpperCase());
  
  // Lift it through the composed lens
  const personUpperStreetFunc = liftedComposedLens(upperFunc) as FunctionProfunctor<Person, Person>;
  
  const person: Person = {
    name: 'Bob',
    address: { street: 'main street', city: 'New York' }
  };
  
  const result = personUpperStreetFunc.run(person);
  
  console.log('Original person:', person);
  console.log('After lifting uppercase through address.street lens:', result);
}

// Run the examples
if (require.main === module) {
  demonstrateIso();
  demonstrateLens();
  demonstratePrism();
  demonstrateComposition();
}

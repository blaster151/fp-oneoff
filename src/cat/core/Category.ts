// Core Category interface - the "generous arena" for mathematical structures
export interface Category<Obj, Mor> {
  id: (o: Obj) => Mor;
  compose: <A,B,C>(f: Mor, g: Mor) => Mor;
  
  // Optional: equality and law witnesses
  eqObj?: (a: Obj, b: Obj) => boolean;
  eqMor?: (f: Mor, g: Mor) => boolean;
  
  // Law witnesses for verification
  laws?: {
    leftIdentity?: <A>(obj: Obj, f: Mor) => boolean;
    rightIdentity?: <A>(obj: Obj, f: Mor) => boolean;
    associativity?: <A,B,C,D>(f: Mor, g: Mor, h: Mor) => boolean;
  };
}
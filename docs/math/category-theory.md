# Category Theory Mathematical Traceability

## [DEF-HFUNCTOR]
**Name:** HFunctor  
**Meaning:** Higher-order functor, not Haskell-functor  
**Formal role:** Endofunctor on [C, C], mapping natural transformations to natural transformations  
**Implemented:** src/category/HFunctor.ts  

## [DEF-LAN]
**Name:** Left Kan Extension  
**Meaning:** Left Kan extension of functor g along functor h  
**Formal role:** Lan h g c = ∀ b. Eq(h b, c) → g b  
**Implemented:** src/category/Lan.ts  

## [DEF-EQ]
**Name:** Equality  
**Meaning:** Equality relation between values of type T  
**Formal role:** Eq<T> = (x: T, y: T) => boolean  
**Implemented:** src/types/eq.ts  

## [DEF-NAT]
**Name:** Natural Transformation  
**Meaning:** Natural transformation between functors F and G  
**Formal role:** Nat<F<_>, G<_>> = <A>(fa: F<A>) => G<A>  
**Implemented:** src/category/Nat.ts
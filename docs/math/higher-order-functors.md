# Higher-Order Functors, Natural Transformations, and Lan

## [DEF-NAT]
**Natural transformation** `Nat F G` is a family of functions `F A -> G A` natural in `A`.
- Code: `src/category/Nat.ts` (`Nat1<F,G>`).
- Implication: Enables expressing hfmap laws: identity and composition.

## [DEF-HFUNCTOR]
**HFunctor** (higher-order functor): maps functors to functors and natural transformations to natural transformations.
- Code: `src/category/HFunctor.ts`, signature `hfmap :: Nat g h -> Nat (f g) (f h)`.
- Clarification: H = **Higher-order**, not "Haskell".
- Unlocks: Lift recursion schemes into GADT setting; law checks for identity/composition.

## [DEF-EQ]
Equality GADT witness `Eq<A,B>` (refl/sym/trans).
- Code: `src/category/Eq.ts`.
- Use: Modeling Eql in the paper; powering Lan encoding and type-directed casts.

## [DEF-LAN]
Left Kan extension encoded with equality:
`Lan h g c = ∀ b. Eq(h b, c) -> g b`.
- Code: `src/category/Lan.ts` (`Lan1` + `Apply`).
- Source: Ghani & Johann, *Foundations for Structured Programming in GADTs*, §3.3.
- Unlocks: Initial-algebra semantics of basic GADTs via higher-order functors.
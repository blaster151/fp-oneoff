# Sets, Classes, and Plural Talk (Smith §3)

**Claim.** Plural talk ("the widgets") is perfectly good logical practice and need not be eliminated into singular set-talk.

**Design tie-in.**
- We model **small categories** (e.g., `FinSet`) where objects are explicitly enumerated.
- We also model **large categories** (`Set`) where objects are plural/virtual: we never require enumeration, only identity and composition on morphisms.

**Why it matters.** Lets us encode categories like `Grp`, `Top`, `Set` without pretending their objects form a small set. This avoids the "procrustean" move of shoehorning pluralities into a single enumerated set.

**Operationalization.**
- `src/cat/core.ts`: `SmallCategory` vs `LargeCategory`.
- `src/cat/set/FinSet.ts`: enumerable finite sets.
- `src/cat/set/Set.ts`: large category of sets via type-witnessed objects.
- `U : FinGrp → Set`: forgetful functor with large codomain, functor laws tested by sampling.

*Source:* Peter Smith, *An Introduction to Category Theory*, §3, esp. 3.1–3.3.
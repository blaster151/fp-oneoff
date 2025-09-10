# First Isomorphism Theorem + (Co)limits + Recognition (Grp)

**Context.** Smith, *Introduction to Category Theory*, §2.4–§2.9.
- Iso ⇔ two-sided inverse (Thm 4); mono/epi via cancellability; ker/im links to subgroups; kernels normal; quotient via congruences; "identity up to iso."

**What we codified**
- `kernel`, `image` for finite groups; `firstIso` exposing φ: `G/ker(f) → im(f)`.
- `pullback` (fibered product) for finite diagrams.
- Placeholder `pushout` (amalgamated sum): returns `A×B` reps; to be upgraded to true quotient.
- Finite recognition helpers: `isInjective`⇔mono, `isSurjective`⇔epi, `isIso`⇔bijective (finite).

**Design stance**
- Plural idiom for "large" collections (Smith §3): we never require "the set of all groups."
- Witness-first: tests assert the universal properties we can check in the finite setting.

**Next**
- Replace `pushout` with actual amalgamated free product modulo normal closure and prove UP tests.
- Generalize `firstIso` proof sketch to non-finite (by witnesses rather than enumeration).
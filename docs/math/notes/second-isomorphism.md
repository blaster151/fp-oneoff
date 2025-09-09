# Second Isomorphism Theorem (Groups)

Let A ≤ G and N ⊴ G. Then AN is a subgroup of G, A∩N ⊴ A, and
(A N)/N ≅ A/(A∩N).

**Construction used in code.**
Inclusion i:A↪G, projection π:G→G/N, then apply the First Isomorphism Theorem to ψ = π∘i:
A/(A∩N) ≅ im(ψ) = {aN | a∈A} = (AN)/N.

**Files:** SecondIso.ts, tests in second-iso.spec.ts.

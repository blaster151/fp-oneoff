# Third Isomorphism Theorem (Groups)

Let K ⊴ G, N ⊴ G, and K ≤ N.
Then N/K ⊴ G/K and
(G/K)/(N/K) ≅ G/N.

**Construction used in code.**
Define θ: G/K → G/N by θ([g]_K) = [g]_N.
Then ker θ = N/K and θ is surjective, so by First Iso:
(G/K)/(N/K) ≅ im(θ) = G/N.

**Files:** ThirdIso.ts, tests in third-iso.spec.ts.

# Third Isomorphism Theorem (Groups)

Let \(K \trianglelefteq G\), \(N \trianglelefteq G\), and \(K \le N\).
Then \(N/K \trianglelefteq G/K\) and
\[
(G/K)/(N/K) \cong G/N.
\]

**Construction used in code.**
Define \(θ: G/K \to G/N\) by \(θ([g]_K) = [g]_N\).
Then \(\ker θ = N/K\) and \(θ\) is surjective, so by First Iso:
\((G/K)/(N/K) \cong \mathrm{im}(θ) = G/N\).

**Files:** `ThirdIso.ts`, tests in `third-iso.spec.ts`.
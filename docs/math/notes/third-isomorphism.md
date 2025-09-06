# Third Isomorphism Theorem (Groups)

Let \(N \trianglelefteq G\) and \(K \trianglelefteq G\) with \(N \le K\). Then \(K/N \trianglelefteq G/N\) and
\[
(G/N)/(K/N) \;\cong\; G/K.
\]

**Construction used in code.** Define the map \(f: G/N \to G/K\) by \(f(gN) = gK\). This is well-defined because if \(gN = g'N\), then \(g^{-1}g' \in N \le K\), so \(gK = g'K\). Apply the First Isomorphism Theorem to \(f\):
\[
(G/N)/(K/N) \;\cong\; G/K.
\]

**Files:** `ThirdIso.ts`, tests in `third-iso.test.ts`.
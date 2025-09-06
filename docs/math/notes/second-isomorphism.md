# Second Isomorphism Theorem (Groups)

Let \(A \le G\) and \(N \trianglelefteq G\). Then \(AN\) is a subgroup of \(G\), \(A\cap N \trianglelefteq A\), and
\[
(AN)/N \;\cong\; A/(A\cap N).
\]

**Construction used in code.** Inclusion \(i:A\hookrightarrow G\), projection \(π:G\to G/N\), then apply the First Isomorphism Theorem to \(ψ = π∘i\):
\[
A/(A\cap N) \;\cong\; \mathrm{im}(ψ) = \{\,aN \mid a\in A\,\} \;=\; (AN)/N.
\]

**Files:** `SecondIso.ts`, tests in `second-iso.spec.ts`.
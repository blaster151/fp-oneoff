# Kernel of a Group Homomorphism is Normal  (Smith §2.7, Thm 8)

**Claim.** For any homomorphism \(f:G\to H\), the kernel \(\ker f=\{g\in G\mid f(g)=e_H\}\) is a **normal** subgroup of \(G\).

**Reason.** Subgroup: \(f(e)=e\), \(f(xy)=f(x)f(y)\Rightarrow\) closed under product, and \(f(x^{-1})=f(x)^{-1}\Rightarrow\) closed under inverses.
Normal: for any \(g\in G, k\in\ker f\),
\(f(gkg^{-1})=f(g)f(k)f(g)^{-1}=f(g)e_H f(g)^{-1}=e_H\), so \(gkg^{-1}\in \ker f\).

**Operationalization.**
- `GroupHom.kernel(): NormalSubgroup<G>` constructs the kernel as a predicate witness.
- Tests on `q_n: ℤ→ℤ_n` show `ker(q_n)=nℤ`.
- Prepares First Isomorphism Theorem: implement `quotient(G, ker f)` and an explicit iso `G/ker f ≅ im f`.

*Source:* Smith, *Introduction to Category Theory*, §2.7 (Theorem 8).

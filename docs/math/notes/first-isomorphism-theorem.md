# First Isomorphism Theorem for Groups

**Theorem.** For any group homomorphism f:G→H with kernel K=ker f,
there is a canonical isomorphism G/K ≅ im f given by [g]↦f(g).

**Why well-defined?** If g' = gn with n∈K, then f(g')=f(g)f(n)=f(g)e=f(g).

**Code links.**
- analyzeGroupHom produces witnesses: kernelSubgroup, imageSubgroup.
- quotientGroup(G,K) constructs G/K as cosets.
- firstIsomorphism(f) returns a GroupIso between G/K and im f,
  with runtime inverse checks on finite carriers.

**Source.** Smith, Introduction to Category Theory, §2.7 (Homomorphisms and constructions).

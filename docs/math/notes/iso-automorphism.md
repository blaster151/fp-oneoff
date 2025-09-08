# Group Isomorphisms and Automorphisms (Smith §2.5–2.6)

**Definition.** A group isomorphism is a bijective homomorphism \(f:G\to H\).
If such an \(f\) exists, write \(G\cong H\). An automorphism is an isomorphism \(f:G\to G\).

**Theorem (Two-sided inverse characterization).**
A homomorphism \(f:G\to H\) is an isomorphism iff there exists a homomorphism \(g:H\to G\)
such that \(g\circ f = \mathrm{id}_G\) and \(f\circ g = \mathrm{id}_H\).

**Operationalization.**
- `Group`, `GroupHom`, `GroupIso` with witnesses of left/right inverse laws.
- `isIsomorphismByInverse` checks the theorem for finite groups exhaustively.
- Examples baked as tests: two-element groups iso; Aut(ℤ,+) = {id, neg}; Aut(ℚ,+) contains scalings.

*Source:* Smith, *Introduction to Category Theory*, §2.5–§2.6 (page with "Isomorphisms, automorphisms").
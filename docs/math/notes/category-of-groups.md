# Category of Groups (Smith §2.9; Def. 12)

**Definition.** A *category of groups* consists of:
- **Grp**: a class of groups \(G\),
- **Hom**: a class of homomorphisms \(f: G \to H\) between them,

such that:
1. **Sources/targets:** if \(f: G \to H\) is in Hom, then \(G,H \in \) Grp.
2. **Composition:** if \(f: G \to H\) and \(g: H \to J\) are in Hom, then \(g\circ f: G \to J\) is in Hom.
3. **Identity:** for each \(G \in \) Grp, the identity \(1_G: G\to G\) is in Hom.

**Laws (derived):** associativity of composition and identity laws.

**Code anchors.**
- `src/category/instances/GroupCategory.ts` implements id/compose and morphism equality.
- `src/algebra/group/EnhancedGroupHom.ts` implements homomorphisms with witnesses (`preservesOp/Id/Inv`).
- `test/algebra/group/group_category.test.ts` checks closure and category laws.

**Why this matters.** This is our first concrete category; later we'll reuse the same pattern for rings, posets, topological spaces, modules, etc., and we can uniformly apply categorical constructions (functors, natural transformations, limits/colimits) across them.

## Identical up to isomorphism (Smith §2.8–2.9)

- **Identical up to isomorphism.** Groups \(K_1,K_2,K_3\) (our Klein four-groups) are
  *identical up to isomorphism*: though one may use numbers and another symmetries of a rectangle,
  they share the same multiplication table modulo relabeling. Group theory generally ignores
  these "cosmetic" differences.

- **Abstract vs. concrete.**
  - *Concrete Klein group*: built from actual objects with independent natures (e.g. numbers,
    reflections). The multiplication table reflects how those objects interact.
  - *Abstract Klein group*: a purely structural entity, whose elements are just
    "points in the table," lacking non-group-theoretic properties. All that matters are
    their relations as encoded in the group law.

- **Philosophical note.** Saying *"the Klein group is abelian"* abstracts away from particular
  instantiations, speaking instead about the unique structure class \(V_4 \cong \mathbb{Z}_2 \times \mathbb{Z}_2\).
  Debate remains whether such "point-like" elements truly exist or whether they are only
  shorthand for equivalence across presentations.

**Operationalization.**
- TypeScript interface `Category` already exists → specialize as `GroupCategory`.
- Verify closure by implementing `composeHom(f, g)` and proving laws:
  - `compose(id, f) = f`, `compose(f, id) = f`.
  - `(h ∘ g) ∘ f = h ∘ (g ∘ f)`.
- Add tests: composition of homomorphisms preserves structure, identity is homomorphism.

*Source:* Smith, *Introduction to Category Theory*, §2.9 ("Categories of groups").
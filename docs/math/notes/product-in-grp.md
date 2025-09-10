# Product in \(\mathbf{Grp}\) (Smith §2.3, §2.9)

**Construction.** \(G\times H\) with componentwise operation; projections \(\pi_1,\pi_2\).  
**Universal property.** For any \(K \xrightarrow{f} G, K \xrightarrow{g} H\) there is a unique
\(\langle f,g\rangle : K \to G\times H\) with \(\pi_1\circ\langle f,g\rangle=f\), \(\pi_2\circ\langle f,g\rangle=g\).

**Implementation Details:**
- Product group: `P = { elems: [a,b] | a ∈ G, b ∈ H }`
- Operations: `(a₁,b₁) ∘ (a₂,b₂) = (a₁ ∘_G a₂, b₁ ∘_H b₂)`
- Identity: `e_P = (e_G, e_H)`
- Inverses: `(a,b)⁻¹ = (a⁻¹, b⁻¹)`

**Universal Property Verification:**
- Given `K → G` and `K → H`, constructs unique `K → G×H`
- Satisfies commutative diagrams: `π₁ ∘ ⟨f,g⟩ = f` and `π₂ ∘ ⟨f,g⟩ = g`
- Uniqueness verified pointwise on finite groups

**Category Theory Connection:**
This realizes the categorical product in **Grp**, showing that the category of groups has finite products.

*Code:* `src/algebra/group/GroupProduct.ts`  
*Tests:* `test/algebra/group/product_universal_property.test.ts`
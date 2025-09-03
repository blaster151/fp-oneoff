# Higher Categories and 2-Categorical Structures (collection)

## [DEF-2CAT]
id: DEF-2CAT
tags: [2-category, higher, bicategory]
source: canonical:"2-category with 0-cells, 1-cells, 2-cells"
---
**Definition (LaTeX)**  
A 2-category consists of:
- 0-cells (objects)
- 1-cells (morphisms between objects)  
- 2-cells (morphisms between 1-cells)

With vertical composition \(\bullet\) and horizontal composition \(\circ\circ\).

**Structure**  
- Identity 1-cells: \(\text{id}_A\) for each 0-cell \(A\)
- Identity 2-cells: \(\text{id}_f\) for each 1-cell \(f\)
- Composition: 1-cell composition and 2-cell vertical/horizontal composition

**Laws**  
- Associativity for both 1-cell and 2-cell composition
- Unital laws for identity 1-cells and 2-cells
- Interchange law: \((\delta \bullet \gamma) \circ\circ (\beta \bullet \alpha) = (\delta \circ\circ \beta) \bullet (\gamma \circ\circ \alpha)\)

**Implications (TS)**  
- `TwoCategory<Obj, One, Two>` interface
- Vertical and horizontal composition operations
- Whiskering operations for mixed composition

**Future unlocks**  
- Bicategories with weak composition and coherence
- Tricategories and higher-dimensional structures
- Applications to homotopy theory and higher algebra

## [EX-2CAT-CAT]
id: EX-2CAT-CAT
tags: [cat, 2-category, functors, naturality]
source: canonical:"Cat as fundamental 2-category"
---
**Definition**  
The 2-category \(\mathbf{Cat}\) has:
- 0-cells: Categories
- 1-cells: Functors between categories
- 2-cells: Natural transformations between functors

**Composition**  
- 1-cell: Functor composition \(G \circ F\)
- 2-cell vertical: \((\beta \bullet \alpha)_A = \beta_A \circ \alpha_A\)
- 2-cell horizontal: Via whiskering and vertical composition

**Properties**  
- Fundamental example of 2-category
- Models categorical reasoning with natural transformations
- Foundation for higher category theory

**Implications (TS)**  
- `Cat2(A)` constructs the 2-category Cat
- Natural transformation interface with components
- Interchange law verification for Cat

**Test Hook**  
`src/types/__tests__/cat2-basic.test.ts`

**Future unlocks**  
- Weak 2-categories and bicategories
- Higher-dimensional natural transformations
- Applications to homotopy type theory

## [LAW-INTERCHANGE]
id: LAW-INTERCHANGE
tags: [2-category, interchange, coherence]
source: canonical:"Fundamental 2-category coherence condition"
---
**Law (LaTeX)**  
For 2-cells in a 2-category:
\[(\delta \bullet \gamma) \circ\circ (\beta \bullet \alpha) = (\delta \circ\circ \beta) \bullet (\gamma \circ\circ \alpha)\]

**Interpretation**  
Vertical composition distributes over horizontal composition (and vice versa).

**Geometric Meaning**  
Pasting 2-cells in a rectangle can be done by composing vertically then horizontally, or horizontally then vertically, with the same result.

**Implications (TS)**  
- Core coherence condition for 2-category implementation
- Verification via `eq2` comparison in tests
- Foundation for higher coherence conditions

**Test Hook**  
Interchange law verification in Cat2 tests

**Future unlocks**  
- Higher coherence conditions for weak structures
- Coherence theorems and strictification
- Applications to operads and higher algebra
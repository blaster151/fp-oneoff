# `K f h a = Lan h (f (g a))` — How it maps to this codebase

> From Ghani & Johann, *Foundations for Structured Programming in GADTs*, §3.3.
> The constructor of a basic GADT can be interpreted via a **left Kan extension**:
> \[
>   K\, f\, h\, a \;=\; \mathrm{Lan}\;h\;(f \circ g)\;a
> \]
> where `g` is the functor parameter of the GADT and `h` is the index transformer (e.g. successor on Peano naturals).

## Objects in our repository

- **Equality GADT witness** `Eq<A,B>` (Eql in the paper)  
  – File: `src/category/Eq.ts` (refl/sym/compose).  
  – Used to encode the equality guarding the `Lan` application.

- **Natural transformations** and **higher-order functors**  
  – `Nat1<F,G>`: `src/category/Nat.ts`  
  – `HFunctor<F>` + laws: `src/category/HFunctor.ts`  
  – **Composition** of higher-order functors: `src/category/HComp.ts`

- **Left Kan extension** (paper's encoding)  
  – `Lan1<H,G,C> = ∀B. Eq<H<B>, C> -> G<B>` in `src/category/Lan.ts`  
  – **Lan as an HFunctor**: `src/category/HFunctor.Lan.ts` (lift `Nat` through `Lan`)

- **Higher-order fixpoint and folds**  
  – `HFix`, `hcata`, node-local higher-order mapper: `src/higher/HFix.ts`  
  – Composition-compat fold demo: `src/higher/__tests__/hcata.compose.demo.test.ts`

- **Executable basic GADTs via Lan**  
  - Finite elements **BFin**:  
    – Lan constructor: `src/gadt/basic/BFin.Lan.ts`  
    – Tests: `src/gadt/basic/__tests__/bfin.lan.test.ts`
  - Length-indexed vectors **Vec**:  
    – Lan constructor: `src/gadt/basic/Vec.Lan.ts`  
    – Tests: `src/gadt/basic/__tests__/vec.test.ts`

## Diagram (typed)
                    Nat (natural transformations)
                         │
                         ▼
```
HFunctor F : [Set→Set] → [Set→Set]         HFunctor (Lan h) : [Set→Set] → [Set→Set]
 │                                            │
 └──── hfmap : Nat g k → Nat (F g) (F k) ─────┘
 │
 ▼
 HComp(F, Lan h)  (src/category/HComp.ts)
 │
 ▼
 Node family stores data under Wrap ∘ Lan h (example)
 with node-local mapper using either:
 • composed lifting: HComp(F, Lan h).hfmap
 • sequential lifting: F.hfmap ∘ (Lan h).hfmap
 (src/higher/__tests__/hcata.compose.demo.test.ts)

K f h a  ≅  Lan h (f (g a))
 • Equality guard Eq<h b, a> ensures only appropriate indices contribute.
 • Our `Lan1` uses Eq to route the correct `b` at runtime.
 • BFin / Vec constructors apply Lan at `b = a` with Eq refl<h a, a>.

## What the tests "prove" operationally

- `HComp` respects `hfmap` composition on concrete data (`test:cat:hcomp:lan`).  
- `hcata` over a node family that stores children under **Wrap∘Lan** yields the **same result** whether the node mapper uses the *composed* lift or the *sequential* composition of lifts.  
- The **Lan constructors** for `BFin` and `Vec` are faithful to §3.3: they apply a `Lan` value at the equality witness for the intended index and then rewrap (`zero/succ`, `cons`) accordingly.

## Traceability tags (add to your registry)

- `[DEF-LAN]` → `src/category/Lan.ts`  
- `[DEF-HFUNCTOR]` → `src/category/HFunctor.ts`  
- `[DEF-HCOMP]` → `src/category/HComp.ts`  
- `[LAN-HFUNCTOR]` → `src/category/HFunctor.Lan.ts`  
- `[HCATA-COMP]` → `src/higher/__tests__/hcata.compose.demo.test.ts`  
- `[BASIC-BFIN-LAN]` → `src/gadt/basic/BFin.Lan.ts`  
- `[BASIC-VEC-LAN]` → `src/gadt/basic/Vec.Lan.ts`